from flask import Blueprint, jsonify, request
from models import Ganado, obtener_animal, obtener_pesos_animal
from services.animal_service import analisis_avanzado_animal
from services.grafo_service import construir_grafo_desde_bd
from services.visualizador_grafos import VisualizadorGrafosAvanzado
from utils.decorators import require_permission

analisis_bp = Blueprint('analisis', __name__)

@analisis_bp.route('/api/grafo/genealogia/<int:id>')
@require_permission('ver_analisis')
def get_grafo_genealogia(id):
    """
    Endpoint modular para obtener el grafo genealógico avanzado.
    Utiliza el motor NetworkX para cálculos de consanguinidad y profundidad.
    """
    try:
        animales = Ganado.query.all()
        grafo_completo = construir_grafo_desde_bd(animales)
        visualizador = VisualizadorGrafosAvanzado(grafo_completo)
        
        # Obtener datos compatibles con Vis.js y el análisis estadístico
        datos_vis = visualizador.obtener_datos_vis_js(id, 3)
        analisis_genealogico = visualizador.obtener_analisis_genealogia_completo(id)
        
        return jsonify({
            'visualizacion': datos_vis,
            'analisis': analisis_genealogico
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analisis_bp.route('/api/grafo/red-completa')
@require_permission('ver_analisis')
def get_red_completa():
    """Retorna todos los animales y sus relaciones para la Red del Rebaño."""
    try:
        animales = Ganado.query.all()
        grafo_completo = construir_grafo_desde_bd(animales)
        visualizador = VisualizadorGrafosAvanzado(grafo_completo)
        return jsonify(visualizador.obtener_red_completa())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analisis_bp.route('/api/grafo/camino', methods=['POST'])
@require_permission('ver_analisis')
def get_camino_genealogico():
    """Busca el camino más corto entre dos animales."""
    try:
        data = request.json
        origen = data.get('origen')
        destino = data.get('destino')
        
        animales = Ganado.query.all()
        grafo = construir_grafo_desde_bd(animales)
        resultado = grafo.camino_mas_corto(origen, destino)
        
        if resultado['existe']:
            pasos = []
            camino = resultado['camino']
            for i in range(len(camino) - 1):
                u, v = camino[i], camino[i+1]
                # Determinar relación buscando en el grafo original (dirigido)
                edge_data = grafo.grafo.edges.get((u, v))
                if edge_data:
                    rel = f"padre de" if edge_data.get('tipo') == 'padre' else "madre de"
                else:
                    edge_data = grafo.grafo.edges.get((v, u))
                    if edge_data:
                        rel = f"hijo de"
                    else:
                        rel = "pariente"
                
                pasos.append({
                    'desde': u,
                    'hacia': v,
                    'relacion': rel
                })
            resultado['pasos'] = pasos
            
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analisis_bp.route('/api/analisis/avanzado/<int:id>')
@require_permission('ver_analisis')
def get_analisis_avanzado(id):
    """
    Endpoint para análisis de score genético y productivo.
    """
    try:
        animal = obtener_animal(id)
        if not animal:
            return jsonify({'error': 'Animal no encontrado'}), 404
            
        historial = obtener_pesos_animal(id)
        # Aseguramos que el animal vaya como dict si el servicio lo requiere
        animal_dict = animal.to_dict() if hasattr(animal, 'to_dict') else animal
        analisis = analisis_avanzado_animal(animal_dict, historial)
        
        return jsonify({
            'analisis': analisis
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analisis_bp.route('/api/analisis/comparativa-genetica', methods=['POST'])
@require_permission('ver_analisis')
def comparativa_genetica():
    """
    Analiza la compatibilidad genética entre dos animales.
    Útil para decidir cruces y evitar consanguinidad.
    """
    try:
        data = request.json
        p1_id = data.get('animal1_id')
        p2_id = data.get('animal2_id')
        
        if not p1_id or not p2_id:
            return jsonify({'error': 'Se requieren dos IDs de animales'}), 400
            
        animales = Ganado.query.all()
        grafo_completo = construir_grafo_desde_bd(animales)
        visualizador = VisualizadorGrafosAvanzado(grafo_completo)
        
        resultado = visualizador.obtener_matiz_genetico(p1_id, p2_id)
        
        # Agregar info de los animales
        a1 = Ganado.query.get(p1_id)
        a2 = Ganado.query.get(p2_id)
        
        resultado['animales'] = {
            'a1': a1.to_dict() if a1 else None,
            'a2': a2.to_dict() if a2 else None
        }
        
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
