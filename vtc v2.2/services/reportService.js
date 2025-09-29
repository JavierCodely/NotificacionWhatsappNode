const XLSX = require('xlsx');
const moment = require('moment');
const fs = require('fs-extra');
const chalk = require('chalk');
const { CONFIG } = require('../config/config');

class ReportService {
    constructor(excelService, fileService) {
        this.excelService = excelService;
        this.fileService = fileService;
        this.reportsDir = 'reportes';
        this.initializeDirectories();
    }

    /**
     * Inicializa los directorios necesarios
     */
    async initializeDirectories() {
        await fs.ensureDir(this.reportsDir);
    }

    /**
     * Genera un reporte completo en Excel
     * @param {number} targetMonth Mes objetivo (opcional)
     * @param {number} targetYear Año objetivo (opcional)
     * @returns {string} Ruta del archivo generado
     */
    async generateFullReport(targetMonth = null, targetYear = null) {
        try {
            console.log(chalk.blue('📊 Generando reporte completo...'));

            // Obtener todos los datos
            const vehicles = this.excelService.readExcelData();
            const processedNumbers = this.fileService.getProcessedNumbers();
            const errors = this.fileService.getErrors();

            // Analizar teléfonos
            const phoneAnalysis = this.analyzePhones(vehicles);

            // Analizar VTV renovadas
            const vtvAnalysis = this.analyzeVTVStatus(vehicles);

            // Analizar notificaciones enviadas
            const notificationAnalysis = this.analyzeNotifications(vehicles, processedNumbers);

            // Crear el workbook
            const workbook = XLSX.utils.book_new();

            // Hoja 1: Resumen ejecutivo
            const summaryData = this.createSummarySheet(vehicles, phoneAnalysis, vtvAnalysis, notificationAnalysis, targetMonth, targetYear);
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen Ejecutivo');

            // Hoja 2: Análisis de teléfonos
            const phoneSheet = this.createPhoneAnalysisSheet(phoneAnalysis);
            XLSX.utils.book_append_sheet(workbook, phoneSheet, 'Análisis Teléfonos');

            // Hoja 3: Estado VTV
            const vtvSheet = this.createVTVStatusSheet(vtvAnalysis.details);
            XLSX.utils.book_append_sheet(workbook, vtvSheet, 'Estado VTV');

            // Hoja 4: Notificaciones enviadas
            const notificationSheet = this.createNotificationSheet(notificationAnalysis.details);
            XLSX.utils.book_append_sheet(workbook, notificationSheet, 'Notificaciones');

            // Hoja 5: Errores
            if (errors.length > 0) {
                const errorSheet = XLSX.utils.json_to_sheet(errors);
                XLSX.utils.book_append_sheet(workbook, errorSheet, 'Errores');
            }

            // Hoja 6: Distribución mensual
            const distributionData = this.createDistributionSheet(vehicles);
            const distributionSheet = XLSX.utils.json_to_sheet(distributionData);
            XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Distribución Mensual');

            // Generar nombre de archivo con timestamp
            const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
            const fileName = `Reporte_VTV_${timestamp}.xlsx`;
            const filePath = `${this.reportsDir}/${fileName}`;

            // Guardar archivo
            XLSX.writeFile(workbook, filePath);

            console.log(chalk.green(`✅ Reporte generado: ${filePath}`));
            return filePath;

        } catch (error) {
            console.error(chalk.red('❌ Error generando reporte:'), error);
            throw error;
        }
    }

    /**
     * Analiza el estado de los teléfonos
     * @param {Array} vehicles Array de vehículos
     * @returns {Object} Análisis de teléfonos
     */
    analyzePhones(vehicles) {
        const analysis = {
            total: vehicles.length,
            conTelefono: 0,
            sinTelefono: 0,
            telefonosValidos: 0,
            telefonosInvalidos: 0,
            nulos: 0,
            noFormateables: 0,
            details: []
        };

        vehicles.forEach(vehicle => {
            const hasPhone = vehicle.TelefonoOriginal && vehicle.TelefonoOriginal.toString().trim() !== '';
            const isFormatted = vehicle.Telefono && vehicle.Telefono.includes('@c.us');

            let status = '';
            let categoria = '';

            if (!hasPhone) {
                analysis.nulos++;
                status = 'NULO/VACÍO';
                categoria = 'Sin teléfono';
            } else {
                analysis.conTelefono++;
                if (isFormatted) {
                    analysis.telefonosValidos++;
                    status = 'VÁLIDO';
                    categoria = 'Formateado correctamente';
                } else {
                    analysis.telefonosInvalidos++;
                    analysis.noFormateables++;
                    status = 'INVÁLIDO';
                    categoria = 'No se pudo formatear';
                }
            }

            analysis.details.push({
                Patente: vehicle.Patente,
                'Teléfono Original': vehicle.TelefonoOriginal || 'VACÍO',
                'Teléfono Formateado': vehicle.Telefono || 'NO FORMATEADO',
                Estado: status,
                Categoría: categoria,
                Marca: vehicle.Marca,
                Modelo: vehicle.Modelo,
                'Fecha Vencimiento': vehicle.FechaDeVencimiento
            });
        });

        analysis.sinTelefono = analysis.nulos;

        return analysis;
    }

