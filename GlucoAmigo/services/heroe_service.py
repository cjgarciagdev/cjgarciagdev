from models import Heroe, RegistroGlucosa, EvaluacionPsicometrica, AlertaClinica, db
from sqlalchemy import or_

def _next_codigo():
    last = Heroe.query.order_by(Heroe.id.desc()).first()
    n = (last.id + 1) if last else 1
    return f'P-{n:03d}'

def calcular_tir(registros):
    if not registros:
        return 0
    en_rango = [r for r in registros if 70 <= r.glucemia_actual <= 180]
    return round((len(en_rango) / len(registros)) * 100)

def resumen_para_padre(current_user):
    heroes = Heroe.query.filter(or_(Heroe.padre_id == current_user.id, Heroe.padre2_id == current_user.id), Heroe.activo == True).all()
    resultado = []
    for h in heroes:
        registros_30 = (RegistroGlucosa.query.filter_by(heroe_id=h.id)
                        .order_by(RegistroGlucosa.fecha.desc()).limit(30).all())
        u_glucosa = registros_30[0] if registros_30 else None
        u_cdi     = (EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='CDI')
                     .order_by(EvaluacionPsicometrica.fecha.desc()).first())
        u_scir    = (EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='SCIR')
                     .order_by(EvaluacionPsicometrica.fecha.desc()).first())
        alertas_p = AlertaClinica.query.filter_by(heroe_id=h.id, resuelta=False).count()

        tir = calcular_tir(registros_30)

        riesgo_glucemia = u_glucosa and (u_glucosa.glucemia_actual < 70 or u_glucosa.glucemia_actual > 250)
        riesgo_psico    = u_cdi and u_cdi.estado == 'Riesgo'

        status = 'Estable'
        if riesgo_glucemia or riesgo_psico:
            status = 'Critico'
        elif alertas_p > 0 or (u_scir and u_scir.estado == 'Baja') or tir < 70:
            status = 'Alerta'

        h_dict = h.to_dict()
        h_dict['estado'] = status
        h_dict['tir'] = tir
        h_dict['ultima_glucemia'] = u_glucosa.glucemia_actual if u_glucosa else None
        h_dict['fecha_glucemia'] = u_glucosa.fecha.strftime('%d/%m %H:%M') if u_glucosa else '—'
        h_dict['alertas_pendientes'] = alertas_p
        resultado.append(h_dict)

    return resultado

def crear_heroe_por_padre(current_user, data):
    heroe = Heroe(padre_id=current_user.id, codigo=_next_codigo())
    db.session.add(heroe)
    heroe.nombre    = data.get('nombre', 'Héroe')
    heroe.edad      = int(data.get('edad', 0))
    heroe.peso      = float(data.get('peso', 0))
    heroe.estatura  = float(data.get('estatura', 0))
    heroe.fecha_nac = data.get('fecha_nac')
    heroe.foto_emoji = data.get('foto_emoji', '🦸' if heroe.edad < 12 else '🧑‍🦱')
    db.session.commit()
    return heroe
