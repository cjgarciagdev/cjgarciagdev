"""
Módulo de Teoría de Grafos para análisis genealógico y relaciones entre animales
Implementa algoritmos de grafos para árbol genealógico, distancias, caminos, etc.
"""

import networkx as nx
from collections import defaultdict, deque

class GrafoGenealogia:
    """
    MOTOR DE ANÁLISIS TOPOLÓGICO (GENEALOGÍA):
    Utiliza Teoría de Grafos para mapear y analizar la estructura familiar del rebaño.
    Implementado sobre NetworkX para cálculos de alta eficiencia.
    
    Capacidades:
    - Mapeo de Ancestría (Predecesores) y Descendencia (Sucesores).
    - Cálculo de Coeficiente de Inbreeding (Endogamia).
    - Detección de Ciclos (Inconsistencias lógicas como que un animal sea su propio ancestro).
    - Búsqueda de Camino Crítico Genético (Shortest Path).
    """
    
    def __init__(self):
        self.grafo = nx.DiGraph()
    
    def agregar_animal(self, animal_id, especie, raza):
        """Agregar nodo al grafo"""
        self.grafo.add_node(animal_id, especie=especie, raza=raza)
    
    def agregar_relacion(self, padre_id, madre_id, hijo_id):
        """Agregar relación padre-hijo al grafo"""
        self.grafo.add_edge(padre_id, hijo_id, tipo='padre')
        self.grafo.add_edge(madre_id, hijo_id, tipo='madre')
    
    def obtener_ancestros(self, animal_id, generaciones=3):
        """Obtener todos los ancestros hasta N generaciones"""
        ancestros = {0: [animal_id]}  # gen 0: el animal mismo
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
    
    def obtener_descendientes(self, animal_id, generaciones=3):
        """Obtener todos los descendientes hasta N generaciones"""
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
    
    def calcular_consanguinidad(self, animal1_id, animal2_id):
        """
        Calcular coeficiente de consanguinidad entre dos animales.
        Basado en ancestros comunes.
        """
        ancestros1 = self.obtener_ancestros(animal1_id, 5)
        ancestros2 = self.obtener_ancestros(animal2_id, 5)
        
        # Flatear listas de ancestros
        ancestros1_set = set()
        ancestros2_set = set()
        
        for gen_ancestros in ancestros1.values():
            ancestros1_set.update(gen_ancestros)
        
        for gen_ancestros in ancestros2.values():
            ancestros2_set.update(gen_ancestros)
        
        # Encontrar ancestros comunes
        comunes = ancestros1_set & ancestros2_set
        
        # Calcular coeficiente simple (número de ancestros comunes / total)
        if ancestros1_set or ancestros2_set:
            coeficiente = len(comunes) / max(len(ancestros1_set), len(ancestros2_set))
        else:
            coeficiente = 0
        
        return {
            'consanguinidad': round(coeficiente, 4),
            'ancestros_comunes': len(comunes),
            'riesgo_genetico': 'Alto' if coeficiente > 0.3 else 'Medio' if coeficiente > 0.15 else 'Bajo'
        }
    
    def camino_mas_corto(self, animal1_id, animal2_id):
        """Encontrar el camino más corto entre dos animales en el árbol"""
        try:
            # Crear grafo no dirigido para buscar caminos
            grafo_no_dirigido = self.grafo.to_undirected()
            
            if nx.has_path(grafo_no_dirigido, animal1_id, animal2_id):
                camino = nx.shortest_path(grafo_no_dirigido, animal1_id, animal2_id)
                return {
                    'existe': True,
                    'camino': camino,
                    'distancia': len(camino) - 1
                }
            else:
                return {
                    'existe': False,
                    'camino': [],
                    'distancia': float('inf')
                }
        except nx.NetworkXError:
            return {
                'existe': False,
                'camino': [],
                'distancia': float('inf')
            }
    
    def analizar_linea_pura(self, animal_id, profundidad=5):
        """
        Analizar si un animal proviene de línea pura.
        Línea pura = padres conocidos en varias generaciones.
        """
        ancestros = self.obtener_ancestros(animal_id, profundidad)
        
        info_lineas = {
            'pureza_lineal': 0,
            'generaciones_completas': 0,
            'rastreo_disponible': 0
        }
        
        total_generaciones = len(ancestros) - 1
        if total_generaciones == 0:
            return info_lineas
        
        generaciones_con_ancestros = sum(1 for gen, ancestros_gen in ancestros.items() if gen > 0 and ancestros_gen)
        info_lineas['generaciones_completas'] = generaciones_con_ancestros
        info_lineas['pureza_lineal'] = round(generaciones_con_ancestros / profundidad * 100, 2)
        info_lineas['rastreo_disponible'] = sum(len(anc) for anc in ancestros.values())
        
        return info_lineas
    
    def encontrar_linea_completa(self, animal_id):
        """Encontrar si existe una línea genealógica completa en ambos padres"""
        try:
            predecesores = list(self.grafo.predecessors(animal_id))
            
            if len(predecesores) == 0:
                return {'linea_completa': False, 'informacion': 'Sin padres registrados'}
            elif len(predecesores) == 1:
                return {'linea_completa': False, 'informacion': 'Solo un padre registrado'}
            else:
                # Tiene ambos padres, verificar si ellos tienen sus propios padres
                padre_info = []
                for padre in predecesores:
                    abuelos = list(self.grafo.predecessors(padre))
                    padre_info.append({
                        'id': padre,
                        'tiene_padres': len(abuelos) == 2
                    })
                
                linea_completa = all(p['tiene_padres'] for p in padre_info)
                return {
                    'linea_completa': linea_completa,
                    'padres_informacion': padre_info
                }
        except:
            return {'linea_completa': False, 'informacion': 'Error en análisis'}
    
    def calcular_coeficiente_inbreeding(self, animal_id):
        """
        Calcular coeficiente de inbreeding (endogamia).
        Mide el grado de consanguinidad del animal.
        """
        ancestros = self.obtener_ancestros(animal_id, 5)
        
        # Contar ancestros únicos por generación
        ancestros_unicos_por_gen = {}
        for gen, lista_ancestros in ancestros.items():
            ancestros_unicos_por_gen[gen] = len(set(lista_ancestros))
        
        # Calcular índice simple
        total_ancestros_esperados = 2 ** min(5, max(1, len(ancestros) - 1))  # 2^n ancestros esperados
        total_ancestros_reales = sum(ancestros_unicos_por_gen.values()) - 1  # Restar el animal mismo
        
        if total_ancestros_esperados == 0:
            indice_inbreeding = 0
        else:
            indice_inbreeding = round(max(0, 1 - (total_ancestros_reales / total_ancestros_esperados)), 4)
        
        return {
            'coeficiente_inbreeding': indice_inbreeding,
            'calidad_genealogia': 'Excelente' if indice_inbreeding < 0.1 else 'Buena' if indice_inbreeding < 0.3 else 'Regular' if indice_inbreeding < 0.5 else 'Pobre',
            'ancestros_unicos': max(0, total_ancestros_reales),
            'ancestros_esperados': total_ancestros_esperados
        }
    
    def detectar_ciclos(self):
        """Detectar ciclos en el grafo (relaciones circulares inconsistentes)"""
        try:
            ciclos = list(nx.simple_cycles(self.grafo))
            return {
                'tiene_ciclos': len(ciclos) > 0,
                'ciclos_detectados': len(ciclos),
                'ciclos': ciclos if ciclos else []
            }
        except:
            return {
                'tiene_ciclos': False,
                'ciclos_detectados': 0,
                'ciclos': []
            }
    
    def exportar_estructura_json(self):
        """Exportar estructura del grafo como JSON para visualización"""
        nodos = []
        enlaces = []
        
        for nodo in self.grafo.nodes():
            nodos.append({
                'id': nodo,
                'especie': self.grafo.nodes[nodo].get('especie', 'Desconocida'),
                'raza': self.grafo.nodes[nodo].get('raza', 'Desconocida')
            })
        
        for origen, destino, datos in self.grafo.edges(data=True):
            enlaces.append({
                'origen': origen,
                'destino': destino,
                'relacion': datos.get('tipo', 'ancestro')
            })
        
        return {
            'nodos': nodos,
            'enlaces': enlaces,
            'total_nodos': len(nodos),
            'total_enlaces': len(enlaces)
        }


def construir_grafo_desde_bd(animales_db):
    """
    Construir grafo genealógico desde registros de base de datos.
    
    Args:
        animales_db: Lista de objetos Ganado de la BD
    
    Returns:
        GrafoGenealogia inicializado
    """
    grafo = GrafoGenealogia()
    
    # Agregar nodos
    for animal in animales_db:
        especie_name = animal.cat_especie.nombre if animal.cat_especie else 'N/A'
        raza_name = animal.cat_raza.nombre if animal.cat_raza else 'N/A'
        grafo.agregar_animal(animal.id, especie_name, raza_name)
    
    # Agregar relaciones
    for animal in animales_db:
        # Agregar relación con Padre
        if animal.padre_id:
            padre_existe = any(a.id == animal.padre_id for a in animales_db)
            if padre_existe:
                grafo.grafo.add_edge(animal.padre_id, animal.id, tipo='padre')
        
        # Agregar relación con Madre
        if animal.madre_id:
            madre_existe = any(a.id == animal.madre_id for a in animales_db)
            if madre_existe:
                grafo.grafo.add_edge(animal.madre_id, animal.id, tipo='madre')
    
    return grafo
