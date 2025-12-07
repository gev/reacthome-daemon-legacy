# Настройка ротации логов PM2

## Важность изменений

**Критическая проблема:** PM2 логи могут занимать **несколько гигабайт** дискового пространства, что приводит к:
- ❌ **Переполнению диска** (100% использование)
- ❌ **Ошибкам записи в БД** (`No space left on device`)
- ❌ **Остановке демона** из-за нехватки места
- ❌ **Потере данных** и невозможности работы системы

**Решение:** Системный `logrotate` автоматически ротирует логи, предотвращая переполнение диска.

**Преимущества:**
- ✅ Не требует дополнительных зависимостей (уже в системе)
- ✅ Стандартное решение Linux
- ✅ Простая настройка (один файл)
- ✅ Автоматическая работа через системный cron

## Быстрая настройка

### Автоматическая установка

```bash
export REACTHOME_PI_PASS='ваш_пароль'
./scripts/system/setup-system-logrotate.sh
```

### Ручная установка

1. Создайте файл `/etc/logrotate.d/pm2`:

```bash
sudo nano /etc/logrotate.d/pm2
```

2. Добавьте конфигурацию:

```
/home/pi/.pm2/logs/*.log {
    daily
    rotate 10
    compress
    delaycompress
    missingok
    notifempty
    create 0640 pi pi
    sharedscripts
    postrotate
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}

/home/pi/.pm2/pm2.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 0640 pi pi
}
```

3. Установите права:

```bash
sudo chmod 644 /etc/logrotate.d/pm2
sudo chown root:root /etc/logrotate.d/pm2
```

## Параметры

- `daily` — ежедневная ротация
- `rotate 10` — хранить 10 файлов (~10 дней)
- `compress` — сжатие старых логов
- `delaycompress` — сжатие через день
- `postrotate` — перезапуск файловых дескрипторов PM2

## Проверка

```bash
# Проверка конфигурации
sudo logrotate -d /etc/logrotate.d/pm2

# Тестовая ротация
sudo logrotate -f /etc/logrotate.d/pm2

# Размер логов
du -sh ~/.pm2/logs/
```

## Устранение неполадок

**Логи не ротируются:**
```bash
sudo logrotate -d /etc/logrotate.d/pm2  # Проверка конфигурации
systemctl status cron                    # Проверка cron
```

**PM2 не пишет в лог после ротации:**
```bash
pm2 reloadLogs  # Перезапуск файловых дескрипторов
```

**Логи занимают много места:**
```bash
sudo logrotate -f /etc/logrotate.d/pm2  # Принудительная ротация
rm ~/.pm2/logs/*.log.*.gz                # Удаление старых сжатых логов
```

## Почему системный logrotate?

| Характеристика | Системный logrotate | pm2-logrotate |
|---------------|---------------------|---------------|
| Зависимости | ✅ Нет | ❌ Требует установки |
| Настройка | ✅ Один файл | ⚠️ Команды pm2 set |
| Стандартность | ✅ Стандарт Linux | ⚠️ Специфично для PM2 |

**Вывод:** Системный `logrotate` проще и не требует зависимостей.
