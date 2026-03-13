from flask import Blueprint, jsonify, request
from flask_login import login_required
from models import db, RegistroComida, Heroe

comida_bp = Blueprint('comida', __name__, url_prefix='/api')

@comida_bp.route('/comidas/<int:hid>', methods=['GET'])
@login_required
def get_comidas(hid):
    limit = int(request.args.get('limit', 20))
    comidas = (RegistroComida.query.filter_by(heroe_id=hid)
               .order_by(RegistroComida.fecha.desc()).limit(limit).all())
    return jsonify([c.to_dict() for c in comidas])

@comida_bp.route('/comidas', methods=['POST'])
@login_required
def registrar_comida():
    data = request.json or {}
    heroe_id = int(data.get('heroe_id', 0))
    emoji_map = {'desayuno': '🥞', 'almuerzo': '🍗', 'cena': '🥗', 'merienda': '🍎'}
    tipo = data.get('tipo_comida', 'merienda')
    comida = RegistroComida(
        heroe_id=heroe_id,
        tipo_comida=tipo,
        descripcion=data.get('descripcion', ''),
        carbohidratos=float(data.get('carbohidratos', 0)),
        proteinas=float(data.get('proteinas', 0)),
        grasas=float(data.get('grasas', 0)),
        calorias=float(data.get('calorias', 0)),
    )
    db.session.add(comida)
    db.session.commit()
    return jsonify({'status': 'success', 'id': comida.id})

@comida_bp.route('/comidas/resumen/<int:hid>', methods=['GET'])
@login_required
def resumen_nutricional(hid):
    from sqlalchemy import func
    from datetime import datetime, timedelta
    hoy = datetime.utcnow().replace(hour=0, minute=0, second=0)
    comidas_hoy = RegistroComida.query.filter(
        RegistroComida.heroe_id == hid,
        RegistroComida.fecha >= hoy
    ).all()
    total_carbos = sum(c.carbohidratos for c in comidas_hoy)
    total_cal = sum(c.calorias for c in comidas_hoy)
    total_prot = sum(c.proteinas for c in comidas_hoy)
    total_grasas = sum(c.grasas for c in comidas_hoy)
    return jsonify({
        'total_carbos': round(total_carbos, 1),
        'total_calorias': round(total_cal),
        'total_proteinas': round(total_prot, 1),
        'total_grasas': round(total_grasas, 1),
        'num_comidas': len(comidas_hoy),
    })
