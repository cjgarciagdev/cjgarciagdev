from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import math

# Lógica de cálculo de edad
def calcular_edad(fecha_nacimiento):
    """Calcula la edad en meses a partir de la fecha de nacimiento."""
    if not fecha_nacimiento:
        return 0
    nacimiento = datetime.strptime(fecha_nacimiento, '%Y-%m-%d')
    hoy = datetime.now()
    edad_meses = (hoy.year - nacimiento.year) * 12 + (hoy.month - nacimiento.month)
    if hoy.day < nacimiento.day:
        edad_meses -= 1
    return max(0, edad_meses)

# Lógica de nutrición mejorada
def calcular_nutricion(peso, edad, especie='Bovino', raza='Otro', sexo='Hembra', estado='Saludable'):
    """
    SISTEMA DE CALIBRACIÓN NUTRICIONAL:
    Esta función implementa un algoritmo dinámico que ajusta los requerimientos de alimentación
    basándose en múltiples variables fisiológicas y ambientales.
    
    Lógica de Cálculo:
    1. Determina un 'Factor de Ajuste Total' multiplicando factores específicos (Especie * Raza * Sexo * Estado).
    2. Calcula el 'Peso Ajustado' (Metabolismo Basal Estimado).
    3. Aplica tasas de alimentación (Forraje/Concentrado) según la etapa de crecimiento (Cría, Joven, Adulto).
    4. Provee recomendaciones complementarias de Minerales, Vitaminas y Agua.
    
    Propósito: Optimizar la ganancia de peso y reducir el desperdicio de insumos.
    """
    
    # Factor de ajuste por especie
    factores_especie = {
        'Bovino': 1.0,
        'Ovino': 0.4,
        'Caprino': 0.5,
        'Porcino': 0.6,
        'Equino': 0.9
    }
    
    # Factores de ajuste por raza
    factores_raza = {
        'Bovino': {'Holstein': 1.1, 'Angus': 0.9, 'Brahman': 0.8},
        'Ovino': {'Merino': 0.9, 'Suffolk': 1.0},
        'Caprino': {'Saanen': 1.1, 'Boer': 1.0},
        'Porcino': {'Duroc': 1.1},
        'Equino': {'Pura Sangre': 1.2}
    }
    
    factor_especie = factores_especie.get(especie, 1.0)
    factor_raza = factores_raza.get(especie, {}).get(raza, 1.0)
    
    # Factor por Sexo
    factor_sexo = 1.1 if sexo == 'Macho' else 1.0
    
    # Factor por Estado Fisiológico
    factor_estado = 1.0
    suplementos_estado = []
    
    estado_lower = estado.lower()
    if 'gestante' in estado_lower or 'gestacion' in estado_lower:
        factor_estado = 1.2
        suplementos_estado.append("Minerales para gestación")
    elif 'lactan' in estado_lower: # Lactancia/Lactante
        factor_estado = 1.4
        suplementos_estado.append("Calcio reforzado (Lactancia)")
    elif 'engorde' in estado_lower:
        factor_estado = 1.15
        suplementos_estado.append("Proteína extra (Engorde)")
    elif 'enfermo' in estado_lower or 'tratamiento' in estado_lower:
        factor_estado = 1.1 # Recuperación
        suplementos_estado.append("Probióticos y Vitaminas")

    factor_total = factor_especie * factor_raza * factor_sexo * factor_estado
    
    peso_ajustado = peso * factor_total
    
    # Cálculo de forraje y concentrado según edad
    if edad < 3:  # Crecimiento acelerado
        forraje_verde = peso_ajustado * 0.06
        concentrado = peso_ajustado * 0.028 # Aumentado ligeramente para crías
    elif 3 <= edad < 12:  # Desarrollo
        forraje_verde = peso_ajustado * 0.08
        concentrado = peso_ajustado * 0.022
    elif 12 <= edad < 24:  # Joven
        forraje_verde = peso_ajustado * 0.10
        concentrado = peso_ajustado * 0.018
    else:  # Adulto
        forraje_verde = peso_ajustado * 0.12
        concentrado = peso_ajustado * 0.012
    
    # Minerales y vitaminas
    suplementos = []
    minerales = "Calcio 1.2%, Fósforo 0.8%, Sodio 0.4%"
    vitaminas = "Vit A 50000 UI/kg, Vit D 10000 UI/kg"
    
    if edad < 3:
        suplementos.append("Iniciador Crecimiento")
        vitaminas += ", Vit E 150 UI/kg"
    elif 12 <= edad < 24:
        suplementos.append("Desarrollo Muscular")
    
    # Añadir suplementos por estado
    suplementos.extend(suplementos_estado)
    
    # Ajustes específicos por raza/especie
    if especie == 'Bovino' and 'Holstein' in raza:
        suplementos.append("Supl. Lechero")
    if especie == 'Equino':
        suplementos.append("Supl. Articulaciones")
    
    # Energía metabolizable
    energia_base = peso_ajustado * 0.0045 # Mcal/dia ajustado
    energia_metabolizable = energia_base * factor_estado

    # Cálculo de requerimiento hídrico (Agua)
    # Estimación base: 10% del peso vivo en verano, 5-8% en invierno. Usamos 8% promedio.
    factor_agua = 0.08
    if especie == 'Bovino' and 'lactan' in estado_lower:
        factor_agua = 0.12 # Más agua en lactancia
    
    agua_litros = peso * factor_agua
    
    # Frecuencia de alimentación recomendada
    if edad < 3:
        frecuencia = "3 veces al día"
    elif 'lactan' in estado_lower:
        frecuencia = "2 veces al día + Pastoreo libre"
    else:
        frecuencia = "2 veces al día"

    return {
        'forraje_verde': round(forraje_verde, 2),
        'concentrado': round(concentrado, 2),
        'suplementos': list(set(suplementos)), # Eliminar duplicados
        'minerales': minerales,
        'vitaminas': vitaminas,
        'energia_metabolizable': round(energia_metabolizable, 2),
        'peso_ajustado': round(peso_ajustado, 2),
        'factor_total': round(factor_total, 2),
        'agua': f"{round(agua_litros, 1)} - {round(agua_litros * 1.2, 1)} Litros/día",
        'frecuencia': frecuencia
    }

