import pandas as pd
from datetime import datetime, timedelta
import random

# Datos de prueba
test_data = []

# Crear diferentes escenarios de test
scenarios = [
    # Vencimientos de octubre 2025 - DEBERÍA ENVIAR
    {"days_offset": 1, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_1_DIA"},
    {"days_offset": 3, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_3_DIAS"},
    {"days_offset": 7, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_7_DIAS"},
    {"days_offset": 15, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_15_DIAS"},
    {"days_offset": 20, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_20_DIAS"},
    {"days_offset": 0, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_HOY"},

    # Vencimientos pasados - DEBERÍA ENVIAR
    {"days_offset": -5, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCIDO_5_DIAS"},
    {"days_offset": -10, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCIDO_10_DIAS"},

    # Casos que NO deberían enviar
    {"days_offset": 40, "marca": "NO_DEBERÍA_ENVIAR", "modelo": "MUY_LEJOS"},
    {"days_offset": 60, "marca": "NO_DEBERÍA_ENVIAR", "modelo": "OTRO_MES"},
]

# Fecha base: octubre 2025
base_date = datetime(2025, 10, 15)

# Generar datos para cada escenario
for i, scenario in enumerate(scenarios, 1):
    # Calcular fecha de vencimiento
    venc_date = base_date + timedelta(days=scenario["days_offset"])

    # Crear registro
    record = {
        "Patente": f"TEST{i:03d}AB",
        "Telefono": 543757644623,
        "FechaDeRevision": (venc_date - timedelta(days=365)).strftime("%m/%d/%y"),
        "FechaDeVencimiento": venc_date.strftime("%m/%d/%y"),
        "SERIE": "T",
        "MARCA": scenario["marca"],
        "MODELO": scenario["modelo"],
        "EMAIL": f"test{i}@email.com"
    }

    test_data.append(record)

# Agregar algunos casos adicionales con teléfonos inválidos
invalid_phone_cases = [
    {"Patente": "INV001AB", "Telefono": None, "MARCA": "NO_DEBERÍA_ENVIAR", "MODELO": "TEL_NULO"},
    {"Patente": "INV002AB", "Telefono": "", "MARCA": "NO_DEBERÍA_ENVIAR", "MODELO": "TEL_VACÍO"},
    {"Patente": "INV003AB", "Telefono": "123", "MARCA": "NO_DEBERÍA_ENVIAR", "MODELO": "TEL_CORTO"},
]

for case in invalid_phone_cases:
    venc_date = datetime(2025, 10, 10)
    record = {
        "Patente": case["Patente"],
        "Telefono": case["Telefono"],
        "FechaDeRevision": "10/10/24",
        "FechaDeVencimiento": venc_date.strftime("%m/%d/%y"),
        "SERIE": "T",
        "MARCA": case["MARCA"],
        "MODELO": case["MODELO"],
        "EMAIL": "invalid@email.com"
    }
    test_data.append(record)

# Crear DataFrame
df = pd.DataFrame(test_data)

# Guardar como Excel
df.to_excel('datos_vehiculos_test.xlsx', index=False)

print("=== ARCHIVO DE PRUEBA CREADO ===")
print(f"Total de registros: {len(df)}")
print("\n=== RESUMEN POR CATEGORÍA ===")
print(f"DEBERÍA_ENVIAR: {len(df[df['MARCA'] == 'DEBERÍA_ENVIAR'])}")
print(f"NO_DEBERÍA_ENVIAR: {len(df[df['MARCA'] == 'NO_DEBERÍA_ENVIAR'])}")

print("\n=== PRIMEROS 5 REGISTROS ===")
print(df.head().to_string())

print(f"\n=== TELÉFONO DE PRUEBA CONFIGURADO: 543757644623 ===")
print("Archivo guardado como: datos_vehiculos_test.xlsx")