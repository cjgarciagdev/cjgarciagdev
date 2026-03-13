"""
Módulo de Visualización Interactiva de Grafos Genealógicos
Proporciona datos en formato JSON para visualización en el frontend con librerías modernas
"""

import json
import networkx as nx
from collections import defaultdict, deque

class VisualizadorGrafosAvanzado:
    """Clase para visualización interactiva de grafos genealógicos"""
    
    def __init__(self, grafo_genealogia):
        self.grafo = grafo_genealogia.grafo if hasattr(grafo_genealogia, 'grafo') else grafo_genealogia
    
    def obtener_datos_vis_js(self, animal_id, generaciones=3):
        """
        Genera una estructura de datos compatible con la librería Vis.js para el frontend.
        Recorre el grafo buscando ancestros y descendientes hasta 'generaciones' niveles.
        Asigna colores y niveles jerárquicos para una visualización arbórea.
        
        Args:
            animal_id (int): ID del animal central.
            generaciones (int): Profundidad de búsqueda.
            
        Returns:
            dict: Objeto con listas 'nodos' y 'aristas' y opciones de visualización.
        """
        ancestros = self._obtener_ancestros(animal_id, generaciones)
        descendientes = self._obtener_descendientes(animal_id, generaciones)
        
        nodos = []
        aristas = []
        nodos_visitados = set()
        
        # Procesar ancestros
        for gen, animales_gen in ancestros.items():
            for animal in animales_gen:
                if animal not in nodos_visitados:
                    nodo_data = self.grafo.nodes.get(animal, {})
                    nodos.append({
                        'id': str(animal),
                        'label': f"#{animal}",
                        'title': f"Especie: {nodo_data.get('especie', 'N/A')}<br>Raza: {nodo_data.get('raza', 'N/A')}",
                        'level': -gen,
                        'color': '#90EE90' if gen == 0 else '#87CEEB',
                        'size': 25 if gen == 0 else 20,
                        'font': {'size': 14 if gen == 0 else 12},
                        'generacion': f"Ancestro {gen}" if gen > 0 else "Centro"
                    })
                    nodos_visitados.add(animal)
        
        # Procesar descendientes
        for gen, animales_gen in descendientes.items():
            for animal in animales_gen:
                if animal not in nodos_visitados:
                    nodo_data = self.grafo.nodes.get(animal, {})
                    nodos.append({
                        'id': str(animal),
                        'label': f"#{animal}",
                        'title': f"Especie: {nodo_data.get('especie', 'N/A')}<br>Raza: {nodo_data.get('raza', 'N/A')}",
                        'level': gen,
                        'color': '#FFD700',
                        'size': 20,
                        'font': {'size': 12},
                        'generacion': f"Descendiente {gen}"
                    })
                    nodos_visitados.add(animal)
        
        # Crear aristas
        for nodo in nodos_visitados:
            for sucesor in self.grafo.successors(nodo):
                if sucesor in nodos_visitados:
                    edge_data = self.grafo.edges.get((nodo, sucesor), {})
                    aristas.append({
                        'from': str(nodo),
                        'to': str(sucesor),
                        'label': edge_data.get('tipo', ''),
                        'color': '#FF6347' if edge_data.get('tipo') == 'padre' else '#FF69B4',
                        'arrows': 'to'
                    })
        
        return {
            'nodos': nodos,
            'aristas': aristas,
            'opciones': {
                'physics': {
                    'enabled': True,
                    'stabilization': {'iterations': 200}
                },
                'hierarchy': {
                    'enabled': True,
                    'direction': 'UD',
                    'sortMethod': 'directed'
                }
            }
        }
    
    def obtener_red_completa(self):
        """Retorna todos los nodos y aristas del grafo formateados para la red del rebaño."""
        nodos = []
        aristas = []
        
        for n_id, data in self.grafo.nodes(data=True):
            nodos.append({
                'id': n_id,
                'label': f"#{n_id}",
                'group': data.get('especie', 'Otro'),
                'title': f"#{n_id} - {data.get('raza', 'Desconocida')}",
            })
            
        for u, v, data in self.grafo.edges(data=True):
            aristas.append({
                'from': u,
                'to': v,
                'label': data.get('tipo', '')
            })
            
        return {'nodos': nodos, 'aristas': aristas}
    
    def obtener_circuitos_logicos(self, animal_id):
        """
        Detecta ciclos dentro del grafo genealógico que incluyan al animal especificado.
        Los ciclos indican consanguinidad (el mismo ancestro aparece por múltiples líneas).
        Calcula un nivel de riesgo basado en la longitud del ciclo.
        
        Args:
            animal_id (int): ID del animal a analizar.
            
        Returns:
            list: Lista de circuitos detectados con metadatos de riesgo.
        """
        circuitos = []
        
        try:
            # Buscar ciclos en el grafo
            ciclos = list(nx.simple_cycles(self.grafo))
            
            for ciclo in ciclos:
                if animal_id in ciclo:
                    circuitos.append({
                        'circuito': ciclo,
                        'longitud': len(ciclo),
                        'tipo': 'Consanguinidad Alta' if len(ciclo) < 5 else 'Consanguinidad Media',
                        'riesgo': 'Alto' if len(ciclo) < 4 else 'Medio'
                    })
        except:
            pass
        
        return circuitos
    
    def obtener_analisis_genealogia_completo(self, animal_id):
        """
        Realiza un análisis exhaustivo de la genealogía del animal.
        Calcula número de generaciones, ancestros totales, descendientes totales,
        y detecta ancestros comunes que contribuyen a la consanguinidad.
        
        Args:
            animal_id (int): ID del animal.
            
        Returns:
            dict: Reporte completo de estadísticas genealógicas.
        """
        nodo_data = self.grafo.nodes.get(animal_id, {})
        
        ancestros = self._obtener_ancestros(animal_id, 5)
        descendientes = self._obtener_descendientes(animal_id, 5)
        
        # Contar generaciones
        generaciones_ancestros = len([a for gen, a in ancestros.items() if a])
        generaciones_descendientes = len([a for gen, a in descendientes.items() if a])
        
        # Calcular consanguinidad simple
        todos_ancestros = set()
        for gen_list in ancestros.values():
            todos_ancestros.update(gen_list)
        
        # Detectar ancestros comunes
        ancestros_comunes = defaultdict(int)
        for ancestro in todos_ancestros:
            # Contar cuántos descendientes directos tiene
            descs = list(self.grafo.successors(ancestro))
            if len(descs) > 1:
                ancestros_comunes[ancestro] = len(descs)
        
        return {
            'animal_id': animal_id,
            'especie': nodo_data.get('especie', 'N/A'),
            'raza': nodo_data.get('raza', 'N/A'),
            'generaciones': {
                'ancestros': generaciones_ancestros,
                'descendientes': generaciones_descendientes
            },
            'estadisticas': {
                'total_ancestros': len(todos_ancestros),
                'total_descendientes': len([a for gen, lst in descendientes.items() if lst for a in lst]),
                'ancestros_comunes_detectados': len(ancestros_comunes),
                'nivel_consanguinidad': 'Alto' if len(ancestros_comunes) > 0 else 'Bajo'
            },
            'circuitos': self.obtener_circuitos_logicos(animal_id),
            'ancestros_comunes': list(ancestros_comunes.keys())[:5]  # Top 5
        }
    
    def obtener_grafo_json_simple(self, animal_id, profundidad=2):
        """
        Retorna una representación JSON simple del árbol genealógico
        Útil para visualización en árbol jerárquico
        """
        def construir_arbol(animal_id, nivel=0, visitados=None):
            if visitados is None:
                visitados = set()
            
            if animal_id in visitados or nivel > profundidad:
                return None
            
            visitados.add(animal_id)
            nodo_data = self.grafo.nodes.get(animal_id, {})
            
            # Obtener padres
            padres = list(self.grafo.predecessors(animal_id))
            
            node = {
                'id': animal_id,
                'nombre': f"#{animal_id}",
                'especie': nodo_data.get('especie', 'N/A'),
                'raza': nodo_data.get('raza', 'N/A'),
                'padres': []
            }
            
            for padre_id in padres:
                padre_arbol = construir_arbol(padre_id, nivel + 1, visitados.copy())
                if padre_arbol:
                    node['padres'].append(padre_arbol)
            
            return node
        
        return construir_arbol(animal_id)
    
    def obtener_matiz_genetico(self, animal1_id, animal2_id):
        """
        Calcula la compatibilidad genética entre dos animales simulando un 'Matiz Genético'.
        Se basa en el porcentaje de ancestros compartidos (Coeficiente de Jaccard simplificado).
        
        Args:
            animal1_id (int): ID del primer animal.
            animal2_id (int): ID del segundo animal.
            
        Returns:
            dict: Resultados de compatibilidad y riesgo de consanguinidad.
        """
        ancestros1 = self._obtener_todos_ancestros(animal1_id)
        ancestros2 = self._obtener_todos_ancestros(animal2_id)
        
        ancestros_comunes = ancestros1 & ancestros2
        
        total_ancestros = len(ancestros1 | ancestros2)
        matiz = (len(ancestros_comunes) / total_ancestros * 100) if total_ancestros > 0 else 0
        
        return {
            'animal1_id': animal1_id,
            'animal2_id': animal2_id,
            'matiz_genetico': round(matiz, 2),
            'ancestros_comunes': len(ancestros_comunes),
            'compatibilidad': 'Alta' if matiz > 50 else 'Media' if matiz > 25 else 'Baja',
            'riesgo_consanguinidad': 'Crítico' if matiz > 40 else 'Alto' if matiz > 25 else 'Medio' if matiz > 10 else 'Bajo'
        }
    
    def _obtener_ancestros(self, animal_id, generaciones=3):
        """Obtiene ancestros hasta N generaciones"""
        ancestros = {0: [animal_id]}
        actual = {animal_id}
        
        for gen in range(1, generaciones + 1):
            proxima_gen = set()
            for animal in actual:
                predecesores = list(self.grafo.predecessors(animal))
                proxima_gen.update(predecesores)
            
            if proxima_gen:
                ancestros[gen] = list(proxima_gen)
                actual = proxima_gen
            else:
                break
        
        return ancestros
    
    def _obtener_descendientes(self, animal_id, generaciones=3):
        """Obtiene descendientes hasta N generaciones"""
        descendientes = {0: [animal_id]}
        actual = {animal_id}
        
        for gen in range(1, generaciones + 1):
            proxima_gen = set()
            for animal in actual:
                sucesores = list(self.grafo.successors(animal))
                proxima_gen.update(sucesores)
            
            if proxima_gen:
                descendientes[gen] = list(proxima_gen)
                actual = proxima_gen
            else:
                break
        
        return descendientes
        
    
    def _obtener_todos_ancestros(self, animal_id):
        """Obtiene TODOS los ancestros de un animal"""
        ancestros = set()
        cola = deque([animal_id])
        visitados = set()
        
        while cola:
            actual = cola.popleft()
            if actual in visitados:
                continue
            visitados.add(actual)
            
            predecesores = list(self.grafo.predecessors(actual))
            ancestros.update(predecesores)
            cola.extend(predecesores)
        
        return ancestros

