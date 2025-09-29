const XLSX = require('xlsx');
const moment = require('moment');
const chalk = require('chalk');
const { CONFIG } = require('../config/config');

class ExcelService {
    constructor() {
        this.excelFile = CONFIG.EXCEL_FILE;
    }

    /**
     * Lee y procesa los datos del archivo Excel
     * @returns {Array} Array de vehículos procesados
     */
    readExcelData() {
        try {
            const workbook = XLSX.readFile(this.excelFile);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            const cleanData = data.filter(row => {
                return row.Patente && row.Telefono;
            });

            console.log(chalk.blue(`📊 Datos encontrados en Excel: ${cleanData.length} vehículos`));

            return cleanData.map(row => {
                const originalPhone = row.Telefono || '';
                const formattedPhone = this.formatPhone(originalPhone);

                return {
                    Patente: (row.Patente || '').toString().trim(),
                    TelefonoOriginal: originalPhone,
                    Telefono: formattedPhone,
                    FechaDeVencimiento: row.FechaDeVencimiento || '',
                    Marca: row.MARCA || '',
                    Modelo: row.MODELO || '',
                    Serie: row.SERIE || '',
                    Email: row.EMAIL || ''
                };
            });
        } catch (error) {
            console.error(chalk.red('❌ Error leyendo Excel:'), error);
            return [];
        }
    }

    /**
     * Filtra vehículos que vencen en el mes y año objetivo (función legacy)
     * @param {Array} vehicles Array de vehículos
     * @returns {Array} Vehículos filtrados
     */
    filterTargetVencimientos(vehicles) {
        return vehicles.filter(vehicle => {
            const vencimiento = moment(vehicle.FechaDeVencimiento, CONFIG.DATE_FORMAT);
            if (!vencimiento.isValid()) return false;

            return vencimiento.year() === CONFIG.DEFAULT_TARGET_YEAR &&
                   vencimiento.month() === (10 - 1); // Octubre por defecto
        });
    }

    /**
     * Filtra vehículos que vencen en un mes y año específico
     * @param {Array} vehicles Array de vehículos
     * @param {number} targetMonth Mes objetivo (1-12)
     * @param {number} targetYear Año objetivo
     * @returns {Array} Vehículos filtrados
     */
    filterSpecificPeriod(vehicles, targetMonth, targetYear) {
        return vehicles.filter(vehicle => {
            const vencimiento = moment(vehicle.FechaDeVencimiento, CONFIG.DATE_FORMAT);
            if (!vencimiento.isValid()) return false;

            return vencimiento.year() === targetYear &&
                   vencimiento.month() === (targetMonth - 1); // moment usa 0-indexado
        });
    }

    /**
     * Ordena vehículos por fecha de vencimiento (más próximos primero)
     * @param {Array} vehicles Array de vehículos
     * @returns {Array} Vehículos ordenados
     */
    sortByVencimiento(vehicles) {
        return vehicles.sort((a, b) => {
            const fechaA = moment(a.FechaDeVencimiento, CONFIG.DATE_FORMAT);
            const fechaB = moment(b.FechaDeVencimiento, CONFIG.DATE_FORMAT);
            return fechaA.diff(fechaB);
        });
    }

    /**
     * Formatea número de teléfono para WhatsApp
     * @param {string|number} phone Número de teléfono
     * @returns {string} Número formateado o vacío si inválido
     */
    formatPhone(phone) {
        if (!phone) return '';

        let cleaned = phone.toString().replace(/\D/g, '');

        console.log(chalk.gray(`🔍 Procesando teléfono: ${phone} -> ${cleaned}`));

        if (!cleaned) return '';

        // Remover cero inicial si existe
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // Si ya tiene el código de país, verificar que sea el correcto
        if (cleaned.startsWith(CONFIG.COUNTRY_CODE)) {
            // Ya tiene el código de país correcto, no hacer nada
            console.log(chalk.cyan(`📱 Número ya tiene código de país: ${cleaned}`));
        } else {
            // No tiene código de país, agregarlo
            cleaned = CONFIG.COUNTRY_CODE + cleaned;
            console.log(chalk.cyan(`📱 Código de país agregado: ${cleaned}`));
        }

        if (cleaned.length < CONFIG.PHONE_MIN_LENGTH || cleaned.length > CONFIG.PHONE_MAX_LENGTH) {
            console.log(chalk.red(`❌ Teléfono con longitud inválida: ${cleaned} (longitud: ${cleaned.length})`));
            return '';
        }

        const whatsappNumber = cleaned + '@c.us';
        console.log(chalk.green(`✅ Teléfono formateado: ${whatsappNumber}`));
        return whatsappNumber;
    }

    /**
     * Obtiene estadísticas de los datos
     * @param {Array} vehicles Array de vehículos
     * @returns {Object} Objeto con estadísticas
     */
    getStatistics(vehicles) {
        const targetVehicles = this.filterTargetVencimientos(vehicles);
        const validPhones = vehicles.filter(v => v.Telefono).length;
        const invalidPhones = vehicles.filter(v => !v.Telefono);

        return {
            total: vehicles.length,
            targetMonth: targetVehicles.length,
            validPhones: validPhones,
            invalidPhones: invalidPhones.length,
            invalidPhoneList: invalidPhones.map(v => ({ patente: v.Patente, telefono: v.TelefonoOriginal }))
        };
    }

    /**
     * Obtiene la distribución de vencimientos por mes y año
     * @param {Array} vehicles Array de vehículos
     * @returns {Object} Distribución por año/mes
     */
    getMonthDistribution(vehicles) {
        const distribution = {};

        // Inicializar estructura
        CONFIG.AVAILABLE_YEARS.forEach(year => {
            distribution[year] = {};
            for (let month = 1; month <= 12; month++) {
                distribution[year][month] = 0;
            }
        });

        // Contar vencimientos
        vehicles.forEach(vehicle => {
            const vencimiento = moment(vehicle.FechaDeVencimiento, CONFIG.DATE_FORMAT);
            if (vencimiento.isValid()) {
                const year = vencimiento.year();
                const month = vencimiento.month() + 1; // moment usa 0-indexado

                if (distribution[year] && distribution[year][month] !== undefined) {
                    distribution[year][month]++;
                }
            }
        });

        return distribution;
    }
}

module.exports = {
    ExcelService
};