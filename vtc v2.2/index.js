const inquirer = require('inquirer');
const chalk = require('chalk');
const { CONFIG } = require('./config/config');
const { ExcelService } = require('./services/excelService');
const { WhatsAppService } = require('./services/whatsappService');
const { NotificationService } = require('./services/notificationService');
const { FileService } = require('./services/fileService');

class VTVNotifierV2 {
    constructor() {
        // Inicializar servicios
        this.excelService = new ExcelService();
        this.whatsappService = new WhatsAppService();
        this.fileService = new FileService();
        this.notificationService = new NotificationService(this.whatsappService, this.fileService);

        // Variables para selección dinámica
        this.selectedMonth = null;
        this.selectedYear = CONFIG.DEFAULT_TARGET_YEAR;
    }

    /**
     * Muestra el menú principal
     */
    async showMenu() {
        const choices = [
            {
                name: `🗓️ Seleccionar mes y año para notificar`,
                value: 'select_period'
            },
            {
                name: `🔔 Notificar vencimientos${this.selectedMonth ? ` de ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}` : ''} (máximo ${CONFIG.MAX_NOTIFICATIONS_PER_RUN})`,
                value: 'notify',
                disabled: !this.selectedMonth
            },
            {
                name: '📊 Ver estadísticas',
                value: 'stats'
            },
            {
                name: '📅 Ver distribución por meses',
                value: 'distribution'
            },
            {
                name: '🧪 Probar formato de teléfono',
                value: 'test'
            },
            {
                name: '📋 Ver configuración actual',
                value: 'config'
            },
            {
                name: '❌ Salir',
                value: 'exit'
            }
        ];

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '¿Qué deseas hacer?',
                choices
            }
        ]);

        switch (action) {
            case 'select_period':
                await this.selectPeriod();
                break;
            case 'notify':
                await this.processTargetMonthNotifications();
                break;
            case 'stats':
                await this.showStatistics();
                break;
            case 'distribution':
                await this.showMonthDistribution();
                break;
            case 'test':
                await this.testPhoneFormat();
                break;
            case 'config':
                await this.showConfiguration();
                break;
            case 'exit':
                process.exit(0);
                break;
        }
    }

    /**
     * Permite seleccionar el mes y año para las notificaciones
     */
    async selectPeriod() {
        console.log(chalk.blue('📅 Selección de período para notificaciones'));

        // Primero seleccionar el año
        const { selectedYear } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedYear',
                message: '🗓️ Selecciona el año:',
                choices: CONFIG.AVAILABLE_YEARS.map(year => ({
                    name: year.toString(),
                    value: year
                }))
            }
        ]);

        this.selectedYear = selectedYear;

        // Luego seleccionar el mes
        const months = [
            { name: '📅 Enero', value: 1 },
            { name: '📅 Febrero', value: 2 },
            { name: '📅 Marzo', value: 3 },
            { name: '📅 Abril', value: 4 },
            { name: '📅 Mayo', value: 5 },
            { name: '📅 Junio', value: 6 },
            { name: '📅 Julio', value: 7 },
            { name: '📅 Agosto', value: 8 },
            { name: '📅 Septiembre', value: 9 },
            { name: '📅 Octubre', value: 10 },
            { name: '📅 Noviembre', value: 11 },
            { name: '📅 Diciembre', value: 12 },
            { name: '↩️ Volver al menú principal', value: 'back' }
        ];

        const { selectedMonth } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedMonth',
                message: `🗓️ Selecciona el mes para ${selectedYear}:`,
                choices: months
            }
        ]);

        if (selectedMonth === 'back') {
            this.showMenu();
            return;
        }

        this.selectedMonth = selectedMonth;

        console.log(chalk.green(`✅ Período seleccionado: ${this.getMonthName(selectedMonth)} ${selectedYear}`));

        // Mostrar información del período seleccionado
        await this.showPeriodInfo();

        setTimeout(() => this.showMenu(), 3000);
    }

    /**
     * Muestra información sobre el período seleccionado
     */
    async showPeriodInfo() {
        try {
            const vehicles = this.excelService.readExcelData();
            const targetVehicles = this.excelService.filterSpecificPeriod(vehicles, this.selectedMonth, this.selectedYear);
            const sortedVehicles = this.excelService.sortByVencimiento(targetVehicles);

            console.log(chalk.blue(`\n📊 Información del período seleccionado:`));
            console.log(`- Mes/Año: ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}`);
            console.log(`- Total de vehículos que vencen: ${targetVehicles.length}`);
            console.log(`- Con teléfono válido: ${targetVehicles.filter(v => v.Telefono).length}`);
            console.log(`- Se notificarán los primeros: ${Math.min(targetVehicles.filter(v => v.Telefono).length, CONFIG.MAX_NOTIFICATIONS_PER_RUN)}`);

            if (sortedVehicles.length > 0) {
                console.log(chalk.cyan(`\n🔍 Primeros 5 vehículos a notificar:`));
                sortedVehicles.filter(v => v.Telefono).slice(0, 5).forEach((vehicle, index) => {
                    console.log(`${index + 1}. ${vehicle.Patente} - ${vehicle.Marca} ${vehicle.Modelo} - Vence: ${vehicle.FechaDeVencimiento}`);
                });
            }
        } catch (error) {
            console.error(chalk.red('Error obteniendo información del período:'), error);
        }
    }

    /**
     * Muestra distribución de vencimientos por meses
     */
    async showMonthDistribution() {
        try {
            console.log(chalk.blue('📊 Generando distribución por meses...'));

            const vehicles = this.excelService.readExcelData();
            const distribution = this.excelService.getMonthDistribution(vehicles);

            console.log(chalk.blue('\n=== DISTRIBUCIÓN DE VENCIMIENTOS POR MES/AÑO ===\n'));

            for (const year of CONFIG.AVAILABLE_YEARS) {
                console.log(chalk.cyan(`📅 AÑO ${year}:`));
                let totalYear = 0;

                for (let month = 1; month <= 12; month++) {
                    const count = distribution[year] && distribution[year][month] ? distribution[year][month] : 0;
                    totalYear += count;

                    const monthName = this.getMonthName(month).padEnd(12);
                    const bar = '█'.repeat(Math.floor(count / 20)); // Escala visual

                    if (count > 0) {
                        console.log(`  ${monthName}: ${count.toString().padStart(4)} ${bar}`);
                    } else {
                        console.log(`  ${monthName}: ${count.toString().padStart(4)} -`);
                    }
                }
                console.log(`  ${'TOTAL'.padEnd(12)}: ${totalYear.toString().padStart(4)}\n`);
            }

        } catch (error) {
            console.error('Error mostrando distribución:', error);
        }

        setTimeout(() => this.showMenu(), 10000);
    }

    /**
     * Procesa notificaciones para el mes objetivo
     */
    async processTargetMonthNotifications() {
        try {
            await this.whatsappService.waitForReady();

            console.log(chalk.blue(`🔍 Cargando datos del Excel...`));
            const allVehicles = this.excelService.readExcelData();

            console.log(chalk.blue(`📅 Filtrando vehículos que vencen en ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}...`));
            const targetVehicles = this.excelService.filterSpecificPeriod(allVehicles, this.selectedMonth, this.selectedYear);

            console.log(chalk.blue(`🔄 Ordenando por fecha de vencimiento...`));
            const sortedVehicles = this.excelService.sortByVencimiento(targetVehicles);

            const vehiclesToNotify = sortedVehicles.filter(v => v.Telefono).slice(0, CONFIG.MAX_NOTIFICATIONS_PER_RUN);

            console.log(chalk.blue(`📋 Vehículos que vencen en ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}: ${targetVehicles.length}`));
            console.log(chalk.green(`🔔 Notificando a los ${vehiclesToNotify.length} más próximos a vencer...`));

            if (vehiclesToNotify.length === 0) {
                console.log(chalk.yellow('⚠️ No hay vehículos para notificar en el período seleccionado.'));
                setTimeout(() => this.showMenu(), 3000);
                return;
            }

            // Mostrar primeros 5 vehículos que se van a notificar
            console.log(chalk.cyan('\n📋 Próximos 5 vehículos a notificar:'));
            vehiclesToNotify.slice(0, 5).forEach((vehicle, index) => {
                console.log(`${index + 1}. ${vehicle.Patente} - ${vehicle.Marca} ${vehicle.Modelo} - Vence: ${vehicle.FechaDeVencimiento}`);
            });
            console.log('');

            const results = await this.notificationService.processTargetNotifications(vehiclesToNotify);

            console.log(chalk.green(`✅ Proceso completado:`));
            console.log(`- Enviados: ${results.success}`);
            console.log(`- Errores: ${results.errors}`);
            console.log(`- Omitidos: ${results.skipped}`);

        } catch (error) {
            console.error(chalk.red('❌ Error procesando notificaciones:'), error);
            this.fileService.log(`ERROR: ${error.message}`);
        }

        setTimeout(() => this.showMenu(), 5000);
    }

    /**
     * Muestra estadísticas del sistema
     */
    async showStatistics() {
        try {
            console.log(chalk.blue('📊 Generando estadísticas...'));

            const vehicles = this.excelService.readExcelData();
            const stats = this.excelService.getStatistics(vehicles);
            const processed = this.fileService.getProcessedNumbers();
            const errors = this.fileService.getErrors();

            console.log(chalk.blue('\n=== ESTADÍSTICAS GENERALES ==='));
            console.log(`- Total vehículos en Excel: ${stats.total}`);
            console.log(`- Teléfonos válidos: ${stats.validPhones}`);
            console.log(`- Procesados: ${processed.length}`);
            console.log(`- Errores: ${errors.length}`);

            if (this.selectedMonth && this.selectedYear) {
                const selectedPeriodVehicles = this.excelService.filterSpecificPeriod(vehicles, this.selectedMonth, this.selectedYear);
                console.log(chalk.green(`\n=== PERÍODO SELECCIONADO ===`));
                console.log(`- Mes/Año: ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}`);
                console.log(`- Vehículos que vencen: ${selectedPeriodVehicles.length}`);
                console.log(`- Con teléfono válido: ${selectedPeriodVehicles.filter(v => v.Telefono).length}`);
            }

            if (stats.invalidPhones > 0) {
                console.log(chalk.red(`\n❌ Teléfonos inválidos: ${stats.invalidPhones}`));
                console.log(chalk.yellow('Primeros 10 teléfonos inválidos:'));
                stats.invalidPhoneList.slice(0, 10).forEach(item => {
                    console.log(chalk.red(`  • ${item.patente}: ${item.telefono}`));
                });
            }

            console.log(chalk.blue('\n=== CONFIGURACIÓN ACTUAL ==='));
            console.log(`- Archivo Excel: ${CONFIG.EXCEL_FILE}`);
            if (this.selectedMonth && this.selectedYear) {
                console.log(`- Período seleccionado: ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}`);
            } else {
                console.log(`- Período seleccionado: Ninguno`);
            }
            console.log(`- Máximo por ejecución: ${CONFIG.MAX_NOTIFICATIONS_PER_RUN}`);

        } catch (error) {
            console.error('Error mostrando estadísticas:', error);
        }

        setTimeout(() => this.showMenu(), 8000);
    }

    /**
     * Prueba el formato de teléfonos
     */
    async testPhoneFormat() {
        const vehicles = this.excelService.readExcelData();
        console.log(chalk.blue('🧪 Probando formato de teléfonos (primeros 5):'));

        vehicles.slice(0, 5).forEach(vehicle => {
            this.notificationService.displayTestInfo(vehicle);
        });

        setTimeout(() => this.showMenu(), 8000);
    }

    /**
     * Muestra la configuración actual
     */
    async showConfiguration() {
        console.log(chalk.blue('📋 CONFIGURACIÓN ACTUAL:'));
        console.log(`- Versión: VTV Notifier v2.2`);
        console.log(`- Archivo Excel: ${CONFIG.EXCEL_FILE}`);
        if (this.selectedMonth && this.selectedYear) {
            console.log(`- Período seleccionado: ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}`);
        } else {
            console.log(`- Período seleccionado: Ninguno (debe seleccionar uno)`);
        }
        console.log(`- Años disponibles: ${CONFIG.AVAILABLE_YEARS.join(', ')}`);
        console.log(`- Máximo notificaciones por ejecución: ${CONFIG.MAX_NOTIFICATIONS_PER_RUN}`);
        console.log(`- Código de país: +${CONFIG.COUNTRY_CODE}`);
        console.log(`- Formato de fecha: ${CONFIG.DATE_FORMAT}`);
        console.log(`- Intentos de reenvío: ${CONFIG.RETRY_ATTEMPTS}`);
        console.log(`- Delay entre mensajes: ${CONFIG.MESSAGE_DELAY_MIN}-${CONFIG.MESSAGE_DELAY_MAX}ms`);

        console.log(chalk.cyan('\n📁 ARCHIVOS:'));
        console.log(`- Logs: ${CONFIG.LOG_FILE}`);
        console.log(`- Errores: ${CONFIG.ERROR_FILE}`);
        console.log(`- Procesados: ${CONFIG.PROCESSED_FILE}`);
        console.log(`- Mensajes: config/messages.js`);

        setTimeout(() => this.showMenu(), 8000);
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
     * Inicia la aplicación
     */
    async start() {
        console.log(chalk.blue('🚀 Iniciando VTV Notifier v2.2...'));
        console.log(chalk.cyan(`📅 Selector de mes y año dinámico habilitado`));
        console.log(chalk.cyan(`📊 Años disponibles: ${CONFIG.AVAILABLE_YEARS.join(', ')}`));
        console.log(chalk.cyan(`📨 Máximo ${CONFIG.MAX_NOTIFICATIONS_PER_RUN} notificaciones por ejecución`));

        try {
            await this.whatsappService.initialize();
            // El menú se mostrará automáticamente cuando WhatsApp esté listo
            this.whatsappService.client.on('ready', () => {
                this.showMenu();
            });
        } catch (error) {
            console.error(chalk.red('❌ Error iniciando WhatsApp:'), error);
            console.log(chalk.yellow('🔄 Reintentando en 5 segundos...'));
            setTimeout(() => this.start(), 5000);
        }
    }
}

// Iniciar la aplicación
const notifier = new VTVNotifierV2();
notifier.start();

// Manejar cierre limpio
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🔌 Cerrando aplicación...'));
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n🔌 Aplicación terminada'));
    process.exit(0);
});