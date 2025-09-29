import pandas as pd
from datetime import datetime, timedelta
import random

# Datos de prueba
test_data = []

# Fecha base: HOY (29 de septiembre de 2025)
# Para simular que estamos en octubre 2025, usamos fechas específicas
today = datetime(2025, 9, 29)  # Simulamos que hoy es 29 de sept 2025

# Crear diferentes escenarios de test con fechas EXACTAS
scenarios = [
    # Vencimientos EXACTOS para testing
    {"venc_date": datetime(2025, 9, 30), "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_1_DIA"},     # Mañana
    {"venc_date": datetime(2025, 10, 1), "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_2_DIAS"},    # Pasado mañana
    {"venc_date": datetime(2025, 10, 2), "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_3_DIAS"},    # En 3 días
    {"venc_date": datetime(2025, 10, 5), "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_6_DIAS"},    # En 6 días
    {"venc_date": datetime(2025, 9, 29), "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_HOY"},       # HOY

    # Vencimientos pasados
    {"venc_date": datetime(2025, 9, 24), "marca": "DEBERÍA_ENVIAR", "modelo": "VENCIDO_5_DIAS"},  # Hace 5 días
    {"venc_date": datetime(2025, 9, 19), "marca": "DEBERÍA_ENVIAR", "modelo": "VENCIDO_10_DIAS"}, # Hace 10 días

    # Casos que NO deberían enviar (muy lejos)
    {"venc_date": datetime(2025, 11, 15), "marca": "NO_DEBERÍA_ENVIAR", "modelo": "MUY_LEJOS"},   # Noviembre
    {"venc_date": datetime(2025, 12, 25), "marca": "NO_DEBERÍA_ENVIAR", "modelo": "OTRO_MES"},    # Diciembre
]

# Generar datos para cada escenario
for i, scenario in enumerate(scenarios, 1):
    venc_date = scenario["venc_date"]

    # Calcular días de diferencia desde HOY
    dias_diff = (venc_date - today).days

    # Crear registro
    record = {
        "Patente": f"TEST{i:03d}AB",
        "Telefono": 543757644623,
        "FechaDeRevision": (venc_date - timedelta(days=365)).strftime("%m/%d/%y"),
        "FechaDeVencimiento": venc_date.strftime("%m/%d/%y"),
        "SERIE": "T",
        "MARCA": scenario["marca"],
        "MODELO": f"{scenario['modelo']}_({dias_diff:+d}dias)",  # Agregar días para debug
        "EMAIL": f"test{i}@email.com"
    }

    test_data.append(record)
    print(f"OK {record['Patente']}: {venc_date.strftime('%d/%m/%Y')} -> {dias_diff:+d} dias -> {scenario['modelo']}")

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

print(f"\n=== ARCHIVO DE PRUEBA CREADO ===")
print(f"Fecha base simulada: {today.strftime('%d/%m/%Y')} (hoy)")
print(f"Total de registros: {len(df)}")
print(f"DEBERIA_ENVIAR: {len(df[df['MARCA'] == 'DEBERÍA_ENVIAR'])}")
print(f"NO_DEBERIA_ENVIAR: {len(df[df['MARCA'] == 'NO_DEBERÍA_ENVIAR'])}")

print(f"\n=== CASOS DE PRUEBA ===")
for _, row in df.iterrows():
    if 'TEST' in row['Patente']:
        print(f"CASO {row['Patente']}: {row['FechaDeVencimiento']} - {row['MODELO']}")

print(f"\nTelefono de prueba: 543757644623")
print("Archivo guardado como: datos_vehiculos_test.xlsx")