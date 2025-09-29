const moment = require('moment');
const chalk = require('chalk');
const { CONFIG } = require('../config/config');
const { MESSAGES } = require('../config/messages');

class NotificationService {
    constructor(whatsappService, fileService) {
        this.whatsappService = whatsappService;
        this.fileService = fileService;
    }

    /**
     * Procesa un vehículo individual y envía notificación si es necesario
     * @param {Object} vehicle Datos del vehículo
     * @returns {Object} Resultado del procesamiento
     */
    async processVehicle(vehicle) {
        try {
            const today = moment();
            const vencimiento = moment(vehicle.FechaDeVencimiento, CONFIG.DATE_FORMAT);

            if (!vencimiento.isValid()) {
                throw new Error(`Fecha de vencimiento inválida: ${vehicle.FechaDeVencimiento}`);
            }

            const diasDiferencia = vencimiento.diff(today, 'days');
            const vehicleData = {
                patente: vehicle.Patente,
                marca: vehicle.Marca,
                modelo: vehicle.Modelo,
                fechaVencimiento: vencimiento.format(CONFIG.DISPLAY_DATE_FORMAT)
            };

            const message = this.generateMessage(vehicleData, diasDiferencia);

            if (message) {
                await this.whatsappService.sendMessage(vehicle.Telefono, message);
                this.fileService.log(`✅ Notificación enviada a ${vehicle.Patente} (${vehicle.Telefono}) - ${diasDiferencia} días`);
                return { success: true };
            } else {
                this.fileService.log(`ℹ️ Vehículo ${vehicle.Patente} no requiere notificación (${diasDiferencia} días para vencimiento)`);
                return { success: true, skipped: true };
            }

        } catch (error) {
            console.error(chalk.red(`❌ Error procesando vehículo ${vehicle.Patente}:`), error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Genera el mensaje apropiado según los días hasta el vencimiento
     * @param {Object} vehicleData Datos del vehículo
     * @param {number} diasDiferencia Días hasta el vencimiento
     * @returns {string|null} Mensaje generado o null si no debe notificar
     */
    generateMessage(vehicleData, diasDiferencia) {
        if (diasDiferencia === 0) {
            return MESSAGES.URGENTE_HOY(vehicleData);
        } else if (diasDiferencia > 0 && diasDiferencia <= 5) {
            return MESSAGES.URGENTE_PROXIMO(vehicleData, diasDiferencia);
        } else if (diasDiferencia > 5) {
            return MESSAGES.AVISO_NORMAL(vehicleData, diasDiferencia);
        } else if (diasDiferencia < 0) {
            const diasVencido = Math.abs(diasDiferencia);
            return MESSAGES.VENCIDA(vehicleData, diasVencido);
        }

        return null;
    }

    /**
     * Procesa notificaciones para vehículos del mes objetivo
     * @param {Array} vehicles Lista de todos los vehículos
     * @returns {Object} Estadísticas del procesamiento
     */
    async processTargetNotifications(vehicles) {
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        for (const vehicle of vehicles) {
            // Verificar conexión de WhatsApp
            if (!this.whatsappService.isReady) {
                console.log(chalk.yellow('⚠️ WhatsApp se desconectó, esperando reconexión...'));
                await this.whatsappService.waitForReady();
            }

            // Verificar teléfono válido
            if (!vehicle.Telefono) {
                console.log(chalk.red(`❌ Teléfono inválido para ${vehicle.Patente}, saltando...`));
                errorCount++;
                this.fileService.logError(vehicle.Patente, vehicle.TelefonoOriginal, 'Formato de teléfono inválido');
                continue;
            }

            const result = await this.processVehicle(vehicle);

            if (result.success) {
                if (!result.skipped) {
                    successCount++;
                    this.fileService.markAsProcessed(vehicle.Patente, vehicle.Telefono);
                } else {
                    skippedCount++;
                }
            } else {
                errorCount++;
                this.fileService.logError(vehicle.Patente, vehicle.Telefono, result.error);
            }

            // Pausa entre mensajes
            const tiempoEspera = this.whatsappService.getRandomDelay();
            await this.whatsappService.sleep(tiempoEspera);
        }

        return {
            success: successCount,
            errors: errorCount,
            skipped: skippedCount
        };
    }

    /**
     * Muestra información de prueba de un vehículo
     * @param {Object} vehicle Datos del vehículo
     */
    displayTestInfo(vehicle) {
        console.log(`Patente: ${vehicle.Patente}`);
        console.log(`Teléfono original: ${vehicle.TelefonoOriginal}`);
        console.log(`Teléfono formateado: ${vehicle.Telefono}`);
        console.log(`Válido: ${vehicle.Telefono ? '✅' : '❌'}`);
        console.log(`Marca: ${vehicle.Marca}`);
        console.log(`Modelo: ${vehicle.Modelo}`);
        console.log(`Vencimiento: ${vehicle.FechaDeVencimiento}`);
        console.log('---');
    }
}

module.exports = {
    NotificationService
};