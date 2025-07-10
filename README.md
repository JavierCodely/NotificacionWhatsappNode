
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
#Luego ejecuta aparte
npm install inquirer@8
```

### Instalación manual

```bash
# Clonar o descargar el proyecto
npm install

# Crear directorios necesarios
mkdir -p logs errores procesados
#ejecuta aparte
npm install inquirer@8
```

## 📋 Configuración

### 1. Preparar archivo Excel

Coloca tu archivo Excel en el directorio raíz con el nombre `prueba.xlsx`

**Estructura requerida:**

* **Columna Patente** : Patente del vehículo
* **Columna Telefono** : Número de teléfono (formato: 5493757675...)
* **Columna FechaDeVencimiento** : Fecha de vencimiento (formato: MM/DD/YY)
* **Columna MARCA** : Marca del vehículo
* **Columna MODELO** : Modelo del vehículo
* **Columna SERIE** : Serie del vehículo

### 2. Formato de números de teléfono

* Incluir código de país (54 para Argentina)
* Ejemplo: `5493757675123`
* El sistema añadirá automáticamente el código si no está presente
* Se eliminan automáticamente los ceros iniciales
* Validación de longitud (10-15 dígitos)

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
* 🧪 Probar formato de teléfono
* ❌ Salir

## 🆕 Nuevas características

### 🔄 Reconexión automática

* Detección automática de desconexiones
* Reintento automático cada 5-10 segundos
* Manejo de errores de contexto de Puppeteer

### 🧪 Prueba de formato de teléfono

* Nueva opción en el menú para probar formatos
* Muestra teléfonos originales vs formateados
* Validación visual de números

### 📊 Estadísticas avanzadas

* Conteo de VTV vencidas, por vencer y vigentes
* Identificación de teléfonos inválidos
* Resumen completo de procesamiento

### 🛡️ Validación mejorada

* Filtrado automático de filas vacías
* Validación de fechas de vencimiento
* Manejo robusto de datos incompletos

### ⚡ Sistema de reintentos

* 3 intentos automáticos por mensaje
* Pausa inteligente entre reintentos
* Manejo específico de errores de contexto

## 📨 Tipos de notificaciones

### 🔔 Aviso preventivo (2-15 días)

```
🔔 ¡AVISO! 🔔 

Hola, somos de la Verificación Técnica Vehicular Alto Verde. 

Queremos informarte que tu vehículo *MARCA MODELO* con patente *ABC123* la VTV vence en *7 días*.

📅 Fecha de vencimiento: 15/08/2025

⚠️Por disposición de la nueva ley vigente, se aplicará un recargo trimestral del 35% a quienes circulen con la VTV vencida más de 10 días. Te recomendamos renovarla pronto para evitar inconvenientes.

¡Saludos del equipo de Alto Verde! 👨‍🔧
```

### 🚨 VTV vence mañana

```
🚨 ¡URGENTE! 🚨

Hola, somos de la Verificación Técnica Vehicular Alto Verde. 

Queremos informarte que tu vehículo *MARCA MODELO* con patente *ABC123* la VTV que vence *MAÑANA*.

📅 Fecha de vencimiento: 15/08/2025

⚠️Por disposición de la nueva ley vigente, se aplicará un recargo trimestral del 35% a quienes circulen con la VTV vencida más de 10 días. Te recomendamos renovarla pronto para evitar inconvenientes.

¡Saludos del equipo de Alto Verde! 👨‍🔧
```

### 🚨 VTV vence hoy

```
🚨 ¡URGENTE! 🚨

Hola, somos de la Verificación Técnica Vehicular Alto Verde.

Queremos informarte que tu vehículo *MARCA MODELO* con patente *ABC123* la VTV *VENCE HOY*.

📅 Fecha de vencimiento: 15/08/2025

⚠️Por disposición de la nueva ley vigente, se aplicará un recargo trimestral del 35% a quienes circulen con la VTV vencida más de 10 días. Te recomendamos renovarla pronto para evitar inconvenientes.

¡Saludos del equipo de Alto Verde! 👨‍🔧
```

### 🚨 VTV vencida

```
🚨 ¡ATENCIÓN! 🚨

Hola, somos de la Verificación Técnica Vehicular Alto Verde. 

Queremos informarte que tu vehículo *MARCA MODELO* con patente *ABC123* tiene la VTV *VENCIDA* desde hace *5 días*.

📅 Fecha de vencimiento: 01/08/2025

⚠️Por disposición de la nueva ley vigente, se aplicará un recargo trimestral del 35% a quienes circulen con la VTV vencida más de 10 días. Es urgente que la renueves para evitar inconvenientes.

