# VTV Notifier v2.2 🚗📱

Sistema automatizado de notificaciones WhatsApp para vencimientos de Verificación Técnica Vehicular (VTV), optimizado para notificar únicamente los vencimientos más próximos de un mes específico.

## 🚀 Nuevas características v2.2

- ✅ **Límite de 20 notificaciones por ejecución**
- ✅ **Selector dinámico de mes y año** - Puedes elegir cualquier mes de cualquier año disponible
- ✅ **Filtrado específico por período seleccionado**
- ✅ **Ordenamiento por fecha de vencimiento más próxima**
- ✅ **Vista de distribución por meses** - Gráfico visual de vencimientos
- ✅ **Arquitectura modular en múltiples archivos**
- ✅ **Mensajes personalizados centralizados**
- ✅ **Configuración centralizada y flexible**
- ✅ **Estadísticas mejoradas y dinámicas**

## 📁 Estructura del proyecto

```
vtc v2.2/
├── config/
│   ├── config.js           # Configuración general
│   └── messages.js         # Mensajes personalizados
├── services/
│   ├── excelService.js     # Manejo de archivos Excel
│   ├── whatsappService.js  # Servicio de WhatsApp
│   ├── notificationService.js # Lógica de notificaciones
│   └── fileService.js      # Manejo de archivos y logs
├── logs/                   # Logs de la aplicación
├── errores/               # Registro de errores
├── procesados/            # Registro de procesados
├── datos_vehiculos.xlsx   # Archivo de datos
├── package.json           # Dependencias
├── index.js              # Archivo principal
└── README.md             # Esta documentación
```

## 📊 Datos del Excel analizados

**Archivo:** `datos_vehiculos.xlsx`
- **Total de registros:** 13,256 vehículos
- **Columnas disponibles:**
  1. `Patente` - Patente del vehículo
  2. `Telefono` - Número de teléfono
  3. `FechaDeRevision` - Fecha de la última revisión
  4. `FechaDeVencimiento` - Fecha de vencimiento (formato MM/DD/YY)
  5. `SERIE` - Serie del vehículo
  6. `MARCA` - Marca del vehículo
  7. `MODELO` - Modelo del vehículo
  8. `EMAIL` - Correo electrónico

### 📈 Estadísticas disponibles por período
- **2024:** 490 vehículos
- **2025:** 8,916 vehículos (incluyendo 1,046 en octubre)
- **2026:** 3,814 vehículos
- **Total general:** 13,256 registros
- **Con teléfonos válidos:** Variable por período

## ⚙️ Configuración

### Archivo `config/config.js`
```javascript
const CONFIG = {
    // Configuración principal
    MAX_NOTIFICATIONS_PER_RUN: 20,        // Máximo 20 por ejecución
    DEFAULT_TARGET_YEAR: 2025,            // Año por defecto
    AVAILABLE_YEARS: [2024, 2025, 2026],  // Años disponibles para selección

    // Archivos
    EXCEL_FILE: 'datos_vehiculos.xlsx',

    // WhatsApp
    COUNTRY_CODE: '54',                   // Argentina
    RETRY_ATTEMPTS: 3,
    MESSAGE_DELAY_MIN: 10000,             // 10 segundos
    MESSAGE_DELAY_MAX: 20000              // 20 segundos

    // NOTA: Mes y año se seleccionan dinámicamente desde el menú
};
```

### Archivo `config/messages.js`
Contiene todas las plantillas de mensajes personalizados:
- `URGENTE_HOY` - Para vehículos que vencen hoy
- `URGENTE_PROXIMO` - Para vehículos que vencen en 1-5 días
- `AVISO_NORMAL` - Para vehículos que vencen en más de 5 días
- `VENCIDA` - Para vehículos con VTV vencida

## 🛠️ Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm
- Google Chrome instalado (para WhatsApp Web)

### Pasos de instalación
```bash
# Navegar al directorio
cd "vtc v2.2"

# Instalar dependencias
npm install

# Verificar que el archivo Excel está presente
ls datos_vehiculos.xlsx
```

