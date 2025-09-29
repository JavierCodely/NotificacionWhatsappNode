# 🧪 ARCHIVO DE PRUEBA - VTV Notifier v2.2

## 📊 Datos del archivo de prueba

**Archivo:** `datos_vehiculos_test.xlsx`
**Total de registros:** 13

### 📱 Teléfono configurado: 543757644623

## 🎯 Casos de prueba incluidos:

### ✅ **DEBERÍA_ENVIAR** (8 casos)
Estos deberían generar notificaciones:

| Patente | MARCA | MODELO | Descripción |
|---------|-------|--------|-------------|
| TEST001AB | DEBERÍA_ENVIAR | VENCE_1_DIA | Vence en 1 día |
| TEST002AB | DEBERÍA_ENVIAR | VENCE_3_DIAS | Vence en 3 días |
| TEST003AB | DEBERÍA_ENVIAR | VENCE_7_DIAS | Vence en 7 días |
| TEST004AB | DEBERÍA_ENVIAR | VENCE_15_DIAS | Vence en 15 días |
| TEST005AB | DEBERÍA_ENVIAR | VENCE_20_DIAS | Vence en 20 días |
| TEST006AB | DEBERÍA_ENVIAR | VENCE_HOY | Vence hoy |
| TEST007AB | DEBERÍA_ENVIAR | VENCIDO_5_DIAS | Vencido hace 5 días |
| TEST008AB | DEBERÍA_ENVIAR | VENCIDO_10_DIAS | Vencido hace 10 días |

### ❌ **NO_DEBERÍA_ENVIAR** (5 casos)
Estos NO deberían generar notificaciones:

| Patente | MARCA | MODELO | Razón |
|---------|-------|--------|-------|
| TEST009AB | NO_DEBERÍA_ENVIAR | MUY_LEJOS | Vence en 40 días |
| TEST010AB | NO_DEBERÍA_ENVIAR | OTRO_MES | Vence en 60 días |
| INV001AB | NO_DEBERÍA_ENVIAR | TEL_NULO | Teléfono nulo |
| INV002AB | NO_DEBERÍA_ENVIAR | TEL_VACÍO | Teléfono vacío |
| INV003AB | NO_DEBERÍA_ENVIAR | TEL_CORTO | Teléfono muy corto |

## 🔧 Configuración aplicada:

1. **Archivo Excel:** `datos_vehiculos_test.xlsx`
2. **Configuración Puppeteer mejorada** para evitar errores
3. **Caché de WhatsApp limpiado** para sesión nueva

## 🚀 Instrucciones de prueba:

1. Ejecutar: `node index.js`
2. Escanear código QR con WhatsApp
3. Seleccionar **Octubre 2025** en el menú
4. Verificar que muestra **8 vehículos para notificar**
5. Ejecutar notificaciones
6. **Importante:** Solo los primeros 20 se procesan (en este caso todos los 8 válidos)

## 📱 Resultado esperado:

- **Mensajes enviados:** 8 (todos los DEBERÍA_ENVIAR)
- **Mensajes no enviados:** 5 (todos los NO_DEBERÍA_ENVIAR)
- **Teléfono destino:** 543757644623

## 🔍 Verificación:

Después de la ejecución, revisar:
- `logs/notificaciones.log` - Debe mostrar 8 envíos exitosos
- `errores/errores_envio.xlsx` - Debe mostrar los 3 teléfonos inválidos
- `procesados/procesados.xlsx` - Debe mostrar las 8 patentes procesadas

¡Ahora puedes probar el sistema con datos controlados! 🎯