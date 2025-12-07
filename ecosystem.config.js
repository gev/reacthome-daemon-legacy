/**
 * PM2 Ecosystem Configuration
 * 
 * Конфигурация для управления процессами через PM2:
 * - daemon: основной демон ReactHome
 * - event-logger: сервис логирования событий
 */

module.exports = {
  apps: [
    {
      name: 'reacthome-daemon',
      script: 'daemon.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        EVENT_LOGGING_ENABLED: 'true', // Встроенное логирование (отключить после перехода на event-logger)
      },
      error_file: './var/log/daemon-error.log',
      out_file: './var/log/daemon-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
    {
      name: 'reacthome-event-logger',
      script: 'event-logger.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        DAEMON_WS_URL: "ws://192.168.88.4:3000",
        OPENSEARCH_ENABLED: 'true',
        OPENSEARCH_INDEX_PREFIX: 'reacthome-events-test', // Временно для тестирования
        // Остальные переменные берутся из .env файла или системного окружения
        // OPENSEARCH_URL, OPENSEARCH_USER, OPENSEARCH_PASSWORD, OPENSEARCH_CA_CERT
      },
      env_production: {
        OPENSEARCH_INDEX_PREFIX: 'reacthome-events', // Основной индекс для production
      },
      error_file: './var/log/event-logger-error.log',
      out_file: './var/log/event-logger-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      // Перезапуск с задержкой при ошибках
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