    /**
     * Analiza el estado de las VTV (renovadas o no)
     * @param {Array} vehicles Array de vehículos
     * @returns {Object} Análisis de VTV
     */
    analyzeVTVStatus(vehicles) {
        const now = moment();
        const analysis = {
            total: vehicles.length,
            vencidas: 0,
            vigentes: 0,
            proximasAVencer: 0, // Próximas 30 días
            details: []
        };

        vehicles.forEach(vehicle => {
            const vencimiento = moment(vehicle.FechaDeVencimiento, CONFIG.DATE_FORMAT);
            let status = '';
            let diasRestantes = 0;

            if (vencimiento.isValid()) {
                diasRestantes = vencimiento.diff(now, 'days');

                if (diasRestantes < 0) {
                    analysis.vencidas++;
                    status = 'VENCIDA';
                } else if (diasRestantes <= 30) {
                    analysis.proximasAVencer++;
                    status = 'PRÓXIMA A VENCER';
                } else {
                    analysis.vigentes++;
                    status = 'VIGENTE';
                }
            } else {
                status = 'FECHA INVÁLIDA';
            }

            analysis.details.push({
                Patente: vehicle.Patente,
                'Fecha Vencimiento': vehicle.FechaDeVencimiento,
                Estado: status,
                'Días Restantes': diasRestantes,
                Marca: vehicle.Marca,
                Modelo: vehicle.Modelo,
                'Teléfono': vehicle.TelefonoOriginal || 'SIN TELÉFONO'
            });
        });

        return analysis;
    }

    /**
     * Analiza las notificaciones enviadas
     * @param {Array} vehicles Array de vehículos
     * @param {Array} processedNumbers Array de patentes procesadas
     * @returns {Object} Análisis de notificaciones
     */
    analyzeNotifications(vehicles, processedNumbers) {
        const analysis = {
            totalVehiculos: vehicles.length,
            notificados: processedNumbers.length,
            noNotificados: 0,
            porcentajeNotificado: 0,
            details: []
        };

        vehicles.forEach(vehicle => {
            const wasNotified = processedNumbers.includes(vehicle.Patente);
            const hasValidPhone = vehicle.Telefono && vehicle.Telefono.includes('@c.us');

            let status = '';
            let razon = '';

            if (wasNotified) {
                status = 'NOTIFICADO';
                razon = 'Notificación enviada exitosamente';
            } else {
                status = 'NO NOTIFICADO';
                if (!hasValidPhone) {
                    razon = 'Sin teléfono válido';
                } else {
                    razon = 'Pendiente de notificar o error en envío';
                }
            }

            analysis.details.push({
                Patente: vehicle.Patente,
                'Estado Notificación': status,
                Razón: razon,
                'Teléfono Original': vehicle.TelefonoOriginal || 'VACÍO',
                'Teléfono Válido': hasValidPhone ? 'SÍ' : 'NO',
                'Fecha Vencimiento': vehicle.FechaDeVencimiento,
                Marca: vehicle.Marca,
                Modelo: vehicle.Modelo
            });
        });

        analysis.noNotificados = analysis.totalVehiculos - analysis.notificados;
        analysis.porcentajeNotificado = ((analysis.notificados / analysis.totalVehiculos) * 100).toFixed(2);

        return analysis;
    }

