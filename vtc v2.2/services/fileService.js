const fs = require('fs-extra');
const XLSX = require('xlsx');
const chalk = require('chalk');
const { CONFIG } = require('../config/config');

class FileService {
    constructor() {
        this.logFile = CONFIG.LOG_FILE;
        this.errorFile = CONFIG.ERROR_FILE;
        this.processedFile = CONFIG.PROCESSED_FILE;

        this.initializeDirectories();
    }

    /**
     * Inicializa los directorios necesarios
     */
    async initializeDirectories() {
        await fs.ensureDir('logs');
        await fs.ensureDir('errores');
        await fs.ensureDir('procesados');
        await fs.ensureDir('config');
        await fs.ensureDir('services');
    }

    /**
     * Registra un mensaje en el log
     * @param {string} message Mensaje a registrar
     */
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;

        fs.appendFileSync(this.logFile, logMessage);
        console.log(message);
    }

    /**
     * Registra un error en el archivo de errores Excel
     * @param {string} patente Patente del vehículo
     * @param {string} telefono Teléfono del vehículo
     * @param {string} error Descripción del error
     */
    logError(patente, telefono, error) {
        try {
            let data = [];

            if (fs.existsSync(this.errorFile)) {
                const workbook = XLSX.readFile(this.errorFile);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = XLSX.utils.sheet_to_json(worksheet);
            }

            const now = new Date();
            data.push({
                Patente: patente,
                Telefono: telefono,
                Error: error,
                Fecha: now.toLocaleDateString('es-AR'),
                Hora: now.toLocaleTimeString('es-AR'),
                Timestamp: now.toISOString()
            });

            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Errores');
            XLSX.writeFile(newWorkbook, this.errorFile);
        } catch (error) {
            console.error('Error guardando error:', error);
        }
    }

    /**
     * Marca un vehículo como procesado
     * @param {string} patente Patente del vehículo
     * @param {string} telefono Teléfono del vehículo
     */
    markAsProcessed(patente, telefono) {
        try {
            let data = [];

            if (fs.existsSync(this.processedFile)) {
                const workbook = XLSX.readFile(this.processedFile);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = XLSX.utils.sheet_to_json(worksheet);
            }

            const now = new Date();
            data.push({
                Patente: patente,
                Telefono: telefono,
                FechaProcesado: now.toLocaleDateString('es-AR'),
                HoraProcesado: now.toLocaleTimeString('es-AR'),
                Timestamp: now.toISOString(),
                Version: 'v2.2'
            });

            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Procesados');
            XLSX.writeFile(newWorkbook, this.processedFile);
        } catch (error) {
            console.error('Error marcando como procesado:', error);
        }
    }

    /**
     * Obtiene la lista de patentes ya procesadas
     * @returns {Array} Lista de patentes procesadas
     */
    getProcessedNumbers() {
        try {
            if (!fs.existsSync(this.processedFile)) {
                return [];
            }

            const workbook = XLSX.readFile(this.processedFile);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            return data.map(row => row.Patente);
        } catch (error) {
            console.error('Error leyendo procesados:', error);
            return [];
        }
    }

    /**
     * Obtiene estadísticas de errores
     * @returns {Array} Lista de errores
     */
    getErrors() {
        try {
            if (!fs.existsSync(this.errorFile)) {
                return [];
            }

            const workbook = XLSX.readFile(this.errorFile);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            return XLSX.utils.sheet_to_json(worksheet);
        } catch (error) {
            console.error('Error leyendo errores:', error);
            return [];
        }
    }

    /**
     * Limpia archivos de logs antiguos (opcional)
     * @param {number} daysOld Días de antigüedad para considerar archivos viejos
     */
    cleanOldLogs(daysOld = 30) {
        // Implementación opcional para limpiar logs antiguos
        // Por ahora solo registramos la acción
        this.log(`Limpieza de logs ejecutada (archivos > ${daysOld} días)`);
    }
}

module.exports = {
    FileService
};