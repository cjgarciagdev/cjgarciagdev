from flask import Blueprint, jsonify, request
from flask_login import login_required
from models import db, CrecimientoRegistro, Heroe, Recordatorio

growth_bp = Blueprint('growth', __name__, url_prefix='/api')

@growth_bp.route('/crecimiento/<int:hid>', methods=['GET'])
@login_required
def get_crecimiento(hid):
    registros = (CrecimientoRegistro.query.filter_by(heroe_id=hid)
                 .order_by(CrecimientoRegistro.fecha.asc()).all())
    return jsonify([r.to_dict() for r in registros])

@growth_bp.route('/crecimiento', methods=['POST'])
@login_required
def registrar_crecimiento():
    data = request.json or {}
    heroe = Heroe.query.get_or_404(int(data.get('heroe_id', 0)))
    peso = float(data.get('peso', heroe.peso))
    estatura = float(data.get('estatura', heroe.estatura))
    h_m = estatura / 100 if estatura > 0 else 1
    imc = round(peso / (h_m * h_m), 1)

    reg = CrecimientoRegistro(
        heroe_id=heroe.id, peso=peso, estatura=estatura,
        imc=imc, notas=data.get('notas', '')
    )
    db.session.add(reg)

    # Update hero weight/height
    heroe.peso = peso
    heroe.estatura = estatura
    db.session.commit()
    return jsonify({'status': 'success', 'imc': imc})

# ── Recordatorios ─────────────────────────────────────────────────

@growth_bp.route('/recordatorios/<int:hid>', methods=['GET'])
@login_required
def get_recordatorios(hid):
    recs = Recordatorio.query.filter_by(heroe_id=hid, activo=True).all()
    return jsonify([r.to_dict() for r in recs])

@growth_bp.route('/recordatorios', methods=['POST'])
@login_required
def crear_recordatorio():
    data = request.json or {}
    rec = Recordatorio(
        heroe_id=int(data.get('heroe_id', 0)),
        tipo=data.get('tipo', 'glucosa'),
        mensaje=data.get('mensaje', ''),
        hora=data.get('hora', '08:00'),
        dias=data.get('dias', 'L,M,X,J,V,S,D'),
    )
    db.session.add(rec)
    db.session.commit()
    return jsonify({'status': 'success', 'id': rec.id})

@growth_bp.route('/recordatorios/<int:rid>', methods=['DELETE'])
@login_required
def eliminar_recordatorio(rid):
    rec = Recordatorio.query.get_or_404(rid)
    rec.activo = False
    db.session.commit()
    return jsonify({'status': 'success'})