    /**
     * Crea la hoja de resumen ejecutivo
     */
    createSummarySheet(vehicles, phoneAnalysis, vtvAnalysis, notificationAnalysis, targetMonth, targetYear) {
        const summary = [
            { Métrica: 'RESUMEN GENERAL', Valor: '', Descripción: '' },
            { Métrica: 'Total de vehículos en base', Valor: vehicles.length, Descripción: 'Cantidad total de registros' },
            { Métrica: 'Fecha del reporte', Valor: moment().format('DD/MM/YYYY HH:mm'), Descripción: 'Momento de generación' },
            { Métrica: '', Valor: '', Descripción: '' },

            { Métrica: 'ANÁLISIS DE TELÉFONOS', Valor: '', Descripción: '' },
            { Métrica: 'Con teléfono válido', Valor: phoneAnalysis.telefonosValidos, Descripción: 'Números que se pudieron formatear para WhatsApp' },
            { Métrica: 'Con teléfono inválido', Valor: phoneAnalysis.telefonosInvalidos, Descripción: 'Números que no se pudieron formatear' },
            { Métrica: 'Sin teléfono (nulos)', Valor: phoneAnalysis.nulos, Descripción: 'Registros sin número de teléfono' },
            { Métrica: 'Porcentaje válidos', Valor: `${((phoneAnalysis.telefonosValidos / vehicles.length) * 100).toFixed(2)}%`, Descripción: 'Porcentaje de teléfonos válidos' },
            { Métrica: '', Valor: '', Descripción: '' },

            { Métrica: 'ESTADO DE VTV', Valor: '', Descripción: '' },
            { Métrica: 'VTV vencidas', Valor: vtvAnalysis.vencidas, Descripción: 'VTV que ya vencieron' },
            { Métrica: 'VTV próximas a vencer (30 días)', Valor: vtvAnalysis.proximasAVencer, Descripción: 'VTV que vencen en los próximos 30 días' },
            { Métrica: 'VTV vigentes', Valor: vtvAnalysis.vigentes, Descripción: 'VTV que aún están vigentes (más de 30 días)' },
            { Métrica: '', Valor: '', Descripción: '' },

            { Métrica: 'NOTIFICACIONES', Valor: '', Descripción: '' },
            { Métrica: 'Total notificados', Valor: notificationAnalysis.notificados, Descripción: 'Vehículos a los que se envió notificación' },
            { Métrica: 'No notificados', Valor: notificationAnalysis.noNotificados, Descripción: 'Vehículos sin notificar' },
            { Métrica: 'Porcentaje notificado', Valor: `${notificationAnalysis.porcentajeNotificado}%`, Descripción: 'Porcentaje de vehículos notificados' }
        ];

        if (targetMonth && targetYear) {
            const monthName = this.getMonthName(targetMonth);
            const periodVehicles = this.excelService.filterSpecificPeriod(vehicles, targetMonth, targetYear);
            summary.push(
                { Métrica: '', Valor: '', Descripción: '' },
                { Métrica: 'PERÍODO SELECCIONADO', Valor: '', Descripción: '' },
                { Métrica: 'Mes/Año analizado', Valor: `${monthName} ${targetYear}`, Descripción: 'Período específico analizado' },
                { Métrica: 'Vehículos en período', Valor: periodVehicles.length, Descripción: 'Vehículos que vencen en el período' },
                { Métrica: 'Con teléfono válido en período', Valor: periodVehicles.filter(v => v.Telefono).length, Descripción: 'Del período, cuántos tienen teléfono válido' }
            );
        }

        return summary;
    }

    /**
     * Crea la hoja de análisis de teléfonos
     */
    createPhoneAnalysisSheet(phoneAnalysis) {
        const worksheet = XLSX.utils.json_to_sheet(phoneAnalysis.details);

        // Aplicar formato a las columnas
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let row = range.s.r; row <= range.e.r; row++) {
            const estadoCell = XLSX.utils.encode_cell({ r: row, c: 3 }); // Columna Estado
            if (worksheet[estadoCell]) {
                const cellValue = worksheet[estadoCell].v;
                if (cellValue === 'VÁLIDO') {
                    worksheet[estadoCell].s = { fill: { fgColor: { rgb: '90EE90' } } };
                } else if (cellValue === 'INVÁLIDO') {
                    worksheet[estadoCell].s = { fill: { fgColor: { rgb: 'FFB6C1' } } };
                } else if (cellValue === 'NULO/VACÍO') {
                    worksheet[estadoCell].s = { fill: { fgColor: { rgb: 'FFFFE0' } } };
                }
            }
        }

        return worksheet;
    }

    /**
     * Crea la hoja de estado VTV
     */
    createVTVStatusSheet(vtvDetails) {
        return XLSX.utils.json_to_sheet(vtvDetails);
    }

    /**
     * Crea la hoja de notificaciones
     */
    createNotificationSheet(notificationDetails) {
        return XLSX.utils.json_to_sheet(notificationDetails);
    }

    /**
     * Crea la hoja de distribución mensual
     */
    createDistributionSheet(vehicles) {
        const distribution = this.excelService.getMonthDistribution(vehicles);
        const distributionData = [];

        CONFIG.AVAILABLE_YEARS.forEach(year => {
            for (let month = 1; month <= 12; month++) {
                const count = distribution[year] && distribution[year][month] ? distribution[year][month] : 0;
                distributionData.push({
                    Año: year,
                    Mes: month,
                    'Nombre Mes': this.getMonthName(month),
                    'Cantidad Vencimientos': count
                });
            }
        });

        return distributionData;
    }

    /**
     * Obtiene el nombre del mes
     * @param {number} month Número del mes (1-12)
     * @returns {string} Nombre del mes
     */
    getMonthName(month) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[month - 1] || 'Mes inválido';
    }

    /**
     * Genera un reporte específico para un período
     * @param {number} month Mes objetivo
     * @param {number} year Año objetivo
     * @returns {string} Ruta del archivo generado
     */
    async generatePeriodReport(month, year) {
        return await this.generateFullReport(month, year);
    }
}

module.exports = {
    ReportService
};