### Dependencias principales
```json
{
  "whatsapp-web.js": "^1.23.0",
  "xlsx": "^0.18.5",
  "moment": "^2.29.4",
  "inquirer": "^8.2.6",
  "fs-extra": "^11.2.0",
  "chalk": "^4.1.2",
  "qrcode-terminal": "^0.12.0"
}
```

## 🎯 Uso

### Ejecutar la aplicación
```bash
node index.js
```

### Menú principal
1. **🗓️ Seleccionar mes y año para notificar**
   - Permite elegir cualquier año de los disponibles (2024, 2025, 2026)
   - Permite elegir cualquier mes del año seleccionado
   - Muestra información instantánea del período seleccionado

2. **🔔 Notificar vencimientos del período seleccionado (máximo 20)**
   - Filtra vehículos que vencen en el mes/año seleccionado
   - Los ordena por fecha de vencimiento más próxima
   - Notifica únicamente los primeros 20
   - *Nota: Esta opción se habilita solo después de seleccionar un período*

3. **📊 Ver estadísticas**
   - Muestra estadísticas completas del sistema
   - Incluye información del período seleccionado
   - Teléfonos válidos/inválidos
   - Procesados y errores

4. **📅 Ver distribución por meses**
   - Gráfico visual de todos los vencimientos por mes/año
   - Barra visual proporcional a la cantidad
   - Totales por año

5. **🧪 Probar formato de teléfono**
   - Prueba el formateo de los primeros 5 teléfonos

6. **📋 Ver configuración actual**
   - Muestra toda la configuración del sistema
   - Incluye el período actualmente seleccionado

### Primer uso
1. Ejecutar `node index.js`
2. Escanear el código QR con WhatsApp
3. Esperar mensaje "✅ WhatsApp Web está listo!"
4. **Seleccionar mes y año** desde el menú principal
5. Verificar la información del período seleccionado
6. Ejecutar las notificaciones

## 🔧 Servicios

### ExcelService
- **Responsabilidad:** Lectura y procesamiento del archivo Excel
- **Funciones principales:**
  - `readExcelData()` - Lee y limpia los datos del Excel
  - `filterSpecificPeriod()` - Filtra por mes/año específico (dinámico)
  - `filterTargetVencimientos()` - Filtra octubre 2025 (legacy)
  - `sortByVencimiento()` - Ordena por fecha más próxima
  - `getMonthDistribution()` - Obtiene distribución por mes/año
  - `formatPhone()` - Formatea números telefónicos

### WhatsAppService
- **Responsabilidad:** Manejo de la conexión y envío de mensajes
- **Funciones principales:**
  - `sendMessage()` - Envía mensajes con reintentos
  - `waitForReady()` - Espera conexión lista
  - `handleDisconnection()` - Maneja reconexiones

### NotificationService
- **Responsabilidad:** Lógica de notificaciones y generación de mensajes
- **Funciones principales:**
  - `processVehicle()` - Procesa un vehículo individual
  - `generateMessage()` - Genera mensaje según días restantes
  - `processTargetNotifications()` - Procesa lote de notificaciones

### FileService
- **Responsabilidad:** Manejo de archivos, logs y persistencia
- **Funciones principales:**
  - `log()` - Registra eventos en logs
  - `markAsProcessed()` - Marca vehículos como procesados
  - `logError()` - Registra errores en Excel

## 📋 Logs y archivos generados

### `logs/notificaciones.log`
```
[2025-09-29T10:30:00.000Z] ✅ Notificación enviada a ABC123 (541234567890@c.us) - 5 días
[2025-09-29T10:30:30.000Z] ❌ Error enviando mensaje a XYZ789: Formato de número inválido
```

### `procesados/procesados.xlsx`
| Patente | Telefono | FechaProcesado | HoraProcesado | Timestamp | Version |
|---------|----------|----------------|---------------|-----------|---------|
| ABC123 | 541234567890@c.us | 29/09/2025 | 10:30:00 | 2025-09-29T... | v2.2 |

