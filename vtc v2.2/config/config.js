/**
 * Configuración general de la aplicación VTV Notifier v2.2
 */

const CONFIG = {
    // Archivos principales
    EXCEL_FILE: 'datos_vehiculos_real.xlsx',
    LOG_FILE: 'logs/notificaciones.log',
    ERROR_FILE: 'errores/errores_envio.xlsx',
    PROCESSED_FILE: 'procesados/procesados.xlsx',

    // Configuración de notificaciones
    MAX_NOTIFICATIONS_PER_RUN: 20,
    DEFAULT_TARGET_YEAR: 2025,
    AVAILABLE_YEARS: [2024, 2025, 2026],
    // TARGET_MONTH y TARGET_YEAR se seleccionarán dinámicamente

    // Configuración de WhatsApp
    WHATSAPP_CONFIG: {
        authStrategy: 'LocalAuth',
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection'
            ],
            defaultViewport: null,
            devtools: false
        }
    },

    // Configuración de tiempo de espera
    RETRY_ATTEMPTS: 3,
    RECONNECTION_DELAY: 5000,
    MESSAGE_DELAY_MIN: 10000,
    MESSAGE_DELAY_MAX: 20000,

    // Configuración de fechas
    DATE_FORMAT: 'MM/DD/YY',
    DISPLAY_DATE_FORMAT: 'DD/MM/YYYY',

    // Configuración de teléfonos
    COUNTRY_CODE: '54',
    PHONE_MIN_LENGTH: 13, // 549 + 10 dígitos mínimo
    PHONE_MAX_LENGTH: 15
};

module.exports = {
    CONFIG
};