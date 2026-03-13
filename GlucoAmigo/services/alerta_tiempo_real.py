"""
GlucoAmigo - Servicio de Alertas en Tiempo Real
=================================================
WebSockets con Socket.IO para alertas instantáneas de hipoglucemia
Sistema de notificaciones push y email para representantes
DESARROLLADOR: Cristian J Garcia
CI: 32.170.910
Email: cjgarciag.dev@gmail.com
"""

from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request, session
from datetime import datetime
import threading
import json

# Inicializar SocketIO (se configurará en app.py)
socketio = None

# Rooms por usuario para notificaciones privadas
USERS_ROOM = 'usuarios'
HEROES_ROOM = 'heroes'

# Configuración de umbrales clínicos
UMBRALES_GLUCEMIA = {
    'hipoglucemia_severa': 54,      # mg/dL - Emergencia
    'hipoglucemia': 70,             # mg/dL - Alerta baja
    'rango_bajo': 80,               # mg/dL - Precaución baja
    'rango_objetivo_min': 80,       # mg/dL - Objetivo mínimo
    'rango_objetivo_max': 180,      # mg/dL - Objetivo máximo
    'rango_alto': 250,              # mg/dL - Alerta alta
    'hiperglucemia_severa': 400,    # mg/dL - Emergencia
}

# Caché de conexiones activas
conexiones_activas = {}


def init_socketio(app):
    """Inicializa SocketIO con la app Flask"""
    global socketio
    # Usar threading en lugar de eventlet por compatibilidad con Python 3.14
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')
    registrar_handlers(socketio)
    return socketio