### `errores/errores_envio.xlsx`
| Patente | Telefono | Error | Fecha | Hora | Timestamp |
|---------|----------|--------|--------|------|-----------|
| XYZ789 | 123invalid | Formato inválido | 29/09/2025 | 10:31:00 | 2025-09-29T... |

## 🎯 Lógica de filtrado

### Criterios de filtrado
1. **Año:** Según selección del usuario (2024, 2025, o 2026)
2. **Mes:** Según selección del usuario (enero a diciembre)
3. **Teléfono válido:** Solo vehículos con teléfono formateado correctamente
4. **Ordenamiento:** Por fecha de vencimiento ascendente (más próximos primero)
5. **Límite:** Máximo 20 notificaciones por ejecución

### Flujo de selección
1. El usuario selecciona el año de los disponibles
2. El usuario selecciona el mes del año elegido
3. El sistema muestra información del período seleccionado
4. El sistema filtra y ordena automáticamente
5. Se procesan las primeras 20 notificaciones

### Formato de teléfonos
- Se limpia de caracteres no numéricos
- Se remueve el 0 inicial si existe
- Se agrega código de país 54 si no existe
- Se valida longitud entre 10-15 dígitos
- Se convierte a formato WhatsApp: `54XXXXXXXXX@c.us`

### Tipos de mensajes según días restantes
- **0 días:** 🚨 URGENTE - Vence HOY
- **1-5 días:** 🚨 URGENTE - Vence en X días
- **6+ días:** 🔔 AVISO - Vence en X días
- **Vencida:** 🚨 ATENCIÓN - Vencida hace X días

## ⚡ Optimizaciones v2.2

1. **Arquitectura modular:** Código separado en servicios especializados
2. **Configuración centralizada:** Todas las configuraciones en un archivo
3. **Filtrado dinámico:** Permite seleccionar cualquier mes/año disponible
4. **Vista de distribución:** Gráfico visual de vencimientos por período
5. **Límite de ejecución:** Máximo 20 notificaciones para evitar spam
6. **Ordenamiento optimizado:** Prioriza vencimientos más urgentes
7. **Mensajes personalizados:** Plantillas centralizadas y customizables
8. **Mejor manejo de errores:** Logs detallados y reintentos inteligentes
9. **Interfaz mejorada:** Menús interactivos con información en tiempo real

## 🔍 Localización de archivos de mensajes

Los mensajes personalizados se encuentran en:
- **Ubicación principal:** `config/messages.js`
- **Configuración:** `config/config.js`
- **Mensajes en Python (otro sistema):** `C:\Users\Agus\Desktop\Archivos de mas\software\SistemaNotificacionVTV\Main\debug_configuracion_mensaje.py`

El sistema actual (v2.2) utiliza los mensajes de JavaScript en `config/messages.js` que son completamente customizables.

## 🛡️ Características de seguridad

- Validación de números de teléfono
- Límite de mensajes por ejecución
- Delays aleatorios entre mensajes (10-20 segundos)
- Reintentos limitados (máximo 3)
- Logs completos de todas las operaciones
- Manejo de reconexiones automáticas

## 🆘 Solución de problemas

### Error: "No se puede leer el archivo Excel"
- Verificar que `datos_vehiculos.xlsx` existe en el directorio
- Verificar permisos de lectura del archivo

### Error: "WhatsApp no se conecta"
- Cerrar otras sesiones de WhatsApp Web
- Limpiar la carpeta `.wwebjs_auth`
- Reiniciar la aplicación

### Error: "Teléfonos inválidos"
- Revisar el formato en el Excel
- Usar el menú "Probar formato de teléfono" para debug

### Error: "No hay vehículos para notificar"
- Verificar que hay vehículos en octubre 2025
- Revisar la configuración en `config/config.js`

## 📞 Soporte

Para soporte técnico:
1. Revisar los logs en `logs/notificaciones.log`
2. Verificar errores en `errores/errores_envio.xlsx`
3. Usar el menú de estadísticas para diagnóstico

---

**VTV Notifier v2.2** - Sistema de notificaciones WhatsApp optimizado para Alto Verde
*Desarrollado en Node.js - Septiembre 2025*