class AnalizadorCircuitosLogicos:
    """Clase para análisis de reglas lógicas complejas aplicadas a objetos de negocio"""
    
    def __init__(self):
        self.circuitos_evaluados = []
    
    def analizar_salud_circuito(self, estado_animal, historiales_medicos):
        """
        Evalúa el estado de salud combinando múltiples variables mediante lógica booleana.
        Un animal es saludable si cumple: peso normal Y edad apropiada Y sin enfermedades recientes.
        
        Args:
            estado_animal (dict): Datos básicos del animal.
            historiales_medicos (list): Lista de diccionarios con el historial médico.
            
        Returns:
            dict: Evaluación de salud y confianza del análisis.
        """
        self.circuitos_evaluados = []
        edad_ok = estado_animal.get('edad', 0) > 0
        
        # Lógica: Sin enfermedades recientes
        sin_enfermedades = not any(
            h['tipo'].lower() in ['enfermedad', 'tratamiento_urgente'] 
            for h in historiales_medicos
        )
        
        peso_ok = estado_animal.get('peso', 0) > 20
        
        # Resultado lógico
        resultado = peso_ok and edad_ok and sin_enfermedades
        
        return {
            'estado_general': 'Saludable' if resultado else 'Requiere atención',
            'componentes': {
                'peso_normal': peso_ok,
                'edad_apropiada': edad_ok,
                'sin_enfermedades': sin_enfermedades
            },
            'confianza': 0.85
        }
    
    def analizar_productividad_circuito(self, peso_actual, ganancia_diaria, edad_meses):
        """
        Evalúa productividad con lógica booleana
        Productivo si: ganancia_diaria > umbral AND edad_apropiada AND peso_en_rango
        """
        
        ganancia_buena = ganancia_diaria > 0.5
        edad_productiva = 6 <= edad_meses <= 48
        peso_esperado = peso_actual > 100
        
        resultado = ganancia_buena and edad_productiva and peso_esperado
        
        return {
            'produccion': 'Alta' if resultado else 'Normal' if ganancia_buena else 'Baja',
            'componentes': {
                'ganancia_diaria_alta': ganancia_buena,
                'edad_productiva': edad_productiva,
                'peso_esperado': peso_esperado
            },
            'score_productividad': (
                (1 if ganancia_buena else 0) + 
                (1 if edad_productiva else 0) + 
                (1 if peso_esperado else 0)
            ) / 3 * 100
        }
