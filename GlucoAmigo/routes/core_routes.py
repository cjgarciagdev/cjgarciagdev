from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_required, current_user
from models import db, Heroe, RegistroGlucosa, Evaluacion
from datetime import datetime

core_bp = Blueprint('core', __name__)

@core_bp.route('/')
def root():
    return redirect(url_for('auth.login'))

@core_bp.route('/perfil_heroe', methods=['GET', 'POST'])
@login_required
def perfil_heroe():
    if current_user.rol != 'cuidador':
        return redirect(url_for('core.panel'))
        
    if request.method == 'POST':
        nombre = request.form.get('nombre_nino')
        edad = int(request.form.get('edad_nino'))
        peso = float(request.form.get('peso_nino'))
        codigo = f"P-{str(Heroe.query.count() + 1).zfill(3)}"
        
        nuevo_heroe = Heroe(nombre=nombre, edad=edad, peso=peso, codigo=codigo, cuidador_id=current_user.id)
        db.session.add(nuevo_heroe)
        db.session.commit()
        
        return redirect(url_for('core.dashboard'))
        
    return render_template('perfil_heroe.html')

@core_bp.route('/dashboard')
@login_required
def dashboard():
    if current_user.rol != 'cuidador':
        return redirect(url_for('core.panel'))
        
    heroe = Heroe.query.filter_by(cuidador_id=current_user.id).first()
    if not heroe:
        return redirect(url_for('core.perfil_heroe'))
        
    tema = heroe.get_tema()
    
    return render_template('dashboard.html', heroe=heroe, tema=tema)

@core_bp.route('/dosificacion', methods=['POST'])
@login_required
def dosificacion():
    heroe_id = request.form.get('heroe_id')
    glucemia_actual = float(request.form.get('glucemia'))
    carbohidratos = float(request.form.get('carbohidratos'))
    
    heroe = Heroe.query.get(heroe_id)
    
    # Motor de Inferencia
    dosis_carbohidratos = carbohidratos / heroe.ratio_carbohidratos
    correccion_glucosa = (glucemia_actual - 100) / heroe.factor_sensibilidad
    dosis_final = dosis_carbohidratos + correccion_glucosa
    
    # Validador Semáforo y Seguridad
    dosis_maxima_segura = heroe.peso * 0.5
    sobrepasa_dosis = dosis_final > dosis_maxima_segura
    
    alerta_tipo = "ninguna"
    if glucemia_actual < 70:
        alerta_tipo = "roja"
    elif glucemia_actual > 250:
        alerta_tipo = "amarilla"
    
    registro = RegistroGlucosa(
        heroe_id=heroe.id,
        glucemia_actual=glucemia_actual,
        carbohidratos=carbohidratos,
        dosis_calculada=round(dosis_final, 1),
        alerta=alerta_tipo
    )
    db.session.add(registro)
    db.session.commit()
    
    return jsonify({
        'dosis': round(dosis_final, 1),
        'sobrepasa_dosis': sobrepasa_dosis,
        'alerta': alerta_tipo
    })

@core_bp.route('/evaluacion_cdi', methods=['POST'])
@login_required
def evaluacion_cdi():
    heroe_id = request.form.get('heroe_id')
    puntaje = int(request.form.get('puntaje_cdi'))
    
    estado = "Riesgo de Sintomatología Depresiva" if puntaje >= 19 else "Estable"
    
    eva = Evaluacion(heroe_id=heroe_id, tipo='CDI', puntaje=puntaje, estado=estado, riesgo=(puntaje >= 19))
    db.session.add(eva)
    db.session.commit()
    
    return jsonify({'estado': estado})

@core_bp.route('/evaluacion_scir', methods=['POST'])
@login_required
def evaluacion_scir():
    heroe_id = request.form.get('heroe_id')
    puntaje = int(request.form.get('puntaje_scir'))
    
    riesgo = puntaje < 70
    estado = "Riesgo de Baja Adherencia" if riesgo else "Alta Adherencia"
    
    eva = Evaluacion(heroe_id=heroe_id, tipo='SCIR', puntaje=puntaje, estado=estado, riesgo=riesgo)
    db.session.add(eva)
    db.session.commit()
    
    return jsonify({'estado': estado})

@core_bp.route('/panel_especialista')
@login_required
def panel():
    if current_user.rol not in ['especialista', 'maestro']:
        return redirect(url_for('core.dashboard'))
        
    heroes = Heroe.query.all()
    pacientes_data = []
    
    for h in heroes:
        ult_gluco = RegistroGlucosa.query.filter_by(heroe_id=h.id).order_by(RegistroGlucosa.fecha.desc()).first()
        ult_cdi = Evaluacion.query.filter_by(heroe_id=h.id, tipo='CDI').order_by(Evaluacion.fecha.desc()).first()
        ult_scir = Evaluacion.query.filter_by(heroe_id=h.id, tipo='SCIR').order_by(Evaluacion.fecha.desc()).first()
        
        riesgo = False
        estado = "✅ Estable"
        
        if (ult_cdi and ult_cdi.riesgo) or (ult_scir and ult_scir.riesgo):
            riesgo = True
            estado = "⚠️ Crítico"
            
        pacientes_data.append({
            'id': h.codigo,
            'edad_peso': f"{h.edad} años / {h.peso}kg",
            'glucemia': f"{ult_gluco.glucemia_actual} mg/dL" if ult_gluco else "N/A",
            'adherencia': f"{ult_scir.puntaje} pts (Bajo)" if ult_scir and ult_scir.riesgo else (f"{ult_scir.puntaje} pts (Alta)" if ult_scir else "N/A"),
            'depresivo': f"{ult_cdi.puntaje} pts (Alto)" if ult_cdi and ult_cdi.riesgo else (f"{ult_cdi.puntaje} pts (Bajo)" if ult_cdi else "N/A"),
            'estado': estado,
            'riesgo': riesgo
        })
        
    return render_template('panel_especialista.html', pacientes=pacientes_data)
