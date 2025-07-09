const { Client, LocalAuth } = require('whatsapp-web.js');
const XLSX = require('xlsx');
const moment = require('moment');
const qrcode = require('qrcode-terminal');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const chalk = require('chalk');

class VTVNotifier {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });
        
        this.excelFile = 'prueba.xlsx';
        this.logFile = 'logs/notificaciones.log';
        this.errorFile = 'errores/errores_envio.xlsx';
        this.processedFile = 'procesados/procesados.xlsx';
        this.isReady = false;
        this.isReconnecting = false;
        
        this.initializeDirectories();
        this.setupWhatsApp();
    }

    async initializeDirectories() {
        await fs.ensureDir('logs');
        await fs.ensureDir('errores');
        await fs.ensureDir('procesados');
    }

    setupWhatsApp() {
        this.client.on('qr', (qr) => {
            console.log(chalk.yellow('📱 Escanea el código QR con tu teléfono:'));
            qrcode.generate(qr, {small: true});
        });

        this.client.on('ready', () => {
            console.log(chalk.green('✅ WhatsApp Web está listo!'));
            this.isReady = true;
            this.isReconnecting = false;
            this.showMenu();
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

        // Manejar errores de Puppeteer
        this.client.on('error', (error) => {
            console.error(chalk.red('❌ Error de WhatsApp:'), error);
            this.isReady = false;
            if (error.message.includes('Execution context was destroyed')) {
                this.handleDisconnection();
            }
        });
    }

    async handleDisconnection() {
        if (this.isReconnecting) return;
        
        this.isReconnecting = true;
        console.log(chalk.yellow('🔄 Intentando reconectar...'));
        
        try {
            await this.sleep(5000); // Esperar 5 segundos
            await this.client.initialize();
        } catch (error) {
            console.error(chalk.red('❌ Error al reconectar:'), error);
            console.log(chalk.yellow('🔄 Reintentando en 10 segundos...'));
            setTimeout(() => this.handleDisconnection(), 10000);
        }
    }

    async waitForReady() {
        while (!this.isReady) {
            console.log(chalk.yellow('⏳ Esperando que WhatsApp esté listo...'));
            await this.sleep(1000);
        }
    }

    async showMenu() {
        const choices = [
            {
                name: '🔔 Notificar todo desde el principio',
                value: 'all'
            },
            {
                name: '▶️ Continuar desde la última notificación',
                value: 'continue'
            },
            {
                name: '📊 Ver estadísticas',
                value: 'stats'
            },
            {
                name: '🧪 Probar formato de teléfono',
                value: 'test'
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
            case 'all':
                await this.processAllNotifications(true);
                break;
            case 'continue':
                await this.processAllNotifications(false);
                break;
            case 'stats':
                await this.showStats();
                break;
            case 'test':
                await this.testPhoneFormat();
                break;
            case 'exit':
                process.exit(0);
                break;
        }
    }

    async testPhoneFormat() {
        const vehicles = this.readExcelData();
        console.log(chalk.blue('🧪 Probando formato de teléfonos:'));
        
        for (const vehicle of vehicles) {
            console.log(`Patente: ${vehicle.Patente}`);
            console.log(`Teléfono original: ${vehicle.TelefonoOriginal}`);
            console.log(`Teléfono formateado: ${vehicle.Telefono}`);
            console.log(`Válido: ${vehicle.Telefono ? '✅' : '❌'}`);
            console.log('---');
        }
        
        setTimeout(() => this.showMenu(), 5000);
    }

    async processAllNotifications(fromStart = false) {
        try {
            await this.waitForReady();
            
            const vehicles = this.readExcelData();
            const processed = fromStart ? [] : this.getProcessedNumbers();
            
            console.log(chalk.blue(`📋 Procesando ${vehicles.length} vehículos...`));
            
            let successCount = 0;
            let errorCount = 0;
            let skippedCount = 0;

            for (const vehicle of vehicles) {
                // Verificar si WhatsApp sigue conectado
                if (!this.isReady) {
                    console.log(chalk.yellow('⚠️ WhatsApp se desconectó, esperando reconexión...'));
                    await this.waitForReady();
                }

                // Verificar si el teléfono es válido
                if (!vehicle.Telefono) {
                    console.log(chalk.red(`❌ Teléfono inválido para ${vehicle.Patente}, saltando...`));
                    errorCount++;
                    this.logError(vehicle.Patente, vehicle.TelefonoOriginal, 'Formato de teléfono inválido');
                    continue;
                }

                if (!fromStart && processed.includes(vehicle.Patente)) {
                    skippedCount++;
                    continue;
                }

                const result = await this.processVehicle(vehicle);
                
                if (result.success) {
                    successCount++;
                    this.markAsProcessed(vehicle.Patente, vehicle.Telefono);
                } else {
                    errorCount++;
                    this.logError(vehicle.Patente, vehicle.Telefono, result.error);
                }

                // Pausa entre mensajes para evitar spam
                const tiempoEspera = Math.floor(Math.random() * (10000) + 10000);
                await this.sleep(tiempoEspera);
            }

            console.log(chalk.green(`✅ Proceso completado:`));
            console.log(`- Enviados: ${successCount}`);
            console.log(`- Errores: ${errorCount}`);
            console.log(`- Omitidos: ${skippedCount}`);

        } catch (error) {
            console.error(chalk.red('❌ Error procesando notificaciones:'), error);
            this.log(`ERROR: ${error.message}`);
        }

        setTimeout(() => this.showMenu(), 3000);
    }

    readExcelData() {
        try {
            const workbook = XLSX.readFile(this.excelFile);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            // Filtrar filas vacías y limpiar datos
            const cleanData = data.filter(row => {
                // Verificar que al menos tenga patente y teléfono
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
                    Serie: row.SERIE || ''
                };
            });
        } catch (error) {
            console.error(chalk.red('❌ Error leyendo Excel:'), error);
            return [];
        }
    }

    formatPhone(phone) {
        if (!phone) return '';
        
        // Convertir a string y limpiar
        let cleaned = phone.toString().replace(/\D/g, '');
        
        console.log(chalk.gray(`🔍 Procesando teléfono: ${phone} -> ${cleaned}`));
        
        // Si está vacío después de limpiar, retornar vacío
        if (!cleaned) return '';
        
        // Si empieza con 0, lo quitamos
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }
    
        // Si no tiene código país, agregamos 54
        if (!cleaned.startsWith('54')) {
            cleaned = '54' + cleaned;
        }
    
        // Verificar longitud mínima (54 + área + número)
        // Para Argentina: 54 + código área (2-4 dígitos) + número (6-8 dígitos)
        if (cleaned.length < 10 || cleaned.length > 15) {
            console.log(chalk.red(`❌ Teléfono con longitud inválida: ${cleaned} (longitud: ${cleaned.length})`));
            return '';
        }
    
        const whatsappNumber = cleaned + '@c.us';
        console.log(chalk.green(`✅ Teléfono formateado: ${whatsappNumber}`));
        return whatsappNumber;
    }

    async processVehicle(vehicle) {
        try {
            const today = moment();
            const vencimiento = moment(vehicle.FechaDeVencimiento, 'MM/DD/YY');
            
            if (!vencimiento.isValid()) {
                throw new Error(`Fecha de vencimiento inválida: ${vehicle.FechaDeVencimiento}`);
            }
            
            const diasDiferencia = vencimiento.diff(today, 'days');

            let message = '';
            let shouldNotify = false;

            // CAMBIO PRINCIPAL: Notificar cuando faltan 15 días o menos (pero no vencidas)
            if (diasDiferencia >= 0 && diasDiferencia <= 15) {
                if (diasDiferencia === 0) {
                    // Vence hoy
                    message = `🚨 ¡URGENTE! Tu vehículo *${vehicle.Marca} ${vehicle.Modelo}* con patente *${vehicle.Patente}* tiene la VTV que *VENCE HOY*.\n\n📅 Fecha de vencimiento: ${vencimiento.format('DD/MM/YYYY')}\n\n⚠️ Es fundamental que renueves la VTV cuanto antes para evitar multas.`;
                } else if (diasDiferencia === 1) {
                    // Vence mañana
                    message = `🚨 ¡URGENTE! Tu vehículo *${vehicle.Marca} ${vehicle.Modelo}* con patente *${vehicle.Patente}* tiene la VTV que vence *MAÑANA*.\n\n📅 Fecha de vencimiento: ${vencimiento.format('DD/MM/YYYY')}\n\n⚠️ Es fundamental que renueves la VTV cuanto antes para evitar multas.`;
                } else {
                    // Vence en X días (2-15 días)
                    message = `🚗 ¡Hola! Tu vehículo *${vehicle.Marca} ${vehicle.Modelo}* con patente *${vehicle.Patente}* tiene la VTV que vence en *${diasDiferencia} días*.\n\n📅 Fecha de vencimiento: ${vencimiento.format('DD/MM/YYYY')}\n\n⚠️ Te recomendamos que saques turno cuanto antes para evitar problemas.`;
                }
                shouldNotify = true;
            } else if (diasDiferencia < 0) {
                // Ya vencida
                const diasVencido = Math.abs(diasDiferencia);
                message = `🚨 ¡ATENCIÓN! Tu vehículo *${vehicle.Marca} ${vehicle.Modelo}* con patente *${vehicle.Patente}* tiene la VTV *VENCIDA* desde hace *${diasVencido} días*.\n\n📅 Fecha de vencimiento: ${vencimiento.format('DD/MM/YYYY')}\n\n⚠️ Es urgente que renueves la VTV para evitar multas.`;
                shouldNotify = true;
            }

            if (shouldNotify) {
                await this.sendMessage(vehicle.Telefono, message);
                this.log(`✅ Notificación enviada a ${vehicle.Patente} (${vehicle.Telefono}) - ${diasDiferencia} días`);
                return { success: true };
            } else {
                this.log(`ℹ️ Vehículo ${vehicle.Patente} no requiere notificación (${diasDiferencia} días para vencimiento)`);
                return { success: true, skipped: true };
            }

        } catch (error) {
            console.error(chalk.red(`❌ Error procesando vehículo ${vehicle.Patente}:`), error);
            return { success: false, error: error.message };
        }
    }

    async sendMessage(phone, message) {
        let retries = 3;
        
        while (retries > 0) {
            try {
                await this.waitForReady();
                
                console.log(chalk.gray(`📨 Enviando mensaje a ${phone}... (intentos restantes: ${retries})`));
                
                // Verificar que el número es válido antes de intentar enviarlo
                if (!phone.includes('@c.us')) {
                    throw new Error('Formato de número inválido');
                }
                
                await this.client.sendMessage(phone, message);
                console.log(chalk.green(`✅ Mensaje enviado exitosamente a ${phone}`));
                
                return true;
                
            } catch (error) {
                console.error(chalk.red(`❌ Error enviando mensaje a ${phone} (intento ${4-retries}):`, error.message));
                retries--;
                
                if (retries > 0) {
                    // Si el error es de contexto destruído, esperar más tiempo
                    if (error.message.includes('Execution context was destroyed')) {
                        console.log(chalk.yellow('⏳ Esperando reconexión...'));
                        this.isReady = false;
                        await this.sleep(10000);
                    } else {
                        await this.sleep(3000);
                    }
                } else {
                    throw new Error(`Error enviando mensaje después de 3 intentos: ${error.message}`);
                }
            }
        }
    }

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
                Timestamp: now.toISOString()
            });

            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Procesados');
            XLSX.writeFile(newWorkbook, this.processedFile);
        } catch (error) {
            console.error('Error marcando como procesado:', error);
        }
    }

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

    async showStats() {
        try {
            const vehicles = this.readExcelData();
            const processed = this.getProcessedNumbers();
            
            console.log(chalk.blue('📊 Estadísticas:'));
            console.log(`- Total vehículos en Excel: ${vehicles.length}`);
            console.log(`- Procesados: ${processed.length}`);
            console.log(`- Pendientes: ${vehicles.length - processed.length}`);
            
            // Mostrar vehículos con teléfonos inválidos
            const invalidPhones = vehicles.filter(v => !v.Telefono);
            if (invalidPhones.length > 0) {
                console.log(chalk.red(`- Teléfonos inválidos: ${invalidPhones.length}`));
                invalidPhones.forEach(v => {
                    console.log(chalk.red(`  • ${v.Patente}: ${v.TelefonoOriginal}`));
                });
            }
            
            // Mostrar estadísticas de vencimientos
            const today = moment();
            const vencimientoStats = vehicles.reduce((acc, vehicle) => {
                const vencimiento = moment(vehicle.FechaDeVencimiento, 'MM/DD/YY');
                if (vencimiento.isValid()) {
                    const dias = vencimiento.diff(today, 'days');
                    if (dias < 0) {
                        acc.vencidas++;
                    } else if (dias <= 15) {
                        acc.porVencer++;
                    } else {
                        acc.vigentes++;
                    }
                }
                return acc;
            }, { vencidas: 0, porVencer: 0, vigentes: 0 });
            
            console.log(chalk.blue('📅 Estado de vencimientos:'));
            console.log(`- VTV vencidas: ${vencimientoStats.vencidas}`);
            console.log(`- Por vencer (≤15 días): ${vencimientoStats.porVencer}`);
            console.log(`- Vigentes (>15 días): ${vencimientoStats.vigentes}`);
            
            if (fs.existsSync(this.errorFile)) {
                const workbook = XLSX.readFile(this.errorFile);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const errors = XLSX.utils.sheet_to_json(worksheet);
                console.log(`- Errores: ${errors.length}`);
            }
        } catch (error) {
            console.error('Error mostrando estadísticas:', error);
        }
        
        setTimeout(() => this.showMenu(), 5000);
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        
        fs.appendFileSync(this.logFile, logMessage);
        console.log(message);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async start() {
        console.log(chalk.blue('🚀 Iniciando aplicación de notificaciones VTV...'));
        
        try {
            await this.client.initialize();
        } catch (error) {
            console.error(chalk.red('❌ Error iniciando WhatsApp:'), error);
            console.log(chalk.yellow('🔄 Reintentando en 5 segundos...'));
            setTimeout(() => this.start(), 5000);
        }
    }
}

// Iniciar la aplicación
const notifier = new VTVNotifier();
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