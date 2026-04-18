"""
GradeScanner - Flask Application (Simplified)
Sistema simplificado de examenes con plantillas
Solo examenes: permite registrar plantillas (opcion multiple y opcion libre)
"""

import os
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS

from database import db, init_app
from config import get_config
from models import Examen, Plantilla, Pregunta, Configuracion, Seccion
from ocr_engine import OCREngine

# Crear aplicación con configuración
app = Flask(__name__)
config = get_config()
app.config.from_object(config)

# Habilitar CORS
CORS(app)

# Configuración de uploads
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

# Inicializar base de datos
init_app(app)

# Asegurar que existe la carpeta de uploads
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Inicializar motor OCR
ocr_engine = OCREngine()


def allowed_file(filename):
    """Verifica si el archivo tiene una extensión permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


# ==================== RUTAS PRINCIPALES ====================

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')


@app.route('/dashboard')
def dashboard():
    """Dashboard principal"""
    return render_template('dashboard.html')


@app.route('/scan')
def scan_page():
    """Página de escaneo"""
    return render_template('scan.html')


@app.route('/secciones')
def secciones_page():
    """Página de gestión de secciones"""
    return render_template('secciones.html')


@app.route('/exams')
def exams_page():
    """Página de exámenes"""
    return render_template('exams.html')


@app.route('/templates')
def templates_page():
    """Página de plantillas"""
    return render_template('templates.html')


# ==================== API: SECCIONES ====================

@app.route('/api/secciones', methods=['GET'])
def get_secciones():
    """Obtiene todas las secciones"""
    secciones = Seccion.query.filter_by(activo=True).all()
    return jsonify([s.to_dict() for s in secciones])


@app.route('/api/secciones', methods=['POST'])
def create_seccion():
    """Crea una nueva sección"""
    data = request.get_json()
    
    seccion = Seccion(
        asignatura=data['asignatura'],
        grado=data['grado'],
        letra=data['letra'],
        lapso=data.get('lapso', ''),
        profesor=data.get('profesor', '')
    )
    
    db.session.add(seccion)
    db.session.commit()
    
    return jsonify(seccion.to_dict()), 201


@app.route('/api/secciones/<int:id>', methods=['GET'])
def get_seccion(id):
    """Obtiene una sección por ID"""
    seccion = Seccion.query.get_or_404(id)
    return jsonify(seccion.to_dict())


@app.route('/api/secciones/<int:id>', methods=['PUT'])
def update_seccion(id):
    """Actualiza una sección"""
    seccion = Seccion.query.get_or_404(id)
    data = request.get_json()
    
    seccion.asignatura = data.get('asignatura', seccion.asignatura)
    seccion.grado = data.get('grado', seccion.grado)
    seccion.letra = data.get('letra', seccion.letra)
    seccion.lapso = data.get('lapso', seccion.lapso)
    seccion.profesor = data.get('profesor', seccion.profesor)
    
    db.session.commit()
    return jsonify(seccion.to_dict())


@app.route('/api/secciones/<int:id>', methods=['DELETE'])
def delete_seccion(id):
    """Elimina (desactiva) una sección"""
    seccion = Seccion.query.get_or_404(id)
    seccion.activo = False
    db.session.commit()
    return jsonify({'message': 'Sección eliminada'})


# ==================== API: PLANTILLAS ====================

@app.route('/api/plantillas', methods=['GET'])
def get_plantillas():
    """Obtiene todas las plantillas"""
    seccion_id = request.args.get('seccion_id', type=int)
    
    query = Plantilla.query.filter_by(activa=True)
    
    if seccion_id:
        query = query.filter_by(seccion_id=seccion_id)
    
    plantillas = query.all()
    return jsonify([p.to_dict() for p in plantillas])


@app.route('/api/plantillas', methods=['POST'])
def create_plantilla():
    """Crea una nueva plantilla"""
    data = request.get_json()
    
    # Solo opción múltiple
    respuestas = json.dumps(data.get('respuestas_correctas', []))
    
    plantilla = Plantilla(
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        seccion_id=data.get('seccion_id'),
        tipo_examen='multiple_choice',
        respuestas_correctas=respuestas,
        puntaje_total=data.get('puntaje_total', 10)
    )
    
    db.session.add(plantilla)
    db.session.commit()
    
    return jsonify(plantilla.to_dict()), 201


@app.route('/api/plantillas/<int:id>', methods=['GET'])
def get_plantilla(id):
    """Obtiene una plantilla por ID"""
    plantilla = Plantilla.query.get_or_404(id)
    return jsonify(plantilla.to_dict())


@app.route('/api/plantillas/<int:id>', methods=['PUT'])
def update_plantilla(id):
    """Actualiza una plantilla"""
    plantilla = Plantilla.query.get_or_404(id)
    data = request.get_json()
    
    plantilla.nombre = data.get('nombre', plantilla.nombre)
    plantilla.descripcion = data.get('descripcion', plantilla.descripcion)
    if 'seccion_id' in data:
        plantilla.seccion_id = data['seccion_id']
    
    if 'respuestas_correctas' in data:
        plantilla.respuestas_correctas = json.dumps(data.get('respuestas_correctas', []))
    
    if 'puntaje_total' in data:
        plantilla.puntaje_total = data['puntaje_total']
    
    db.session.commit()
    return jsonify(plantilla.to_dict())


@app.route('/api/plantillas/<int:id>', methods=['DELETE'])
def delete_plantilla(id):
    """Elimina (desactiva) una plantilla"""
    plantilla = Plantilla.query.get_or_404(id)
    plantilla.activa = False
    db.session.commit()
    return jsonify({'message': 'Plantilla eliminada'})


# ==================== API: EXÁMENES Y ESCANEO ====================

@app.route('/api/ocr/status', methods=['GET'])
def ocr_status():
    """Verifica el estado del motor OCR"""
    status = ocr_engine.check_tesseract()
    
    # Agregar información adicional de diagnóstico
    status['api_key_configured'] = bool(ocr_engine.api_key and ocr_engine.api_key != '')
    status['api_key_prefix'] = ocr_engine.api_key[:4] + '...' if ocr_engine.api_key and len(ocr_engine.api_key) > 4 else 'N/A'
    status['api_url'] = ocr_engine.api_url
    status['language'] = ocr_engine.language
    status['last_error'] = getattr(ocr_engine, 'last_error', None)
    
    return jsonify(status), 200


@app.route('/api/ocr/test', methods=['POST'])
def ocr_test():
    """Endpoint de prueba para verificar el OCR con una imagen de prueba"""
    if 'file' not in request.files:
        return jsonify({'error': 'No se recibió ningún archivo'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    if file:
        # Guardar temporalmente
        import tempfile
        import uuid
        
        suffix = '.' + file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name
        
        try:
            # Probar OCR
            result = ocr_engine.extract_text_with_confidence(tmp_path)
            return jsonify(result)
        finally:
            # Limpiar
            import os
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    return jsonify({'error': 'Tipo de archivo no permitido'}), 400

@app.route('/api/scan', methods=['POST'])
def scan_examen():
    """Escanea un examen desde una imagen (soporta bubble sheets y texto)"""
    if 'file' not in request.files:
        return jsonify({'error': 'No se recibió ningún archivo'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    if file and allowed_file(file.filename):
        # Usar archivo temporal que se eliminará al terminar (NO se guarda permanentemente)
        import tempfile
        suffix = '.' + file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else '.jpg'
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        filepath = tmp.name
        tmp.close()
        file.save(filepath)
        
        titulo = request.form.get('titulo', 'Evaluación sin título')
        nombre_estudiante = request.form.get('nombre_estudiante', '').strip()
        seccion_id = request.form.get('seccion_id', type=int)
        plantilla_id = request.form.get('plantilla_id', type=int)
        
        # Modo de detección: 'auto', 'bubble', 'text'
        detection_mode = request.form.get('detection_mode', 'auto')
        
        # Opciones personalizadas (ej: "A,B,C,D" o "A,B,C,D,E")
        custom_options = request.form.get('options', '')
        options = [x.strip().upper() for x in custom_options.split(',') if x.strip()] if custom_options else None
        
        # Número de preguntas esperado (opcional)
        num_questions = request.form.get('num_questions', type=int)
        
        try:
            # Obtener plantilla si existe
            plantilla = Plantilla.query.get(plantilla_id) if plantilla_id else None
            
            # Determinar opciones desde plantilla si no se especificaron
            if not options and plantilla and plantilla.respuestas_correctas:
                try:
                    correct = json.loads(plantilla.respuestas_correctas)
                    if correct:
                        all_opts = set(c.get('respuesta', '').upper() for c in correct if c.get('respuesta'))
                        if all_opts:
                            max_opt = max(all_opts)
                            options = [chr(c) for c in range(ord('A'), ord(max_opt) + 1)]
                        if not num_questions:
                            num_questions = len(correct)
                except:
                    pass
            
            # Determinar force_mode basado en detection_mode
            force_mode = None
            if detection_mode == 'bubble':
                force_mode = 'bubble'
            elif detection_mode == 'text':
                force_mode = 'text'
            
            # Usar el método híbrido de procesamiento
            result = ocr_engine.process_image(
                filepath,
                force_mode=force_mode,
                num_questions=num_questions,
                options=options
            )
            
            # Verificar si hay error
            if result.get('error') and not result.get('answers'):
                return jsonify({
                    'error': f'Error de procesamiento: {result["error"]}',
                    'details': 'La imagen no pudo ser procesada. Verifica que la imagen sea legible.',
                    'method': result.get('method', 'none'),
                    'image_type': result.get('image_type', 'unknown')
                }), 500
            
            # Verificar que se encontraron respuestas o texto
            if not result.get('answers') and not result.get('text'):
                return jsonify({
                    'error': 'No se detectaron respuestas ni texto en la imagen',
                    'details': 'La imagen puede ser ilegible o no contener un formato reconocible. Intenta con una imagen más clara o selecciona el modo de detección correcto.',
                    'method': result.get('method', 'none'),
                    'image_type': result.get('image_type', 'unknown')
                }), 500
            
            extracted_answers = result.get('answers', [])
            
            # Crear examen en la base de datos (sin ruta de imagen)
            examen = Examen(
                titulo=titulo,
                nombre_estudiante=nombre_estudiante or None,
                seccion_id=seccion_id,
                plantilla_id=plantilla_id,
                imagen_path=None,  # No se guarda la imagen permanentemente
                texto_ocr=result.get('text', ''),
                confianza_ocr=result.get('confidence', 0),
                estado='procesado' if plantilla else 'pendiente'
            )
            
            db.session.add(examen)
            db.session.commit()
            
            # Calificar si hay plantilla
            grade_result = None
            if plantilla:
                correct_answers = json.loads(plantilla.respuestas_correctas) if plantilla.respuestas_correctas else []
                grade_result = ocr_engine.grade_answers(extracted_answers, correct_answers)
                
                examen.nota_final = grade_result['nota']
                examen.estado = 'revisado'
                
                # Crear preguntas
                for r in grade_result['resultados']:
                    pregunta = Pregunta(
                        examen_id=examen.id,
                        plantilla_id=plantilla_id,
                        numero=r['pregunta'],
                        tipo='multiple_choice',
                        respuesta_estudiante=r.get('respuesta_estudiante'),
                        respuesta_correcta=r.get('respuesta_correcta'),
                        puntos=r['puntos'],
                        puntos_obtenidos=r['puntos_obtenidos']
                    )
                    db.session.add(pregunta)
                
                db.session.commit()
            
            return jsonify({
                'examen': examen.to_dict(),
                'ocr': {
                    'text': result.get('text', ''),
                    'confidence': result.get('confidence', 0),
                    'words': result.get('words', 0),
                    'error': result.get('error'),
                    'method': result.get('method', 'unknown'),
                    'image_type': result.get('image_type', 'unknown')
                },
                'extracted_answers': extracted_answers,
                'grade': grade_result
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Error al procesar: {str(e)}'}), 500
        
        finally:
            # Siempre eliminar el archivo temporal
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({'error': 'Tipo de archivo no permitido'}), 400


@app.route('/api/scan/bubble-test', methods=['POST'])
def scan_bubble_test():
    """Endpoint de prueba para verificar detección de burbujas"""
    if 'file' not in request.files:
        return jsonify({'error': 'No se recibió ningún archivo'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    if file:
        import tempfile
        
        suffix = '.' + file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name
        
        try:
            # Probar detección de tipo
            image_type = ocr_engine.detect_image_type(tmp_path)
            
            # Probar procesamiento completo
            result = ocr_engine.process_image(tmp_path, force_mode='bubble')
            
            return jsonify({
                'image_type': image_type,
                'method': result.get('method', 'none'),
                'answers': result.get('answers', []),
                'confidence': result.get('confidence', 0),
                'text': result.get('text', ''),
                'error': result.get('error')
            })
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    return jsonify({'error': 'Tipo de archivo no permitido'}), 400


@app.route('/api/examenes', methods=['GET'])
def get_examenes():
    """Obtiene todos los exámenes"""
    seccion_id = request.args.get('seccion_id', type=int)
    plantilla_id = request.args.get('plantilla_id', type=int)
    estado = request.args.get('estado')
    
    query = Examen.query
    
    if seccion_id:
        query = query.filter_by(seccion_id=seccion_id)
    if plantilla_id:
        query = query.filter_by(plantilla_id=plantilla_id)
    if estado:
        query = query.filter_by(estado=estado)
    
    examenes = query.order_by(Examen.fecha_escaneo.desc()).all()
    return jsonify([e.to_dict() for e in examenes])


@app.route('/api/examenes/<int:id>', methods=['GET'])
def get_examen(id):
    """Obtiene un examen por ID"""
    examen = Examen.query.get_or_404(id)
    
    # Obtener preguntas del examen
    preguntas = Pregunta.query.filter_by(examen_id=id).all()
    
    result = examen.to_dict()
    result['preguntas'] = [p.to_dict() for p in preguntas]
    
    return jsonify(result)


@app.route('/api/examenes/<int:id>', methods=['PUT'])
def update_examen(id):
    """Actualiza un examen (nota manual, observaciones)"""
    examen = Examen.query.get_or_404(id)
    data = request.get_json()
    
    if 'nota_final' in data:
        examen.nota_final = data['nota_final']
    if 'observaciones' in data:
        examen.observaciones = data['observaciones']
    if 'estado' in data:
        examen.estado = data['estado']
    
    if data.get('estado') == 'revisado':
        examen.fecha_revision = datetime.utcnow()
    
    db.session.commit()
    return jsonify(examen.to_dict())


@app.route('/api/examenes/<int:id>', methods=['DELETE'])
def delete_examen(id):
    """Elimina un examen"""
    examen = Examen.query.get_or_404(id)
    db.session.delete(examen)
    db.session.commit()
    return jsonify({'message': 'Examen eliminado'})


# ==================== API: PREGUNTAS ====================

@app.route('/api/preguntas/examen/<int:examen_id>', methods=['GET'])
def get_preguntas_examen(examen_id):
    """Obtiene las preguntas de un examen"""
    preguntas = Pregunta.query.filter_by(examen_id=examen_id).order_by(Pregunta.numero).all()
    return jsonify([p.to_dict() for p in preguntas])


# ==================== API: ESTADÍSTICAS ====================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Obtiene estadísticas del sistema"""
    
    # Contar secciones
    total_secciones = Seccion.query.filter_by(activo=True).count()
    
    # Contar plantillas
    total_plantillas = Plantilla.query.filter_by(activa=True).count()
    
    # Contar exámenes
    total_examenes = Examen.query.count()
    
    # Exámenes por estado
    examen_estados = db.session.query(
        Examen.estado, 
        db.func.count(Examen.id)
    ).group_by(Examen.estado).all()
    
    # Promedio de notas
    notas_promedio = db.session.query(
        db.func.avg(Examen.nota_final)
    ).filter(Examen.nota_final.isnot(None)).scalar() or 0
    
    # Exámenes recientes
    examenes_recientes = Examen.query.order_by(
        Examen.fecha_escaneo.desc()
    ).limit(10).all()
    
    return jsonify({
        'total_secciones': total_secciones,
        'total_plantillas': total_plantillas,
        'total_examenes': total_examenes,
        'examenes_por_estado': {e[0]: e[1] for e in examen_estados},
        'nota_promedio': round(float(notas_promedio), 2),
        'examenes_recientes': [e.to_dict() for e in examenes_recientes]
    })


# ==================== API: SALUD ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud"""
    return jsonify({
        'status': 'ok',
        'environment': config.ENV,
        'database': 'supabase' if config.USE_SUPABASE else 'sqlite'
    })


# ==================== ARCHIVOS ESTÁTICOS ====================

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Recurso no encontrado'}), 404
