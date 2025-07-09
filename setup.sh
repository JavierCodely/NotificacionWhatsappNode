#!/bin/bash

echo "🚀 Configurando proyecto de notificaciones VTV..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor, instala npm"
    exit 1
fi

echo "✅ Node.js y npm están instalados"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p logs errores procesados
npm install inquirer@8

# Crear archivo Excel de ejemplo
echo "📄 Creando archivo Excel de ejemplo..."
cat > datos_vehiculos_ejemplo.xlsx << 'EOF'
# Este es un archivo de ejemplo. Reemplaza con tu archivo real.
EOF

echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Coloca tu archivo Excel con los datos en el directorio raíz como 'datos_vehiculos.xlsx'"
echo "2. Ejecuta: npm start"
echo "3. Escanea el código QR con WhatsApp Web"
echo ""
echo "📁 Estructura esperada del Excel:"
echo "- Columna A: Patente"
echo "- Columna B: Telefono"
echo "- Columna C: FechaDeVencimiento (formato MM/DD/YY)"
echo "- Columna E: MARCA"
echo "- Columna F: MODELO"
echo ""
echo "🔧 Para desarrollo, usa: npm run dev"