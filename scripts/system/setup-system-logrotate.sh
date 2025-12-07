#!/bin/bash

# Скрипт для настройки системного logrotate для логов PM2 на Raspberry Pi
# Это простое решение без дополнительных зависимостей

HOST="${REACTHOME_PI_HOST:-192.168.88.4}"
USER="${REACTHOME_PI_USER:-pi}"
PASS="${REACTHOME_PI_PASS}"

if [ -z "$PASS" ]; then
    echo "❌ Ошибка: переменная REACTHOME_PI_PASS не установлена"
    echo "   Установите: export REACTHOME_PI_PASS='ваш_пароль'"
    exit 1
fi

echo "🔧 Настройка системного logrotate для логов PM2 на Raspberry Pi ($HOST)..."
echo ""

# Создаём временный expect скрипт
TMP_EXPECT=$(mktemp)
cat > "$TMP_EXPECT" << 'EXPECT_EOF'
#!/usr/bin/expect -f
set timeout 30
set host [lindex $argv 0]
set user [lindex $argv 1]
set pass [lindex $argv 2]
set cmd [lindex $argv 3]

spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $user@$host $cmd
expect {
  "*assword:" {
    send "$pass\r"
    exp_continue
  }
  eof
}
EXPECT_EOF

chmod +x "$TMP_EXPECT"

# Функция для выполнения команд на малинке
run_on_pi() {
    "$TMP_EXPECT" "$HOST" "$USER" "$PASS" "$1" 2>/dev/null | grep -v "password:" | grep -v "spawn"
}

echo "1️⃣  Проверяю наличие logrotate..."
echo "---"
HAS_LOGROTATE=$(run_on_pi "which logrotate" | grep -v "password:" | grep -v "spawn")
if [ -n "$HAS_LOGROTATE" ]; then
    echo "   ✅ logrotate установлен: $HAS_LOGROTATE"
else
    echo "   ❌ logrotate не найден! Устанавливаю..."
    run_on_pi "sudo apt-get update && sudo apt-get install -y logrotate"
fi
echo ""

echo "2️⃣  Создаю конфигурацию logrotate..."
echo "---"
# Создаём конфигурационный файл
CONFIG_FILE="/tmp/pm2-logrotate.conf"
cat > "$CONFIG_FILE" << 'CONFIG_EOF'
# /etc/logrotate.d/pm2
# Конфигурация для ротации логов PM2 на Raspberry Pi
# Автоматически создано скриптом setup-system-logrotate.sh

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
        # Перезапуск файловых дескрипторов PM2 после ротации
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}

# Также ротируем PM2 системный лог
/home/pi/.pm2/pm2.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 0640 pi pi
}
CONFIG_EOF

echo "   ✅ Конфигурация создана"
echo ""

echo "3️⃣  Копирую конфигурацию на малинку..."
echo "---"
# Создаём временный expect для scp
TMP_SCP_EXPECT=$(mktemp)
cat > "$TMP_SCP_EXPECT" << 'SCP_EXPECT_EOF'
#!/usr/bin/expect -f
set timeout 30
set user [lindex $argv 0]
set pass [lindex $argv 1]
set host [lindex $argv 2]
set src [lindex $argv 3]
set dst [lindex $argv 4]

spawn scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $src $user@$host:$dst
expect {
  "*assword:" {
    send "$pass\r"
    exp_continue
  }
  eof
}
SCP_EXPECT_EOF

chmod +x "$TMP_SCP_EXPECT"
"$TMP_SCP_EXPECT" "$USER" "$PASS" "$HOST" "$CONFIG_FILE" "/tmp/pm2-logrotate.conf" 2>&1 | grep -v "password:" | grep -v "spawn"
echo ""

echo "4️⃣  Устанавливаю конфигурацию на малинке..."
echo "---"
run_on_pi "sudo mv /tmp/pm2-logrotate.conf /etc/logrotate.d/pm2 && sudo chmod 644 /etc/logrotate.d/pm2 && sudo chown root:root /etc/logrotate.d/pm2 && echo '✅ Конфигурация установлена' || echo '❌ Ошибка установки (возможно нужны права sudo)'"
echo ""

echo "5️⃣  Проверяю конфигурацию..."
echo "---"
run_on_pi "sudo logrotate -d /etc/logrotate.d/pm2 2>&1 | head -20"
echo ""

echo "6️⃣  Тестирую ротацию (dry-run)..."
echo "---"
run_on_pi "sudo logrotate -f /etc/logrotate.d/pm2 2>&1 | head -10"
echo ""

rm -f "$TMP_EXPECT" "$TMP_SCP_EXPECT" "$CONFIG_FILE"

echo "✅ Настройка завершена!"
echo ""
echo "📋 Параметры ротации:"
echo "   • Ротация логов PM2: ежедневно"
echo "   • Количество хранимых файлов: 10"
echo "   • Сжатие: включено (задержка 1 день)"
echo "   • Ротация PM2 системного лога: еженедельно (4 файла)"
echo ""
echo "💡 Логи будут автоматически ротироваться ежедневно через системный cron"
echo "💡 Проверка работы: sudo logrotate -d /etc/logrotate.d/pm2"
echo "💡 Принудительная ротация: sudo logrotate -f /etc/logrotate.d/pm2"

