const { existsSync, unlinkSync, readdirSync } = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { ASSETS, DB, BACKUPS_GC } = require("./assets/constants");
const { PROJECT, DEVICE, IMAGE, SCRIPT, SITE, DAEMON, POOL } = require("./constants");
const db = require("./db");
const { asset } = require("./fs");

// Safety: лимит на удаление за один запуск. Защита от лавины из-за регрессий.
// Override через cleanup(pool, { force: true }) — для ручного first-run после
// долгого накопления orphan'ов.
const MAX_DELETE_PER_RUN = 50;

// Safety: никогда не удалять физические id (MAC и UUID/path-каналы).
// MAC-формат — физические устройства, 1-Wire slaves могут быть оторваны от
// mark-структуры. UUID/path/N — подканалы (например IntesisBox/modbus/1).
const MAC_RE = /^([0-9a-f]{2}:){5}[0-9a-f]{2}/i;
function isPhysicalId(id) {
  return MAC_RE.test(id) || id.includes('/');
}

// Опциональный event-log для audit-trail удалений
let eventLog = null;
try {
  const m = require("./logging/event-log");
  if (m && typeof m.add === "function") eventLog = m;
} catch (e) { /* модуль не подключён — это норма */ }

function isNumber(str) {
  return /^[0-9]+$/.test(str);
}

const build = (id, pool, state, assets) => {
  if (state[id]) return;
  const subject = pool[id];
  if (!subject) return;
  state[id] = subject;
  for (const [k, v] of Object.entries(subject)) {
    if (isNumber(k)) {
      delete subject[k];
      db.put(id, JSON.stringify(subject));
    } else if (v) {
      if (typeof v === 'string') {
        switch (k) {
          case PROJECT: {
            build(v, pool, state, assets);
            break;
          }
          case IMAGE: {
            if (!assets.includes(v)) {
              assets.push(v);
            }
          }
        }
      } else if (Array.isArray(v)) {
        switch (k) {
          case SITE:
          case SCRIPT: {
            for (const i of v) {
              build(i, pool, state, assets);
            }
            break;
          }
          case DEVICE: {
            for (const d of v) {
              for (const i of d) {
                if (i.startsWith(`${d}/`)) {
                  state[i] = pool[i]
                }
              }
              state[d] = pool[d];
            }
            break;
          }
          default: {
            switch (subject.type) {
              case DAEMON:
              case PROJECT:
              case SITE:
              case SCRIPT: {
                for (const i of v) {
                  build(i, pool, state, assets);
                }
                break;
              }
            }
            break;
          }
        }
      }
    }
  }
};

// buildAll — универсальный mark, обходит ВСЕ массивы и string-UUID
// рекурсивно. Используется в cleanup, покрывает баги 1 и 4 из INC-049
// (DEVICE-каналы через любое поле, любой type).
const buildAll = (id, pool, state, assets) => {
  if (state[id]) return;
  const subject = pool[id];
  if (!subject) return;
  state[id] = subject;
  for (const [k, v] of Object.entries(subject)) {
    if (!v) break;
    switch (k) {
      case IMAGE: {
        if (!assets.includes(v)) {
          assets.push(v);
          break;
        }
      }
      default: {
        if (Array.isArray(v)) {
          for (const i of v) {
            buildAll(i, pool, state, assets);
          }
        } else if (typeof v === 'string') {
          buildAll(v, pool, state, assets);
        }
      }
    }
  }
};

// Бэкап LevelDB в var/backups/gc/db-<ts>.tar.gz перед удалением.
// Возвращает путь или null при ошибке.
function backupDb() {
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const backupPath = path.join(BACKUPS_GC, `db-${ts}.tar.gz`);
    execSync(`tar czf ${backupPath} -C ${path.dirname(DB)} ${path.basename(DB)}`);
    console.log(`[gc] backup: ${backupPath}`);
    return backupPath;
  } catch (e) {
    console.error(`[gc] backup FAILED: ${e.message}`);
    return null;
  }
}

// cleanup(pool, options) — mark-and-sweep garbage collector с safety-механизмами.
// options:
//   force=true → пропустить лимит MAX_DELETE_PER_RUN
module.exports.cleanup = (pool, options = {}) => {
  const state = {};
  const assets = [];
  buildAll(pool.mac, pool, state, assets);

  // Shell-mark: shell вызывается по СТРОКЕ-команде через ACTION_SHELL_START.
  // buildAll не доходит до shell через command-строку. Дополнительный проход
  // помечает все shell с тем же command что у достижимого ACTION_SHELL_START.
  const shellCommandsInUse = new Set();
  for (const id of Object.keys(state)) {
    const a = state[id];
    if (a && a.type === 'ACTION_SHELL_START' && a.payload && a.payload.command) {
      shellCommandsInUse.add(a.payload.command);
    }
  }
  for (const [shellId, shell] of Object.entries(pool)) {
    if (state[shellId]) continue;
    if (shell && shell.type === 'shell' && shellCommandsInUse.has(shell.command)) {
      state[shellId] = shell;
    }
  }

  // Сбор orphan-объектов (исключая физические id и keep-помеченные)
  const toDelete = [];
  for (const k of Object.keys(pool)) {
    if (k === 'mac') continue;
    if (k === POOL) continue;
    if (isPhysicalId(k)) continue;  // MAC и UUID/path/N не удаляются никогда
    if (state[k] !== undefined) continue;
    // Whitelist через payload-флаг keep: true
    if (pool[k] && pool[k].keep === true) continue;
    toDelete.push(k);
  }

  if (toDelete.length === 0) {
    console.log(`[gc] no orphans, nothing to do`);
    return { deleted: 0 };
  }

  // Safety: лимит на удалений
  if (toDelete.length > MAX_DELETE_PER_RUN && !options.force) {
    console.error(`[gc] ABORT: would delete ${toDelete.length} objects (> ${MAX_DELETE_PER_RUN} limit). Run with {force:true} to override.`);
    return { deleted: 0, wouldDelete: toDelete.length, aborted: true };
  }

  // Бэкап перед любым удалением
  const backupPath = backupDb();
  if (!backupPath) {
    console.error(`[gc] ABORT: backup failed, refuse to delete without backup`);
    return { deleted: 0, wouldDelete: toDelete.length, aborted: true };
  }

  // Удаление + audit-trail
  for (const k of toDelete) {
    const oldState = pool[k];
    delete pool[k];
    db.del(k);
    if (eventLog) {
      try {
        eventLog.add(k, oldState, null, { source: "gc" }, { type: "GC_CLEANUP" });
      } catch (e) { /* не ломать gc из-за event-log */ }
    }
  }
  console.log(`[gc] deleted ${toDelete.length} orphan objects (backup: ${backupPath})`);

  // Чистка orphan-ассетов
  for (const i of readdirSync(ASSETS)) {
    if (!assets.includes(i)) {
      const a = asset(i);
      if (existsSync(a)) {
        unlinkSync(a);
      }
    }
  }

  return { deleted: toDelete.length, backupPath };
};
