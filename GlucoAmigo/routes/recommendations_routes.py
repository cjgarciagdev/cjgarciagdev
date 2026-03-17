from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from models import db, Heroe, RegistroGlucosa, EvaluacionPsicometrica, AlertaClinica
from sqlalchemy import or_

recom_bp = Blueprint('recom', __name__, url_prefix='/api')

@recom_bp.route('/recomendaciones/<int:hid>', methods=['GET'])
@login_required
def obtener_recomendaciones(hid):
    """Módulo de Recomendaciones Inteligentes para el Representante."""
    # Verificar acceso
    heroe = Heroe.query.filter(Heroe.id == hid, or_(Heroe.padre_id == current_user.id, Heroe.padre2_id == current_user.id)).first_or_404()
    
    recoms = []

    # 1. Análisis de Glucosa (Frecuencia de Hipos/Hiper)
    ultimos_30 = RegistroGlucosa.query.filter_by(heroe_id=hid).order_by(RegistroGlucosa.fecha.desc()).limit(30).all()
    if ultimos_30:
        hipos = [r for r in ultimos_30 if r.glucemia_actual < 70]
        hipers = [r for r in ultimos_30 if r.glucemia_actual > 200]
        
        if len(hipos) > 3:
            recoms.append({
                'tipo': 'medica',
                'titulo': 'Frecuencia de Hipoglucemias',
                'icon': '🧃',
                'texto': f'Se han detectado {len(hipos)} bajas en los últimos 30 registros. Revisa el ratio de carbohidratos con tu especialista.'
            })
        if len(hipers) > 5:
            recoms.append({
                'tipo': 'medica',
                'titulo': 'Tendencia a Glucosa Alta',
                'icon': '💧',
                'texto': 'Varias lecturas superan los 200 mg/dL. Asegúrate de que el niño esté bien hidratado y revisa la técnica de inyección.'
            })

    # 2. Análisis Psicoemocional (CDI)
    u_cdi = EvaluacionPsicometrica.query.filter_by(heroe_id=hid, tipo='CDI').order_by(EvaluacionPsicometrica.fecha.desc()).first()
    if u_cdi and u_cdi.estado == 'Riesgo':
        recoms.append({
            'tipo': 'psico',
            'titulo': 'Apoyo Emocional Requerido',
            'icon': '🧘‍♂️',
            'texto': 'El último puntaje CDI indica necesidad de apoyo. Dedica tiempo a actividades relajantes sin pantallas.'
        })

    # 3. Análisis de Adherencia (SCI-R)
    u_scir = EvaluacionPsicometrica.query.filter_by(heroe_id=hid, tipo='SCIR').order_by(EvaluacionPsicometrica.fecha.desc()).first()
    if u_scir and u_scir.puntaje_total < 70:
        recoms.append({
            'tipo': 'adherencia',
            'titulo': 'Motivación y Rutina',
            'icon': '🏆',
            'texto': 'La adherencia ha bajado un poco. ¡Prueben una nueva misión en la Zona de Juegos para ganar puntos de poder!'
        })

    # 4. Recomendación General basada en el día
    from datetime import datetime
    hora = datetime.now().hour
    if hora > 20:
        recoms.append({
            'tipo': 'cuidado',
            'titulo': 'Preparación Nocturna',
            'icon': '🌙',
            'texto': 'Recordatorio: Mide la glucemia antes de dormir para prevenir hipos nocturnas.'
        })
    elif hora < 10:
        recoms.append({
            'tipo': 'cuidado',
            'titulo': 'Desayuno Saludable',
            'icon': '☀️',
            'texto': 'Un buen conteo de carbohidratos en el desayuno estabiliza el resto del día.'
        })

    # Si no hay recomendaciones específicas
    if not recoms:
        recoms.append({
            'tipo': 'info',
            'titulo': 'Todo bajo control',
            'icon': '✨',
            'texto': 'Sigue así. Mantener los registros constantes es la mejor herramienta para el control de la diabetes.'
        })

    return jsonify(recoms)
