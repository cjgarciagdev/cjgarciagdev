from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, EvaluacionPsicometrica, AlertaClinica, Heroe
import json

psico_bp = Blueprint('psico', __name__, url_prefix='/api')

# ── Módulo 3: Interfaz de Emojis CDI (moo.md) ────────────────────────────────
# 7 preguntas adaptadas con escala visual 0-3 (Feliz=0, Neutro=1, Triste=2, MuyTriste=3)
CDI_PREGUNTAS = [
    "¿Cómo te sientes la mayoría del tiempo?",
    "¿Qué tan divertido es para ti jugar y hacer actividades?",
    "¿Cómo te sientes pensando en tu futuro?",
    "¿Sientes que haces las cosas bien?",
    "¿Cómo te llevas con tus amigos y familia?",
    "¿Cómo te sientes cuando piensas en ir al hospital?",
    "¿Sientes que puedes hacer las cosas que hacen los otros niños?",
]

# Cuestionario de Adherencia SCI-R simplificado para el cuidador (moo.md)
SCIR_PREGUNTAS = [
    "¿Con qué frecuencia miden la glucosa cada día?",
    "¿Siguen bien el horario de las inyecciones?",
    "¿Llevan un registro de lo que come el niño?",
    "¿Siguen la dieta recomendada por el médico?",
    "¿Cumplen con todas las visitas médicas?",
]

@psico_bp.route('/psico/preguntas/<string:tipo>', methods=['GET'])
@login_required
def get_preguntas(tipo):
    if tipo == 'CDI':
        return jsonify({'preguntas': CDI_PREGUNTAS, 'escala': 4})
    elif tipo == 'SCIR':
        return jsonify({'preguntas': SCIR_PREGUNTAS, 'escala': 4})
    return jsonify({'error': 'Tipo no válido'}), 400

@psico_bp.route('/psico/guardar', methods=['POST'])
@login_required
def guardar_evaluacion():
    """Calculador de Baremos automático (moo.md §Módulo 3)."""
    data      = request.json or {}
    heroe_id  = int(data.get('heroe_id', 0))
    tipo      = data.get('tipo', 'CDI')
    respuestas= data.get('respuestas', [])
    puntaje   = sum(respuestas)

    # ── Baremos y diagnóstico preventivo (moo.md) ─────────────────────────
    if tipo == 'CDI':
        # CDI: puntaje >= 19 → Riesgo de Sintomatología Depresiva (moo.md)
        estado = 'Riesgo' if puntaje >= 19 else 'Estable'
    else:
        # SCIR: inversamente proporcional — porcentaje sobre máximo posible
        max_posible = len(respuestas) * 3 if respuestas else 1
        porcentaje  = round((puntaje / max_posible) * 100)
        estado = 'Baja' if porcentaje < 70 else 'Alta'
        puntaje = porcentaje  # persistir el porcentaje para el panel

    eval_ = EvaluacionPsicometrica(
        heroe_id=heroe_id, tipo=tipo,
        puntaje_total=puntaje, estado=estado,
        respuestas=json.dumps(respuestas)
    )
    db.session.add(eval_)

    # Alerta automática al especialista si CDI en Riesgo (moo.md §ENVIAR_ALERTA_AUTOMATICA)
    if tipo == 'CDI' and estado == 'Riesgo':
        heroe = Heroe.query.get(heroe_id)
        alerta = AlertaClinica(
            heroe_id=heroe_id, tipo='depresion', severidad='amarilla',
            mensaje=(f"📊 {heroe.nombre if heroe else 'Paciente'} obtuvo {puntaje} pts en CDI. "
                     f"Riesgo de Sintomatología Depresiva. Se recomienda evaluación psicológica.")
        )
        db.session.add(alerta)
        eval_.alerta_enviada = True

    # Si SCIR Baja adherencia, registrar alerta también
    if tipo == 'SCIR' and estado == 'Baja':
        heroe = Heroe.query.get(heroe_id)
        alerta = AlertaClinica(
            heroe_id=heroe_id, tipo='adherencia', severidad='amarilla',
            mensaje=(f"📋 Baja adherencia detectada ({puntaje}%) en {heroe.nombre if heroe else 'Paciente'}. "
                     f"Se recomienda refuerzo de Tips de Autocuidado para Padres.")
        )
        db.session.add(alerta)

    db.session.commit()
    return jsonify({'status': 'success', 'puntaje': puntaje, 'estado': estado, 'id': eval_.id})

@psico_bp.route('/psico/historial/<int:hid>', methods=['GET'])
@login_required
def historial_psico(hid):
    evals = (EvaluacionPsicometrica.query.filter_by(heroe_id=hid)
             .order_by(EvaluacionPsicometrica.fecha.desc()).limit(20).all())
    return jsonify([e.to_dict() for e in evals])