¡Saludos del equipo de Alto Verde! 👨‍🔧
```

## 📁 Archivos generados

### `/logs/notificaciones.log`

Registro completo de todas las operaciones:

```
[2025-07-09T10:30:00.000Z] ✅ Notificación enviada a ABC123 (5493757675123@c.us) - 7 días
[2025-07-09T10:30:02.000Z] ❌ Error enviando a XYZ789: Invalid phone number
[2025-07-09T10:30:05.000Z] ℹ️ Vehículo DEF456 no requiere notificación (30 días para vencimiento)
```

### `/errores/errores_envio.xlsx`

Excel con errores de envío:

* Patente
* Telefono
* Error (descripción del error)
* Fecha
* Hora
* Timestamp

### `/procesados/procesados.xlsx`

Excel con registros procesados exitosamente:

* Patente
* Telefono
* FechaProcesado
* HoraProcesado
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
* ✅ Pausa aleatoria entre mensajes anti-spam (10-20 segundos)
* ✅ Interfaz de terminal interactiva
* ✅ **Reconexión automática** 🆕
* ✅ **Prueba de formato de teléfonos** 🆕
* ✅ **Sistema de reintentos mejorado** 🆕
* ✅ **Validación avanzada de datos** 🆕

### 🛡️ Seguridad y robustez

* Validación de formato de teléfonos con longitud
* Manejo de errores de red y contexto
* Recuperación automática después de fallos
* Logs detallados para auditoría
* Prevención de duplicados
* Filtrado automático de datos inválidos
* Sistema de reintentos con backoff

### 🕐 Gestión de tiempo

* Pausa aleatoria entre mensajes (10-20 segundos)
* Detección automática de desconexiones
* Reintentos con espera progresiva
* Manejo de límites de WhatsApp

## 📊 Estadísticas avanzadas

El sistema muestra:

* Total de vehículos en el Excel
* Cantidad de notificaciones enviadas
* Errores encontrados
* Pendientes por procesar
* **VTV vencidas** 🆕
* **VTV por vencer (≤15 días)** 🆕
* **VTV vigentes (>15 días)** 🆕
* **Teléfonos inválidos con detalle** 🆕

## 🚨 Manejo de errores comunes

### Error: "Invalid phone number"

* Verificar formato del número (código de país incluido)
* Usar la función "Probar formato de teléfono" del menú
* Verificar que el número esté registrado en WhatsApp

### Error: "Rate limit exceeded"

* El sistema incluye pausas automáticas de 10-20 segundos
* WhatsApp puede limitar mensajes masivos

### Error: "Authentication failed"

* Escanear nuevamente el código QR
* Verificar conexión a internet
* El sistema reintentará automáticamente

### Error: "Execution context was destroyed"

* **Nuevo manejo automático** 🆕
* El sistema detecta y reconecta automáticamente
* Pausa de 10 segundos antes de reintentar

## 🔄 Flujo de recuperación

Si la aplicación se interrumpe:

1. Reiniciar con `npm start`
2. Seleccionar "Continuar desde la última notificación"
3. El sistema omitirá automáticamente los ya procesados
4. **Reconexión automática** si se pierde la conexión 🆕

## 📝 Personalización

### Modificar mensajes

Editar las plantillas en la función `processVehicle()` del archivo `index.js`

### Cambiar días de aviso

Modificar la condición `diasDiferencia <= 15` por el número deseado

### Cambiar tiempo de espera

Modificar los valores en:

```javascript
const tiempoEspera = Math.floor(Math.random() * (10000) + 10000);
```

### Agregar más validaciones

Extender la función `formatPhone()` para otros países

## 🧪 Modo de prueba

### Probar formato de teléfonos

Usa la opción "🧪 Probar formato de teléfono" del menú para:

* Ver números originales vs formateados
* Identificar números inválidos
* Verificar la validación antes del envío masivo

## 🤝 Soporte

Para problemas o sugerencias:

1. Revisar los logs en `/logs/notificaciones.log`
2. Verificar errores en `/errores/errores_envio.xlsx`
3. Usar la función de prueba de teléfonos
4. Verificar las estadísticas para identificar problemas
5. Asegurar formato correcto del Excel fuente

## 📄 Licencia

MIT - Uso libre con atribución

## 📝 Changelog

### v2.0 🆕

* Agregada reconexión automática
* Nueva función de prueba de formato de teléfonos
* Estadísticas avanzadas con categorización de vencimientos
* Sistema de reintentos mejorado (3 intentos)
* Validación avanzada de datos de entrada
* Manejo específico de errores de contexto de Puppeteer
* Pausa aleatoria entre mensajes (10-20 segundos)
* Mensajes actualizados con información de recargo del 35%
* Filtrado automático de filas vacías
* Logs más detallados con información de días restantes
