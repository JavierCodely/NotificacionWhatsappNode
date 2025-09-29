const XLSX = require('xlsx');
const chalk = require('chalk');

console.log(chalk.blue('🔍 DEBUG: Verificando lectura del archivo Excel'));

try {
    // Intentar leer el archivo
    console.log('Intentando leer: datos_vehiculos_test.xlsx');

    const workbook = XLSX.readFile('datos_vehiculos_test.xlsx');
    console.log(chalk.green('✅ Archivo leído exitosamente'));

    console.log('Hojas disponibles:', workbook.SheetNames);

    const sheetName = workbook.SheetNames[0];
    console.log('Usando hoja:', sheetName);

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(chalk.blue(`📊 Total de filas en Excel: ${data.length}`));

    if (data.length > 0) {
        console.log(chalk.cyan('\n🔍 Primera fila de datos:'));
        console.log(data[0]);

        console.log(chalk.cyan('\n🔍 Columnas encontradas:'));
        console.log(Object.keys(data[0]));

        console.log(chalk.cyan('\n🔍 Primeras 3 filas:'));
        data.slice(0, 3).forEach((row, index) => {
            console.log(`Fila ${index + 1}:`, {
                Patente: row.Patente,
                Telefono: row.Telefono,
                FechaDeVencimiento: row.FechaDeVencimiento,
                MARCA: row.MARCA,
                MODELO: row.MODELO
            });
        });

        // Filtrar solo las que tienen patente y teléfono
        const cleanData = data.filter(row => {
            return row.Patente && row.Telefono;
        });

        console.log(chalk.yellow(`\n📋 Filas con Patente y Teléfono: ${cleanData.length}`));

        // Verificar fechas de octubre 2025
        const moment = require('moment');
        const octubreCount = cleanData.filter(row => {
            const vencimiento = moment(row.FechaDeVencimiento, 'MM/DD/YY');
            if (!vencimiento.isValid()) {
                console.log(chalk.red(`❌ Fecha inválida: ${row.FechaDeVencimiento} en ${row.Patente}`));
                return false;
            }

            const esOctubre2025 = vencimiento.year() === 2025 && vencimiento.month() === 9; // Octubre es mes 9
            if (esOctubre2025) {
                console.log(chalk.green(`✅ Octubre 2025: ${row.Patente} - ${row.FechaDeVencimiento} - ${vencimiento.format('DD/MM/YYYY')}`));
            }
            return esOctubre2025;
        }).length;

        console.log(chalk.green(`\n🎯 Vehículos de Octubre 2025: ${octubreCount}`));

    } else {
        console.log(chalk.red('❌ No se encontraron datos en el archivo'));
    }

} catch (error) {
    console.error(chalk.red('❌ Error leyendo archivo:'), error);
}