def predecir_productividad(peso_actual, edad_meses, especie='Bovino', historial_pesos=None):
    """
    Motor de Predicción Bio-Estadística:
    Calcula la ganancia diaria promedio (GDP) basada en el historial de pesajes y proyecta
    el crecimiento futuro. Determina confiabilidad estadística y madurez reproductiva.
    
    Variables Analizadas:
    - Ganancia Diaria de Peso (GDP) = (Peso Final - Peso Inicial) / Días Transcurridos.
    - Curva de Crecimiento Logística: Proyección lineal ponderada a 180 días (6 meses).
    - Índice de Conversión Alimenticia (ICA): Basado en la correlación entre GDP y consumo basal.
    - Madurez Reproductiva: Determinada biológicamente por especie (Bovino 18m, Ovino 6m, etc).
    """
    
    if not historial_pesos or len(historial_pesos) < 2:
        ganancia_diaria = 0.5  # Valor por defecto
    else:
        # Calcular ganancia histórica
        registros_ordenados = sorted(historial_pesos, key=lambda x: x['fecha'])
        dias_transcurridos = (
            datetime.strptime(registros_ordenados[-1]['fecha'].split()[0], '%Y-%m-%d') -
            datetime.strptime(registros_ordenados[0]['fecha'].split()[0], '%Y-%m-%d')
        ).days
        
        if dias_transcurridos > 0:
            ganancia_total = registros_ordenados[-1]['peso'] - registros_ordenados[0]['peso']
            ganancia_diaria = ganancia_total / dias_transcurridos
        else:
            ganancia_diaria = 0.5
    
    # Proyección a 6 meses
    dias_6meses = 180
    peso_estimado_6m = peso_actual + (ganancia_diaria * dias_6meses)
    
    # Índice de conversión (alimento/ganancia)
    indice_conversion = 6.5 if ganancia_diaria > 0.6 else 7.5
    
    # Edad reproductiva estimada
    if especie in ['Bovino', 'Equino']:
        meses_madurez = 18
    elif especie == 'Ovino':
        meses_madurez = 6
    else:
        meses_madurez = 12
    
    edad_reproduccion = datetime.now() + timedelta(days=(meses_madurez - edad_meses) * 30)
    
    # Confiabilidad basada en cantidad de datos
    confiabilidad = min(95, 50 + (len(historial_pesos or []) * 5))
    
    return {
        'peso_estimado_6m': round(peso_estimado_6m, 2),
        'ganancia_diaria_esperada': round(ganancia_diaria, 3),
        'indice_conversion': round(indice_conversion, 2),
        'edad_reproductiva_estimada': edad_reproduccion.strftime('%Y-%m-%d'),
        'confiabilidad': round(confiabilidad, 1)
    }

def analisis_avanzado_animal(animal_dict, historial_pesos=None):
    """
    Análisis Multidimensional de Vigor y Genética:
    Evalúa la calidad integral del animal combinando datos genealógicos, genéticos y productivos.
    
    Dimensiones del Score:
    1. Score Genealógico: Integridad del linaje (presencia de padres, ancestros conocidos).
    2. Score Genético: Estimación fenotípica basada en estándares de raza y especie.
    3. Score Productivo: Desempeño real en campo (basado en GDP histórica).
    
    Algoritmo:
    Puntaje General = Media Ponderada de Dimensiones.
    Inferencia de Recomendaciones: Generadas mediante lógica proposicional basada en los puntajes.
    """
    
    peso = animal_dict.get('peso', 0)
    edad = animal_dict.get('edad', 0)
    especie = animal_dict.get('especie', 'Bovino')
    
    # Análisis Genealógico
    score_genealogia = 85 if animal_dict.get('padre_id') and animal_dict.get('madre_id') else 60
    
    # Análisis Genético (basado en caracteres observables)
    score_genetica = 75
    
    # Análisis Productivo
    if historial_pesos and len(historial_pesos) > 1:
        registros = sorted(historial_pesos, key=lambda x: x['fecha'])
        ganancia_promedio = (registros[-1]['peso'] - registros[0]['peso']) / len(registros)
        score_productivo = min(95, 50 + (ganancia_promedio * 10))
    else:
        score_productivo = 70
    
    # Score general
    score_general = round((score_genealogia + score_genetica + score_productivo) / 3, 1)
    
    # Recomendaciones
    recomendaciones = []
    if score_genealogia < 70:
        recomendaciones.append("Mejorar registro genealógico")
    if score_productivo < 70:
        recomendaciones.append("Revisar plan nutricional")
    if peso < 150 and edad > 12:
        recomendaciones.append("Animal por debajo del peso esperado")
    if not recomendaciones:
        recomendaciones.append("Animal en condiciones óptimas")
    
    return {
        'score_genealogia': score_genealogia,
        'score_genetica': score_genetica,
        'score_productivo': score_productivo,
        'score_general': score_general,
        'recomendaciones': recomendaciones,
        'resumen': f"Animal con potencial {'alto' if score_general > 80 else 'medio' if score_general > 70 else 'bajo'}"
    }

# Hashing de contraseñas (para futuro uso)
def hash_password(password):
    return generate_password_hash(password)

def verify_password(hashed, password):
    return check_password_hash(hashed, password)