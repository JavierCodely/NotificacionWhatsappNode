import pandas as pd
from datetime import datetime, timedelta

# Datos de prueba
test_data = []

# Fecha actual REAL (no simulada)
today = datetime.now()
print(f"Fecha actual REAL: {today.strftime('%d/%m/%Y')}")

# Crear diferentes escenarios de test basados en HOY
scenarios = [
    # Vencimientos para testing basados en fecha REAL
    {"days_offset": 0, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_HOY"},          # HOY
    {"days_offset": 1, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_1_DIA"},        # Mañana
    {"days_offset": 3, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_3_DIAS"},       # En 3 días
    {"days_offset": 5, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_5_DIAS"},       # En 5 días (urgente)
    {"days_offset": 7, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_7_DIAS"},       # En 7 días (normal)
    {"days_offset": 15, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCE_15_DIAS"},     # En 15 días (normal)

    # Vencimientos pasados
    {"days_offset": -3, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCIDO_3_DIAS"},    # Hace 3 días
    {"days_offset": -7, "marca": "DEBERÍA_ENVIAR", "modelo": "VENCIDO_7_DIAS"},    # Hace 7 días

    # Casos que NO deberían enviar (muy lejos)
    {"days_offset": 30, "marca": "NO_DEBERÍA_ENVIAR", "modelo": "MUY_LEJOS_30"},   # En 30 días
    {"days_offset": 60, "marca": "NO_DEBERÍA_ENVIAR", "modelo": "MUY_LEJOS_60"},   # En 60 días
]

# Generar datos para cada escenario
for i, scenario in enumerate(scenarios, 1):
    venc_date = today + timedelta(days=scenario["days_offset"])

    # Crear registro
    record = {
        "Patente": f"TEST{i:03d}AB",
        "Telefono": 543757644623,
        "FechaDeRevision": (venc_date - timedelta(days=365)).strftime("%m/%d/%y"),
        "FechaDeVencimiento": venc_date.strftime("%m/%d/%y"),
        "SERIE": "T",
        "MARCA": scenario["marca"],
        "MODELO": f"{scenario['modelo']}_({scenario['days_offset']:+d}dias)",
        "EMAIL": f"test{i}@email.com"
    }

    test_data.append(record)
    print(f"OK {record['Patente']}: {venc_date.strftime('%d/%m/%Y')} -> {scenario['days_offset']:+d} dias -> {scenario['modelo']}")

# Agregar algunos casos adicionales con teléfonos inválidos
invalid_phone_cases = [
    {"Patente": "INV001AB", "Telefono": None, "MARCA": "NO_DEBERÍA_ENVIAR", "MODELO": "TEL_NULO"},
    {"Patente": "INV002AB", "Telefono": "", "MARCA": "NO_DEBERÍA_ENVIAR", "MODELO": "TEL_VACÍO"},
    {"Patente": "INV003AB", "Telefono": "123", "MARCA": "NO_DEBERÍA_ENVIAR", "MODELO": "TEL_CORTO"},
]

for i, case in enumerate(invalid_phone_cases, len(scenarios) + 1):
    venc_date = today + timedelta(days=5)  # En 5 días pero con teléfono inválido
    record = {
        "Patente": case["Patente"],
        "Telefono": case["Telefono"],
        "FechaDeRevision": (venc_date - timedelta(days=365)).strftime("%m/%d/%y"),
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
print(f"Fecha base REAL: {today.strftime('%d/%m/%Y %H:%M')}")
print(f"Total de registros: {len(df)}")
print(f"DEBERIA_ENVIAR: {len(df[df['MARCA'] == 'DEBERÍA_ENVIAR'])}")
print(f"NO_DEBERIA_ENVIAR: {len(df[df['MARCA'] == 'NO_DEBERÍA_ENVIAR'])}")

print(f"\n=== CASOS DE PRUEBA ===")
for _, row in df.iterrows():
    if 'TEST' in row['Patente']:
        print(f"CASO {row['Patente']}: {row['FechaDeVencimiento']} - {row['MODELO']}")

print(f"\nTelefono de prueba: 543757644623")
print("Archivo guardado como: datos_vehiculos_test.xlsx")
print(f"\nMes/año del archivo: {today.strftime('%B %Y')}")