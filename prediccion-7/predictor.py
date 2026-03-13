"""
Sistema de predicción de números usando análisis estadístico y Machine Learning
"""
import numpy as np
import pandas as pd
from collections import Counter
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from database import get_session, NumeroExtraido, Prediccion
import warnings
warnings.filterwarnings('ignore')


class PredictorNumeros:
    """Clase para predecir el próximo número basado en datos históricos"""
    
    def __init__(self, min_samples=50):
        self.min_samples = min_samples
        self.modelo_ml = None
        self.scaler = StandardScaler()
        
    def obtener_datos_historicos(self, limite=1000):
        """Obtener datos históricos de la base de datos"""
        session = get_session()
        try:
            registros = session.query(NumeroExtraido)\
                .order_by(NumeroExtraido.fecha_extraccion.desc())\
                .limit(limite)\
                .all()
            
            numeros = [r.numero for r in reversed(registros)]
            fechas = [r.fecha_extraccion for r in reversed(registros)]
            
            return numeros, fechas
            
        finally:
            session.close()
    
    def analisis_estadistico(self, numeros):
        """
        Realizar análisis estadístico de los números
        
        Returns:
            dict con estadísticas y predicciones básicas
        """
        if len(numeros) < self.min_samples:
            return {
                'error': f'Se necesitan al menos {self.min_samples} muestras. Actualmente: {len(numeros)}'
            }
        
        # Frecuencia de números
        frecuencias = Counter(numeros)
        
        # Estadísticas básicas
        stats = {
            'total_muestras': len(numeros),
            'media': np.mean(numeros),
            'mediana': np.median(numeros),
            'moda': frecuencias.most_common(1)[0][0],
            'desviacion_estandar': np.std(numeros),
            'minimo': min(numeros),
            'maximo': max(numeros),
            'rango': max(numeros) - min(numeros),
            'frecuencias_top_10': frecuencias.most_common(10),
            'numeros_recientes': numeros[-10:],
        }
        
        # Análisis de patrones
        patrones = self._analizar_patrones(numeros)
        stats.update(patrones)
        
        return stats
    
    def _analizar_patrones(self, numeros):
        """Analizar patrones en la secuencia de números"""
        if len(numeros) < 3:
            return {}
        
        # Diferencias entre números consecutivos
        diferencias = [numeros[i+1] - numeros[i] for i in range(len(numeros)-1)]
        
        # Racha más larga del mismo número
        racha_actual = 1
        racha_max = 1
        for i in range(1, len(numeros)):
            if numeros[i] == numeros[i-1]:
                racha_actual += 1
                racha_max = max(racha_max, racha_actual)
            else:
                racha_actual = 1
        
        # Números pares vs impares
        pares = sum(1 for n in numeros if n % 2 == 0)
        impares = len(numeros) - pares
        
        return {
            'diferencia_promedio': np.mean(diferencias),
            'diferencia_std': np.std(diferencias),
            'racha_maxima': racha_max,
            'porcentaje_pares': (pares / len(numeros)) * 100,
            'porcentaje_impares': (impares / len(numeros)) * 100,
        }
    
    def crear_features(self, numeros, ventana=10):
        """
        Crear características para el modelo de ML
        
        Args:
            numeros: Lista de números históricos
            ventana: Tamaño de la ventana de análisis
            
        Returns:
            X (features), y (targets)
        """
        X = []
        y = []
        
        for i in range(ventana, len(numeros)):
            # Features: últimos N números
            features = numeros[i-ventana:i]
            
            # Features adicionales
            features_extra = [
                np.mean(features),
                np.std(features),
                max(features),
                min(features),
                sum(1 for n in features if n % 2 == 0),  # Cantidad de pares
            ]
            
            X.append(features + features_extra)
            y.append(numeros[i])
        
        return np.array(X), np.array(y)
    
    def entrenar_modelo_ml(self, numeros, ventana=10):
        """Entrenar un modelo de Machine Learning"""
        if len(numeros) < self.min_samples:
            return False
        
        X, y = self.crear_features(numeros, ventana)
        
        if len(X) < 20:
            print("⚠ Datos insuficientes para entrenar el modelo ML")
            return False
        
        # Dividir en train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Escalar features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Entrenar Random Forest
        self.modelo_ml = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.modelo_ml.fit(X_train_scaled, y_train)
        
        # Evaluar
        score = self.modelo_ml.score(X_test_scaled, y_test)
        print(f"✓ Modelo entrenado. Precisión: {score:.2%}")
        
        return True
    
    def predecir_proximo_numero(self, metodo='combinado'):
        """
        Predecir el próximo número
        
        Args:
            metodo: 'estadistico', 'ml', o 'combinado'
            
        Returns:
            dict con predicción y confianza
        """
        numeros, fechas = self.obtener_datos_historicos()
        
        if len(numeros) < self.min_samples:
            return {
                'error': f'Se necesitan al menos {self.min_samples} muestras',
                'disponibles': len(numeros)
            }
        
        predicciones = {}
        
        # Método estadístico: número más frecuente reciente
        if metodo in ['estadistico', 'combinado']:
            numeros_recientes = numeros[-50:]
            frecuencias = Counter(numeros_recientes)
            prediccion_estadistica = frecuencias.most_common(1)[0][0]
            confianza_estadistica = frecuencias.most_common(1)[0][1] / len(numeros_recientes)
            
            predicciones['estadistico'] = {
                'numero': prediccion_estadistica,
                'confianza': confianza_estadistica,
                'metodo': 'Análisis de frecuencias'
            }
        
        # Método Machine Learning
        if metodo in ['ml', 'combinado']:
            if self.modelo_ml is None:
                self.entrenar_modelo_ml(numeros)
            
            if self.modelo_ml:
                ventana = 10
                ultimos = numeros[-ventana:]
                features_extra = [
                    np.mean(ultimos),
                    np.std(ultimos),
                    max(ultimos),
                    min(ultimos),
                    sum(1 for n in ultimos if n % 2 == 0),
                ]
                X_pred = np.array([ultimos + features_extra])
                X_pred_scaled = self.scaler.transform(X_pred)
                
                prediccion_ml = self.modelo_ml.predict(X_pred_scaled)[0]
                probabilidades = self.modelo_ml.predict_proba(X_pred_scaled)
                confianza_ml = np.max(probabilidades)
                
                predicciones['ml'] = {
                    'numero': int(prediccion_ml),
                    'confianza': float(confianza_ml),
                    'metodo': 'Random Forest'
                }
        
            # En lugar de promediar números (que no tiene sentido para lotería),
            # usamos el que tenga mayor confianza o una combinación lógica
            pred_est = predicciones['estadistico']
            pred_ml = predicciones['ml']
            
            if pred_ml['confianza'] >= pred_est['confianza']:
                mejor_pred = pred_ml
            else:
                mejor_pred = pred_est
                
            predicciones['combinado'] = {
                'numero': mejor_pred['numero'],
                'confianza': max(pred_est['confianza'], pred_ml['confianza']),
                'metodo': f"Optimizado ({mejor_pred['metodo']})",
                'candidatos': [
                    {'numero': pred_est['numero'], 'confianza': pred_est['confianza'], 'tipo': 'Estadístico'},
                    {'numero': pred_ml['numero'], 'confianza': pred_ml['confianza'], 'tipo': 'ML'}
                ]
            }
        
        return predicciones
    
    def guardar_prediccion(self, numero_predicho, confianza, metodo='combinado'):
        """Guardar una predicción en la base de datos"""
        session = get_session()
        try:
            nueva_prediccion = Prediccion(
                numero_predicho=numero_predicho,
                confianza=confianza,
                modelo_usado=metodo,
                fecha_prediccion=datetime.utcnow()
            )
            session.add(nueva_prediccion)
            session.commit()
            print(f"✓ Predicción guardada: {numero_predicho} (confianza: {confianza:.2%})")
            return True
            
        except Exception as e:
            session.rollback()
            print(f"Error al guardar predicción: {e}")
            return False
        finally:
            session.close()
    
    def evaluar_predicciones(self, dias=7):
        """Evaluar la precisión de predicciones pasadas"""
        session = get_session()
        try:
            fecha_inicio = datetime.utcnow() - timedelta(days=dias)
            predicciones = session.query(Prediccion)\
                .filter(Prediccion.fecha_prediccion >= fecha_inicio)\
                .all()
            
            total = len(predicciones)
            if total == 0:
                return {'mensaje': 'No hay predicciones para evaluar'}
            
            acertadas = sum(1 for p in predicciones if p.acertado == True)
            
            return {
                'total_predicciones': total,
                'acertadas': acertadas,
                'precision': acertadas / total if total > 0 else 0,
                'periodo_dias': dias
            }
            
        finally:
            session.close()


if __name__ == "__main__":
    print("=== Sistema de Predicción ===\n")
    
    predictor = PredictorNumeros()
    
    # Obtener datos históricos
    numeros, fechas = predictor.obtener_datos_historicos()
    print(f"Datos históricos: {len(numeros)} registros\n")
    
    if len(numeros) >= predictor.min_samples:
        # Análisis estadístico
        stats = predictor.analisis_estadistico(numeros)
        print("📊 Estadísticas:")
        print(f"  Media: {stats['media']:.2f}")
        print(f"  Moda: {stats['moda']}")
        print(f"  Top 5 frecuentes: {stats['frecuencias_top_10'][:5]}\n")
        
        # Hacer predicción
        print("🔮 Generando predicción...\n")
        predicciones = predictor.predecir_proximo_numero(metodo='combinado')
        
        for metodo, pred in predicciones.items():
            if 'error' not in pred:
                print(f"Método {metodo.upper()}:")
                print(f"  Número predicho: {pred['numero']}")
                print(f"  Confianza: {pred['confianza']:.2%}")
                print(f"  Algoritmo: {pred['metodo']}\n")
