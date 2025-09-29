const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const { CONFIG } = require('../config/config');

class WhatsAppService {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: CONFIG.WHATSAPP_CONFIG.puppeteer
        });

        this.isReady = false;
        this.isReconnecting = false;

        this.setupEventHandlers();
    }

    /**
     * Configura los event handlers de WhatsApp
     */
    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log(chalk.yellow('📱 Escanea el código QR con tu teléfono:'));
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log(chalk.green('✅ WhatsApp Web está listo!'));
            this.isReady = true;
            this.isReconnecting = false;
        });

        this.client.on('auth_failure', (message) => {
            console.error(chalk.red('❌ Error de autenticación:'), message);
            this.isReady = false;
        });

        this.client.on('disconnected', (reason) => {
            console.log(chalk.yellow('⚠️ WhatsApp se desconectó:'), reason);
            this.isReady = false;
            this.handleDisconnection();
        });

        this.client.on('error', (error) => {
            console.error(chalk.red('❌ Error de WhatsApp:'), error);
            this.isReady = false;
            if (error.message.includes('Execution context was destroyed')) {
                this.handleDisconnection();
            }
        });
    }

    /**
     * Maneja la reconexión de WhatsApp
     */
    async handleDisconnection() {
        if (this.isReconnecting) return;

        this.isReconnecting = true;
        console.log(chalk.yellow('🔄 Intentando reconectar...'));

        try {
            await this.sleep(CONFIG.RECONNECTION_DELAY);
            await this.client.initialize();
        } catch (error) {
            console.error(chalk.red('❌ Error al reconectar:'), error);
            console.log(chalk.yellow('🔄 Reintentando en 10 segundos...'));
            setTimeout(() => this.handleDisconnection(), 10000);
        }
    }

    /**
     * Espera a que WhatsApp esté listo
     */
    async waitForReady() {
        while (!this.isReady) {
            console.log(chalk.yellow('⏳ Esperando que WhatsApp esté listo...'));
            await this.sleep(1000);
        }
    }

    /**
     * Envía un mensaje de WhatsApp con reintentos
     * @param {string} phone Número de teléfono
     * @param {string} message Mensaje a enviar
     * @returns {boolean} True si se envió exitosamente
     */
    async sendMessage(phone, message) {
        let retries = CONFIG.RETRY_ATTEMPTS;

        while (retries > 0) {
            try {
                await this.waitForReady();

                console.log(chalk.gray(`📨 Enviando mensaje a ${phone}... (intentos restantes: ${retries})`));

                if (!phone.includes('@c.us')) {
                    throw new Error('Formato de número inválido');
                }

                await this.client.sendMessage(phone, message);
                console.log(chalk.green(`✅ Mensaje enviado exitosamente a ${phone}`));

                return true;

            } catch (error) {
                console.error(chalk.red(`❌ Error enviando mensaje a ${phone} (intento ${CONFIG.RETRY_ATTEMPTS + 1 - retries}):`, error.message));
                retries--;

                if (retries > 0) {
                    if (error.message.includes('Execution context was destroyed')) {
                        console.log(chalk.yellow('⏳ Esperando reconexión...'));
                        this.isReady = false;
                        await this.sleep(10000);
                    } else {
                        await this.sleep(3000);
                    }
                } else {
                    throw new Error(`Error enviando mensaje después de ${CONFIG.RETRY_ATTEMPTS} intentos: ${error.message}`);
                }
            }
        }
    }

    /**
     * Inicializa el cliente de WhatsApp
     */
    async initialize() {
        try {
            await this.client.initialize();
        } catch (error) {
            console.error(chalk.red('❌ Error iniciando WhatsApp:'), error);
            throw error;
        }
    }

    /**
     * Función de utilidad para dormir/esperar
     * @param {number} ms Milisegundos a esperar
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Genera tiempo de espera aleatorio entre mensajes
     * @returns {number} Tiempo de espera en milisegundos
     */
    getRandomDelay() {
        return Math.floor(Math.random() * (CONFIG.MESSAGE_DELAY_MAX - CONFIG.MESSAGE_DELAY_MIN) + CONFIG.MESSAGE_DELAY_MIN);
    }
}

module.exports = {
    WhatsAppService
};