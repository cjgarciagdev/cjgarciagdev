from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from models import db, Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        usuario = Usuario.query.filter_by(username=username, activo=True).first()
        if usuario and usuario.check_password(password):
            usuario.registrar_acceso()
            login_user(usuario, remember=True)
            
            if usuario.cambio_password_requerido:
                return redirect(url_for('auth.cambio_password_vista'))
                
            return redirect(url_for('index'))
        error = 'Usuario o contraseña incorrectos'
    return render_template('login.html', error=error)

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

@auth_bp.route('/api/auth/registro-parental', methods=['POST'])
def registro_parental():
    from flask import jsonify
    data = request.json or {}
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Datos incompletos'}), 400
    if Usuario.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El usuario ya existe'}), 400
    nuevo = Usuario(
        username=data['username'],
        rol='padre',
        nombre_completo=data.get('nombre', ''),
        cedula=data.get('cedula', ''),
        email=data.get('email', ''),
        consentimiento_aceptado=data.get('consentimiento', False)
    )
    nuevo.set_password(data['password'])
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({'status': 'success', 'message': '¡Cuenta creada! Ya puedes iniciar sesión.'})

@auth_bp.route('/api/auth/perfil', methods=['GET', 'PUT'])
@login_required
def perfil_usuario():
    from flask import jsonify
    if request.method == 'GET':
        return jsonify(current_user.to_dict())
    
    data = request.json or {}
    current_user.nombre_completo = data.get('nombre_completo', current_user.nombre_completo)
    current_user.cedula = data.get('cedula', current_user.cedula)
    current_user.email = data.get('email', current_user.email)
    current_user.telefono = data.get('telefono', current_user.telefono)
    
    if current_user.rol != 'padre':
        if not current_user.perfil:
            from models import PerfilProfesional
            current_user.perfil = PerfilProfesional(usuario_id=current_user.id)
            db.session.add(current_user.perfil)
        current_user.perfil.especialidad = data.get('especialidad', current_user.perfil.especialidad)
        current_user.perfil.consultorio = data.get('consultorio', current_user.perfil.consultorio)
    
    # Soporte para cambio de contraseña desde el perfil
    nueva_password = data.get('nueva_password', '').strip()
    if nueva_password:
        if len(nueva_password) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        current_user.set_password(nueva_password)
        current_user.cambio_password_requerido = False
    
    db.session.commit()
    return jsonify({'status': 'success', 'user': current_user.to_dict()})


@auth_bp.route('/api/auth/preguntas-seguridad', methods=['POST'])
@login_required
def guardar_preguntas_seguridad():
    """Permite al usuario autenticado configurar (o reemplazar) sus preguntas de seguridad."""
    from flask import jsonify
    from models import PreguntaSeguridad
    data = request.json or {}
    preguntas = data.get('preguntas', [])

    if len(preguntas) < 2:
        return jsonify({'error': 'Se requieren al menos 2 preguntas de seguridad'}), 400

    # Borrar las anteriores de este usuario
    PreguntaSeguridad.query.filter_by(usuario_id=current_user.id).delete()

    for item in preguntas[:2]:
        p = item.get('pregunta', '').strip()
        r = item.get('respuesta', '').strip()
        if p and r:
            ps = PreguntaSeguridad(usuario_id=current_user.id, pregunta=p)
            ps.set_respuesta(r)
            db.session.add(ps)

    db.session.commit()
    return jsonify({'status': 'success'})


# ─── SEGURIDAD AVANZADA (CHALLENGE/RESPONSE) ──────────────────────────────────

@auth_bp.route('/api/auth/recuperar-identificar', methods=['POST'])
def api_identificar_usuario():
    """Identifica al usuario y devuelve sus preguntas de seguridad (Patrón Agro-Master)"""
    from flask import jsonify
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    
    usuario = Usuario.query.filter_by(username=username, email=email, activo=True).first()
    if not usuario:
        return jsonify({'error': 'Usuario o correo no coinciden'}), 404
        
    from models import PreguntaSeguridad
    preguntas = PreguntaSeguridad.query.filter_by(usuario_id=usuario.id).all()
    
    if not preguntas:
        return jsonify({'error': 'No se han configurado preguntas de seguridad. Contacte al administrador.'}), 400

    # Retornar preguntas (sin respuestas)
    res_qs = [{'id': q.id, 'text': q.pregunta} for q in preguntas]
    return jsonify({'status': 'success', 'username': username, 'questions': res_qs})

@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def api_reset_password():
    """Restablece la contraseña tras verificar el desafío de seguridad"""
    from flask import jsonify
    data = request.json or {}
    username = data.get('username')
    answers = data.get('answers', {}) # {id: respuesta}
    nueva_pass = data.get('nueva_password')
    
    if not nueva_pass or len(nueva_pass) < 6:
        return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        
    usuario = Usuario.query.filter_by(username=username, activo=True).first()
    if not usuario: return jsonify({'error': 'Error de integridad'}), 404
    
    from models import PreguntaSeguridad
    for q_id, resp in answers.items():
        p = PreguntaSeguridad.query.get(q_id)
        if not p or p.usuario_id != usuario.id or not p.check_respuesta(resp):
            return jsonify({'error': 'Una o más respuestas son incorrectas'}), 403
            
    usuario.set_password(nueva_pass)
    usuario.cambio_password_requerido = False
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Contraseña actualizada correctamente'})

@auth_bp.route('/auth/cambio-obligatorio', methods=['GET', 'POST'])
@login_required
def cambio_password_vista():
    """Vista para cambio de contraseña obligatorio tras reset (Agro-Master UX)"""
    if not current_user.cambio_password_requerido:
        return redirect(url_for('index'))
    return render_template('change_password_required.html')