def registrar_handlers(socket_io):
    """Registra todos los event handlers de Socket.IO"""
    
    @socket_io.on('connect')
    def handle_connect():
        """Maneja nueva conexión"""
        print(f'[SocketIO] Cliente conectado: {request.sid}')
        emit('conectado', {'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})
    
    @socket_io.on('disconnect')
    def handle_disconnect():
        """Maneja desconexión"""
        print(f'[SocketIO] Cliente desconectado: {request.sid}')
        # Limpiar de conexiones activas
        for user_id in list(conexiones_activas.keys()):
            if request.sid in conexiones_activas.get(user_id, []):
                conexiones_activas[user_id].remove(request.sid)
    
    @socket_io.on('unirse_usuario')
    def handle_join_user(data):
        """Usuario se une a su sala privada"""
        user_id = data.get('user_id')
        if user_id:
            room = f'usuario_{user_id}'
            join_room(room)
            if user_id not in conexiones_activas:
                conexiones_activas[user_id] = []
            conexiones_activas[user_id].append(request.sid)
            print(f'[SocketIO] Usuario {user_id} unido a sala {room}')
            emit('unido_sala', {'room': room, 'user_id': user_id})
    
    @socket_io.on('unirse_heroe')
    def handle_join_heroe(data):
        """Representante se une a la sala de un héroe"""
        heroe_id = data.get('heroe_id')
        if heroe_id:
            room = f'heroe_{heroe_id}'
            join_room(room)
            print(f'[SocketIO] Cliente unido a sala héroe {heroe_id}')
            emit('unido_sala', {'room': room, 'heroe_id': heroe_id})
    
    @socket_io.on('solicitar_estado')
    def handle_request_state():
        """Solicita el estado actual de conexiones"""
        emit('estado_conexiones', {
            'conectados': len(conexiones_activas),
            'usuarios': list(conexiones_activas.keys()),
            'timestamp': datetime.utcnow().isoformat()
        })
    
    @socket_io.on('ping')
    def handle_ping():
        """Heartbeat para mantener conexión activa"""
        emit('pong', {'timestamp': datetime.utcnow().isoformat()})


def enviar_alerta_hipoglucemia(heroe_id, glucemia_actual, representa_id=None):
    """
    Envía alerta de hipoglucemia a todos los suscriptores relevantes.
    
    Args:
        heroe_id: ID del niño/héroe
        glucemia_actual: Nivel de glucosa actual en mg/dL
        representa_id: ID del representante (opcional)
    """
    if socketio is None:
        print('[SocketIO] SocketIO no inicializado')
        return
    
    # Determinar severidad
    if glucemia_actual < UMBRALES_GLUCEMIA['hipoglucemia_severa']:
        severidad = 'emergencia'
        mensaje = f'🚨 EMERGENCIA: Hipoglucemia SEVERA ({glucemia_actual} mg/dL)'
        icono = 'fa-exclamation-triangle'
        color = '#ef4444'
    elif glucemia_actual < UMBRALES_GLUCEMIA['hipoglucemia']:
        severidad = 'alerta'
        mensaje = f'⚠️ Alerta: Hipoglucemia detectada ({glucemia_actual} mg/dL)'
        icono = 'fa-exclamation-circle'
        color = '#f59e0b'
    else:
        severidad = 'precaucion'
        mensaje = f'💡 Precaución: Glucosa baja ({glucemia_actual} mg/dL)'
        icono = 'fa-info-circle'
        color = '#3b82f6'
    
    # Datos de la alerta
    alerta_data = {
        'tipo': 'hipoglucemia',
        'severidad': severidad,
        'heroe_id': heroe_id,
        'glucemia_actual': glucemia_actual,
        'mensaje': mensaje,
        'icono': icono,
        'color': color,
        'timestamp': datetime.utcnow().isoformat(),
        'recomendacion': obtener_recomendacion(severidad, glucemia_actual)
    }
    
    # Enviar a sala del héroe
    room_heroe = f'heroe_{heroe_id}'
    socketio.emit('alerta_glucosa', alerta_data, room=room_heroe)
    print(f'[SocketIO] Alerta hipoglucemia enviada a sala {room_heroe}')
    
    # Enviar a sala del representante si se conoce
    if representa_id:
        room_usuario = f'usuario_{representa_id}'
        socketio.emit('alerta_glucosa', alerta_data, room=room_usuario)
    
    # Broadcast a sala general de héroes
    socketio.emit('alerta_hipoglucemia', alerta_data, room=HEROES_ROOM)


def enviar_alerta_hiperglucemia(heroe_id, glucemia_actual, representa_id=None):
    """Envía alerta de hiperglucemia"""
    if socketio is None:
        return
    
    if glucemia_actual > UMBRALES_GLUCEMIA['hiperglucemia_severa']:
        severidad = 'emergencia'
        mensaje = f'🚨 EMERGENCIA: Hiperglucemia SEVERA ({glucemia_actual} mg/dL)'
        icono = 'fa-exclamation-triangle'
        color = '#dc2626'
    elif glucemia_actual > UMBRALES_GLUCEMIA['rango_alto']:
        severidad = 'alerta'
        mensaje = f'⚠️ Alerta: Hiperglucemia detectada ({glucemia_actual} mg/dL)'
        icono = 'fa-exclamation-circle'
        color = '#f59e0b'
    else:
        severidad = 'precaucion'
        mensaje = f'💡 Precaución: Glucosa elevada ({glucemia_actual} mg/dL)'
        icono = 'fa-info-circle'
        color = '#eab308'
    
    alerta_data = {
        'tipo': 'hiperglucemia',
        'severidad': severidad,
        'heroe_id': heroe_id,
        'glucemia_actual': glucemia_actual,
        'mensaje': mensaje,
        'icono': icono,
        'color': color,
        'timestamp': datetime.utcnow().isoformat(),
        'recomendacion': obtener_recomendacion(severidad, glucemia_actual, es_hipertension=True)
    }
    
    room_heroe = f'heroe_{heroe_id}'
    socketio.emit('alerta_glucosa', alerta_data, room=room_heroe)
    
    if representa_id:
        socketio.emit('alerta_glucosa', alerta_data, room=f'usuario_{representa_id}')


def obtener_recomendacion(severidad, glucemia, es_hipertension=False):
    """Obtiene recomendaciones clínicas basadas en el nivel de glucosa"""
    if es_hipertension:
        if glucemia > 400:
            return "Administrar insulina de acción rápida según esquema. Contactar al especialista inmediatamente."
        elif glucemia > 250:
            return "Verificar cetonas. Aumentar hidratación. Considerar corrección con insulina."
        else:
            return "Monitorear cada 2 horas. Mantener hidratación adecuada."
    else:
        if glucemia < 54:
            return "EMERGENCIA: Administrar glucagón inmediatamente. Llamar a emergencias."
        elif glucemia < 70:
            return "Regla 15:15 - Dar 15g de carbohidratos de acción rápida. Reevaluar en 15 min."
        else:
            return "Monitorear más frecuentemente. Considerar merienda si hay tendencia a baja."


def enviar_notificacion_general(tipo, titulo, mensaje, datos=None):
    """Envía notificación general a todos los clientes conectados"""
    if socketio is None:
        return
    
    notificacion = {
        'tipo': tipo,
        'titulo': titulo,
        'mensaje': mensaje,
        'datos': datos or {},
        'timestamp': datetime.utcnow().isoformat()
    }
    
    socketio.emit('notificacion', notificacion)


def broadcast_actualizacion_glucosa(heroe_id, datos_glucosa):
    """Broadcast de actualización de glucosa en tiempo real"""
    if socketio is None:
        return
    
    socketio.emit('glucosa_actualizada', {
        'heroe_id': heroe_id,
        'datos': datos_glucosa,
        'timestamp': datetime.utcnow().isoformat()
    }, room=f'heroe_{heroe_id}')


# ============================================================
# HILO BACKGROUND PARA MONITOREO
# ============================================================

class MonitorGlucosa(threading.Thread):
    """Hilo en background que monitorea niveles de glucosa"""
    
    def __init__(self, app):
        super().__init__()
        self.app = app
        self.daemon = True
        self.running = False
    
    def run(self):
        """Bucle principal de monitoreo"""
        self.running = True
        print('[MonitorGlucosa] Hilo de monitoreo iniciado')
        
        while self.running:
            try:
                with self.app.app_context():
                    from models import RegistroGlucosa, Heroe
                    from datetime import timedelta
                    
                    # Obtener lecturas de los últimos 15 minutos
                    desde = datetime.utcnow() - timedelta(minutes=15)
                    lecturas = RegistroGlucosa.query.filter(
                        RegistroGlucosa.fecha >= desde,
                        RegistroGlucosa.alerta_disparada == False
                    ).all()
                    
                    for lectura in lecturas:
                        heroe = Heroe.query.get(lectura.heroe_id)
                        if not heroe:
                            continue
                        
                        glucemia = lectura.glucemia_actual
                        
                        # Verificar hipoglucemia
                        if glucemia < UMBRALES_GLUCEMIA['hipoglucemia']:
                            enviar_alerta_hipoglucemia(
                                heroe_id=lectura.heroe_id,
                                glucemia_actual=glucemia,
                                representa_id=heroe.padre_id
                            )
                            lectura.alerta_disparada = True
                        
                        # Verificar hiperglucemia severa
                        elif glucemia > UMBRALES_GLUCEMIA['rango_alto']:
                            enviar_alerta_hiperglucemia(
                                heroe_id=lectura.heroe_id,
                                glucemia_actual=glucemia,
                                representa_id=heroe.padre_id
                            )
                            lectura.alerta_disparada = True
                    
                    from models import db
                    db.session.commit()
                    
            except Exception as e:
                print(f'[MonitorGlucosa] Error en monitoreo: {e}')
            
            # Dormir 30 segundos entre chequeos
            import time
            time.sleep(30)
    
    def stop(self):
        """Detener el hilo de monitoreo"""
        self.running = False


# ============================================================
# INTEGRACIÓN CON FLASK
# ============================================================

def configurar_alertas_en_app(app):
    """Configura SocketIO y inicia el monitor de glucosa"""
    global socketio
    
    # Inicializar SocketIO
    socketio = init_socketio(app)
    
    # Iniciar hilo de monitoreo en background
    monitor = MonitorGlucosa(app)
    monitor.start()
    
    print('[Alertas] Sistema de alertas en tiempo real configurado')
    return socketio
