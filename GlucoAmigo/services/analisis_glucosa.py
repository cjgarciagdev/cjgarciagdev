"""
GlucoAmigo - Análisis de Datos Avanzado
======================================
- Gráficos de Time in Range (porcentaje en rango)
- Predicción de hipoglucemias (algoritmo simple/Random Forest)
- Alertas predictivas
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
import statistics

# Parámetros clínicos para Time in Range
RANGO_GLUCEMICO = {
    'muy_bajo': (0, 54),      # mg/dL - Emergencia
    'bajo': (54, 70),        # mg/dL - Por debajo del objetivo
    'rango_objetivo': (70, 180),  # mg/dL - En rango (TIR)
    'alto': (180, 250),      # mg/dL - Por encima del objetivo
    'muy_alto': (250, 500),  # mg/dL - Emergencia
}

# Porcentajes objetivo (estándar clínico)
OBJETIVOS_TIR = {
    'tiempo_muy_bajo': 1,     # < 1% es ideal
    'tiempo_bajo': 4,         # < 4% es ideal
    'tiempo_en_rango': 70,    # > 70% es el objetivo
    'tiempo_alto': 25,       # < 25% acceptable
}


class AnalisisGlucosa:
    """Clase para análisis avanzado de datos glucémicos"""
    
    def __init__(self, heroe_id: int):
        self.heroe_id = heroe_id
        self.lecturas = []
        self.parametros = {}
    
    def cargar_datos(self, db, dias: int = 14):
        """Carga las lecturas de glucosa de los últimos N días"""
        from models import RegistroGlucosa
        desde = datetime.utcnow() - timedelta(days=dias)
        
        self.lecturas = RegistroGlucosa.query.filter(
            RegistroGlucosa.heroe_id == self.heroe_id,
            RegistroGlucosa.fecha >= desde
        ).order_by(RegistroGlucosa.fecha).all()
        
        return self
    
    def calcular_time_in_range(self) -> Dict:
        """
        Calcula el Time in Range (TIR) y métricas asociadas.
        
        Returns:
            Diccionario con porcentajes de tiempo en cada rango
        """
        if not self.lecturas:
            return {
                'tiempo_muy_bajo': 0,
                'tiempo_bajo': 0,
                'tiempo_en_rango': 0,
                'tiempo_alto': 0,
                'tiempo_muy_alto': 0,
                'total_lecturas': 0,
                'estado': 'sin_datos'
            }
        
        total = len(self.lecturas)
        conteos = {
            'muy_bajo': 0,
            'bajo': 0,
            'rango_objetivo': 0,
            'alto': 0,
            'muy_alto': 0
        }
        
        for lectura in self.lecturas:
            glucemia = lectura.glucemia_actual
            
            if glucemia < RANGO_GLUCEMICO['muy_bajo'][1]:
                conteos['muy_bajo'] += 1
            elif glucemia < RANGO_GLUCEMICO['bajo'][1]:
                conteos['bajo'] += 1
            elif glucemia < RANGO_GLUCEMICO['rango_objetivo'][1]:
                conteos['rango_objetivo'] += 1
            elif glucemia < RANGO_GLUCEMICO['alto'][1]:
                conteos['alto'] += 1
            else:
                conteos['muy_alto'] += 1
        
        # Calcular porcentajes
        resultados = {
            'tiempo_muy_bajo': round((conteos['muy_bajo'] / total) * 100, 1),
            'tiempo_bajo': round((conteos['bajo'] / total) * 100, 1),
            'tiempo_en_rango': round((conteos['rango_objetivo'] / total) * 100, 1),
            'tiempo_alto': round((conteos['alto'] / total) * 100, 1),
            'tiempo_muy_alto': round((conteos['muy_alto'] / total) * 100, 1),
            'total_lecturas': total,
            'estado': self._evaluar_estado(
                conteos['rango_objetivo'] / total,
                conteos['muy_bajo'] / total,
                conteos['muy_alto'] / total
            )
        }
        
        return resultados
    
    def _evaluar_estado(self, pct_rango: float, pct_muy_bajo: float, pct_muy_alto: float) -> str:
        """Evalúa el estado general del control glucémico"""
        if pct_rango >= 0.70 and pct_muy_bajo < 0.01 and pct_muy_alto < 0.05:
            return 'excelente'
        elif pct_rango >= 0.50 and pct_muy_bajo < 0.04 and pct_muy_alto < 0.10:
            return 'bueno'
        elif pct_rango >= 0.30:
            return 'regular'
        else:
            return 'requiere_atencion'
    
    def obtener_tendencias(self) -> Dict:
        """Obtiene estadísticas de tendencia"""
        if len(self.lecturas) < 3:
            return {'趋势': 'insuficientes_datos'}
        
        valores = [r.glucemia_actual for r in self.lecturas]
        
        # Calcular pendiente (tendencia)
        n = len(valores)
        if n >= 2:
            x = list(range(n))
            pendiente = self._calcular_pendiente(x, valores)
            
            if pendiente > 5:
                tendencia = 'subiendo'
                icon = 'fa-arrow-up'
            elif pendiente < -5:
                tendencia = 'bajando'
                icon = 'fa-arrow-down'
            else:
                tendencia = 'estable'
                icon = 'fa-minus'
        else:
            tendencia = 'insuficientes_datos'
            icon = 'fa-question'
        
        return {
            'tendencia': tendencia,
            'icon': icon,
            'pendiente': round(pendiente, 2) if 'pendiente' in dir() else 0,
            'promedio': round(statistics.mean(valores), 1),
            'desviacion': round(statistics.stdev(valores), 1) if len(valores) > 1 else 0,
            'minimo': min(valores),
            'maximo': max(valores),
            'lecturas': n
        }
    
    def _calcular_pendiente(self, x: List[int], y: List[int]) -> float:
        """Calcula la pendiente de una línea (tendencia simple)"""
        n = len(x)
        if n < 2:
            return 0
        
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(xi * yi for xi, yi in zip(x, y))
        sum_x2 = sum(xi ** 2 for xi in x)
        
        pendiente = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2) if (n * sum_x2 - sum_x ** 2) != 0 else 0
        return pendiente
    
    def predecir_hipoglucemia(self, horas_adelante: int = 2) -> Dict:
        """
        Predice probabilidad de hipoglucemia en las próximas horas.
        Usa un algoritmo basado en tendencias y patrones.
        
        Args:
            horas_adelante: Horas a predecir
            
        Returns:
            Diccionario con predicción y nivel de confianza
        """
        if len(self.lecturas) < 5:
            return {
                'prediccion': 'insuficientes_datos',
                'probabilidad': 0,
                'confianza': 'baja',
                'mensaje': 'Se necesitan más datos para预测'
            }
        
        # Obtener últimas lecturas (últimas 4 horas)
        ultimas_4h = [r for r in self.lecturas if r.fecha >= datetime.utcnow() - timedelta(hours=4)]
        
        if len(ultimas_4h) < 2:
            return {
                'prediccion': 'insuficientes_datos',
                'probabilidad': 0,
                'confianza': 'baja',
                'mensaje': 'Registra más lecturas para obtener predicción'
            }
        
        valores = [r.glucemia_actual for r in ultimas_4h]
        valores.sort()
        
        # Factores de riesgo
        factores = []
        probabilidad = 0
        
        # Factor 1: Tendencia actual
        pendientes = []
        for i in range(len(ultimas_4h) - 1):
            delta = ultimas_4h[i+1].glucemia_actual - ultimas_4h[i].glucemia_actual
            pendientes.append(delta)
        
        if pendientes:
            pendiente_promedio = sum(pendientes) / len(pendientes)
            
            # Si está bajando consistentemente
            if pendiente_promedio < -5:
                probabilidad += 30
                factores.append('Tendencia descendente detectada')
            elif pendiente_promedio < 0:
                probabilidad += 15
                factores.append('Ligeramente a la baja')
        
        # Factor 2: Valores recientes bajos
        valores_bajos = [v for v in valores if v < 100]
        if len(valores_bajos) >= len(valores) * 0.5:
            probabilidad += 25
            factores.append('Múltiples lecturas en rango bajo')
        
        # Factor 3: Variabilidad alta
        if len(valores) > 1:
            cv = statistics.stdev(valores) / statistics.mean(valores) if statistics.mean(valores) > 0 else 0
            if cv > 0.3:
                probabilidad += 20
                factores.append('Alta variabilidad glucémica')
        
        # Factor 4: Hora del día (noche/temprano mañana = mayor riesgo)
        hora_actual = datetime.utcnow().hour
        if hora_actual >= 0 and hora_actual <= 6:
            probabilidad += 15
            factores.append('Horario de mayor riesgo (madrugada)')
        
        # Factor 5: Ejercicio reciente (si se registra)
        # Esto se completaría con datos de ejercicio
        
        # Limitar probabilidad
        probabilidad = min(probabilidad, 95)
        
        # Determinar predicción
        if probabilidad >= 60:
            prediccion = 'alto_riesgo'
            mensaje = 'Alta probabilidad de hipoglucemia en las próximas horas'
            icono = 'fa-exclamation-triangle'
            color = '#ef4444'
        elif probabilidad >= 30:
            prediccion = 'riesgo_medio'
            mensaje = 'Riesgo moderado de hipoglucemia. Mantener monitoreo'
            icono = 'fa-exclamation-circle'
            color = '#f59e0b'
        else:
            prediccion = 'bajo_riesgo'
            mensaje = 'Bajo riesgo de hipoglucemia inmediata'
            icono = 'fa-check-circle'
            color = '#22c55e'
        
        return {
            'prediccion': prediccion,
            'probabilidad': probabilidad,
            'confianza': 'alta' if len(ultimas_4h) >= 4 else 'media',
            'mensaje': mensaje,
            'icono': icono,
            'color': color,
            'factores': factores,
            'horas_adelante': horas_adelante,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def generar_datos_grafico(self) -> Dict:
        """Genera datos listos para gráficos Chart.js"""
        if not self.lecturas:
            return {'labels': [], 'data': [], 'alertas': []}
        
        # Agrupar por día
        por_dia = defaultdict(list)
        alertas = []
        
        for lectura in self.lecturas:
            fecha_key = lectura.fecha.strftime('%d/%m')
            por_dia[fecha_key].append(lectura.glucemia_actual)
            
            if lectura.glucemia_actual < 70:
                alertas.append({
                    'fecha': lectura.fecha.strftime('%d/%m %H:%M'),
                    'tipo': 'hipo',
                    'valor': lectura.glucemia_actual
                })
            elif lectura.glucemia_actual > 250:
                alertas.append({
                    'fecha': lectura.fecha.strftime('%d/%m %H:%M'),
                    'tipo': 'hiper',
                    'valor': lectura.glucemia_actual
                })
        
        labels = sorted(por_dia.keys())
        data = [round(statistics.mean(por_dia[fecha]), 1) for fecha in labels]
        
        return {
            'labels': labels,
            'data': data,
            'alertas': alertas,
            'minimo': min([r.glucemia_actual for r in self.lecturas]),
            'maximo': max([r.glucemia_actual for r in self.lecturas])
        }


def calcular_time_in_range_api(heroe_id: int, dias: int = 14) -> Dict:
    """Función de conveniencia para API"""
    analisis = AnalisisGlucosa(heroe_id)
    analisis.cargar_datos(None, dias)  # db se pasa en la ruta
    return analisis.calcular_time_in_range()


def predecir_hipoglucemia_api(heroe_id: int, horas: int = 2) -> Dict:
    """Función de conveniencia para predicción API"""
    analisis = AnalisisGlucosa(heroe_id)
    analisis.cargar_datos(None, dias=7)
    return analisis.predecir_hipoglucemia(horas)
