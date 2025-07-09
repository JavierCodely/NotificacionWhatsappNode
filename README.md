# Notificador VTV WhatsApp

Sistema automatizado para notificar vencimientos de VTV (Verificación Técnica Vehicular) a través de WhatsApp.

## 🚀 Instalación

### Requisitos previos

* Node.js 16 o superior
* npm
* WhatsApp instalado en tu teléfono

### Instalación automática

```bash
# Dar permisos de ejecución al script
chmod +x setup.sh

# Ejecutar instalación
./setup.sh
```

### Instalación manual

```bash
# Clonar o descargar el proyecto
npm install

# Crear directorios necesarios
mkdir -p logs errores procesados
```

## 📋 Configuración

### 1. Preparar archivo Excel

Coloca tu archivo Excel en el directorio raíz con el nombre `datos_vehiculos.xlsx`

**Estructura requerida:**

* **Columna A** : Patente
* **Columna B** : Telefono (formato: 5493757675...)
* **Columna C** : FechaDeVencimiento (formato: MM/DD/YY)
* **Columna E** : MARCA
* **Columna F** : MODELO

### 2. Formato de números de teléfono

* Incluir código de país (54 para Argentina)
* Ejemplo: `5493757675123`
* El sistema añadirá automáticamente el código si no está presente

## 🎯 Uso

### Iniciar la aplicación

```bash
npm start
```

### Desarrollo

```bash
npm run dev
```

### Flujo de trabajo

1. **Escanear QR** : Al iniciar, escanea el código QR con WhatsApp Web
2. **Menú principal** : Elige una opción:

* 🔔 Notificar todo desde el principio
* ▶️ Continuar desde la última notificación
* 📊 Ver estadísticas
* ❌ Salir

## 📨 Tipos de notificaciones

### ⚠️ Aviso 15 días antes

```
🚗 ¡Hola! Tu vehículo *MARCA MODELO* con patente *ABC123* tiene la VTV que vence en 15 días.

📅 Fecha de vencimiento: 15/08/2025

⚠️ Te recomendamos que saques turno cuanto antes para evitar problemas.
```

### 🚨 VTV vencida

```
🚨 ¡ATENCIÓN! Tu vehículo *MARCA MODELO* con patente *ABC123* tiene la VTV VENCIDA desde hace 5 días.

📅 Fecha de vencimiento: 01/08/2025

⚠️ Es urgente que renueves la VTV para evitar multas.
```

## 📁 Archivos generados

### `/logs/notificaciones.log`

Registro completo de todas las operaciones:

```
[2025-07-09T10:30:00.000Z] ✅ Notificación enviada a ABC123 (5493757675123@c.us)
[2025-07-09T10:30:02.000Z] ❌ Error enviando a XYZ789: Invalid phone number
```

### `/errores/errores_envio.xlsx`

Excel con errores de envío:

* Patente
* Telefono
* Error (descripción del error)
* Fecha

### `/procesados/procesados.xlsx`

Excel con registros procesados exitosamente:

* Patente
* Telefono
* FechaProcesado
* Timestamp

## 🔧 Características

### ✅ Funcionalidades principales

* ✅ Lectura automática de Excel
* ✅ Detección de vencimientos (15 días antes y vencidos)
* ✅ Envío masivo de mensajes WhatsApp
* ✅ Sistema de logs detallado
* ✅ Manejo de errores con registro
* ✅ Continuación desde última notificación
* ✅ Formateo automático de números de teléfono
* ✅ Estadísticas en tiempo real
* ✅ Pausa entre mensajes anti-spam
* ✅ Interfaz de terminal interactiva

### 🛡️ Seguridad y robustez

* Validación de formato de teléfonos
* Manejo de errores de red
* Recuperación automática después de fallos
* Logs detallados para auditoría
* Prevención de duplicados

## 📊 Estadísticas

El sistema muestra:

* Total de vehículos en el Excel
* Cantidad de notificaciones enviadas
* Errores encontrados
* Pendientes por procesar

## 🚨 Manejo de errores comunes

### Error: "Invalid phone number"

* Verificar formato del número (código de país incluido)
* Verificar que el número esté registrado en WhatsApp

### Error: "Rate limit exceeded"

* El sistema incluye pausas automáticas de 2 segundos
* WhatsApp puede limitar mensajes masivos

### Error: "Authentication failed"

* Escanear nuevamente el código QR
* Verificar conexión a internet

## 🔄 Flujo de recuperación

Si la aplicación se interrumpe:

1. Reiniciar con `npm start`
2. Seleccionar "Continuar desde la última notificación"
3. El sistema omitirá automáticamente los ya procesados

## 📝 Personalización

### Modificar mensajes

Editar las plantillas en la función `processVehicle()` del archivo `index.js`

### Cambiar días de aviso

Modificar la condición `diasDiferencia === 15` por el número deseado

### Agregar más validaciones

Extender la función `formatPhone()` para otros países

## 🤝 Soporte

Para problemas o sugerencias:

1. Revisar los logs en `/logs/notificaciones.log`
2. Verificar errores en `/errores/errores_envio.xlsx`
3. Asegurar formato correcto del Excel fuente

## 📄 Licencia

MIT - Uso libre con atribución
