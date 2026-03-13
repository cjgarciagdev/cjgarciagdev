# Manual Técnico del Desarrollador - GlucoAmigo 💻
> **DESARROLLADOR ÚNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: cjgarciag.dev@gmail.com
> **OBJETIVO DEL DOCUMENTO:** Guiar al ingeniero de software en la comprensión, mantenimiento y extensión de la arquitectura del sistema.

---

## 🛠️ 1. Arquitectura de Datos: SQLite + SQLAlchemy

### 1.1 Persistencia Local
**¿Por qué?**
En entornos de salud, la conectividad puede ser intermitente. Necesitamos una base de datos que funcione sin internet.

**¿Cómo?**
Se utiliza **SQLite** como base de datos de archivo único en desarrollo.
```python
# En app.py - Configuración de base de datos
db_uri = 'sqlite:///' + os.path.join(basedir, 'instance', 'glucoamigo.db')
```

### 1.2 Mapeo Objeto-Relacional (ORM)
**¿Por qué?**
Escribir SQL crudo es propenso a errores. Necesitamos una capa que traduzca clases de Python a tablas.

**¿Cómo?**
Implementando **Flask-SQLAlchemy**.
```python
from models import db, Heroe
# Consulta segura con métodos de Python
heroes = Heroe.query.filter_by(activo=True).all()
```

### 1.3 Producción (PostgreSQL)
El sistema puede usar PostgreSQL en producción (Render, Neon, etc.) sin cambios en el código de los modelos.

---

## 📂 2. Patrones de Diseño Utilizados

### 2.1 Factory Pattern (App Discovery)
**¿Por qué?**
Permite configurar la aplicación de forma dinámica (test vs producción).

**¿Cómo?**
```python
# app.py
def create_app():
    app = Flask(__name__)
    # Configuración...
    register_blueprints(app)
    return app, socketio
```

### 2.2 Patrón Service-Repository
**¿Por qué?**
La lógica de negocio no debe estar en las rutas para evitar archivos gigantes.

**¿Cómo?**
Separando la lógica en la carpeta `/services`:
- `user_service.py`: Gestión de usuarios
- `alerta_tiempo_real.py`: Sistema de alertas
- `export_service.py`: Generación de reportes
- `permissions.py`: Control de acceso

Las rutas solo reciben la petición, llaman al servicio y devuelven el resultado.

---

## 🔐 3. Seguridad y Autenticación

### 3.1 Flask-Login
**¿Cómo?**
```python
from flask_login import LoginManager, login_required, current_user

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))
```

### 3.2 Sesiones Seguras
**¿Cómo?**
```python
# Cookies seguras
app.config['SESSION_COOKIE_SECURE'] = True  # Solo HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Protegido contra XSS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
```

### 3.3 Contraseñas con Bcrypt
**¿Cómo?**
```python
from werkzeug.security import generate_password_hash, check_password_hash

# En el modelo Usuario
def set_password(self, pwd):
    self.password_hash = generate_password_hash(pwd)

def check_password(self, pwd):
    return check_password_hash(self.password_hash, pwd)
```

---

## 📡 4. Sistema de Alertas en Tiempo Real

### 4.1 Socket.IO
**¿Por qué?**
Necesitamos notificaciones instantáneas cuando la glucosa esté en niveles危险.

**¿Cómo?**
```python
from flask_socketio import SocketIO, emit

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

@socketio.on('connect')
def handle_connect():
    emit('conectado', {'status': 'ok'})
```

### 4.2 Rooms (Salas)
**¿Cómo?**
```python
# Unirse a sala privada del usuario
join_room(f'usuario_{user_id}')

# Unirse a sala de un héroe
join_room(f'heroe_{heroe_id}')

# Emitir a sala específica
socketio.emit('alerta_glucosa', data, room=f'heroe_{heroe_id}')
```

### 4.3 Monitor en Background
**¿Por qué?**
Verificar niveles de glucosa periódicamente sin esperar una acción del usuario.

**¿Cómo?**
```python
class MonitorGlucosa(threading.Thread):
    def run(self):
        while self.running:
            # Verificar lecturas de los últimos 15 minutos
            lecturas = RegistroGlucosa.query.filter(...).all()
            for lectura in lecturas:
                if glucemia < UMBRAL_HIPOGLUCEMIA:
                    enviar_alerta_hipoglucemia(...)
            time.sleep(30)  # Verificar cada 30 segundos
```

---

## 📊 5. Exportación de Reportes

### 5.1 Excel con XlsxWriter
**¿Por qué?**
Generar archivos Excel profesionales con formato condicional.

**¿Cómo?**
```python
import xlsxwriter

output = io.BytesIO()
wb = xlsxwriter.Workbook(output, {'in_memory': True})

# Formato con colores
fmt_alert = wb.add_format({
    'bg_color': '#fef2f2',
    'font_color': '#ef4444'
})

# Escribir celda con formato condicional
if glucemia < 70:
    ws.write(row, col, glucemia, fmt_alert)
```

### 5.2 PDF con ReportLab
**¿Por qué?**
Crear documentos PDF con posicionamiento preciso.

**¿Cómo?**
```python
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm

c = canvas.Canvas(output, pagesize=A4)
c.drawString(20*mm, y, "Texto en posición exacta")
```

---

## 🎨 6. Frontend SPA (Single Page Application)

### 6.1 Estructura
```
static/js/
├── app.js           # Lógica principal
├── dark_mode.js     # Tema oscuro
└── modules/         # Módulos adicionales

templates/
├── index.html       # Contenedor maestro
├── portal_especialista.html
├── portal_representante.html
└── portal_nino.html
```

### 6.2 Navegación SPA
**¿Cómo?**
```javascript
// Cargar sección sin recarga
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    // Mostrar sección seleccionada
    document.getElementById(sectionId).style.display = 'block';
    // Cargar datos
    loadSectionData(sectionId);
}
```

### 6.3 Integración Socket.IO Client
```javascript
const socket = io();

// Conectarse a sala
socket.emit('unirse_usuario', {user_id: currentUserId});

// Recibir alertas
socket.on('alerta_glucosa', function(data) {
    showNotification(data.mensaje, data.severidad);
});
```

---

## 🔧 7. Extender el Sistema

### 7.1 Agregar un nuevo modelo
1. Definir el modelo en `models.py`:
```python
class NuevoModelo(db.Model):
    __tablename__ = 'nuevo_modelo'
    id = db.Column(db.Integer, primary_key=True)
    campo = db.Column(db.String(100))
```

2. Crear el servicio en `services/nuevo_service.py`:
```python
def funcion_del_servicio(parametros):
    # Lógica de negocio
    return resultado
```

3. Crear la ruta en `routes/nueva_ruta.py`:
```python
nueva_ruta_bp = Blueprint('nueva', __name__)

@nueva_ruta_bp.route('/api/nueva', methods=['GET'])
@login_required
def funcion_ruta():
    return jsonify(resultado)
```

4. Registrar el Blueprint en `app.py`:
```python
from routes.nueva_ruta import nueva_ruta_bp
app.register_blueprint(nueva_ruta_bp)
```

### 7.2 Agregar nuevo campo a usuario
1. Agregar columna en `models.py`:
```python
nuevo_campo = db.Column(db.String(100))
```

2. Actualizar método `to_dict()`:
```python
def to_dict(self):
    d = super().to_dict()
    d['nuevo_campo'] = self.nuevo_campo
    return d
```

### 7.3 Agregar nuevo rol
1. Agregar validación en `services/permissions.py`:
```python
def verificar_permiso(user, permiso):
    if user.rol == 'nuevo_rol':
        return permisos_nuevo_rol.get(permiso, False)
```

---

## 🧪 8. Pruebas y Debug

### 8.1 Iniciar en modo desarrollo
```bash
# Activar entorno virtual
cd GlucoAmigo
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Ejecutar
python server.py
# o
flask run
```

### 8.2 Variables de entorno
```bash
# .env
SECRET_KEY=glucoamigo-secret-key
FLASK_ENV=development
DATABASE_URL=sqlite:///instance/glucoamigo.db
```

### 8.3 Dependencias
```
Flask>=2.3
Flask-SQLAlchemy>=3.0
Flask-Login>=0.6
Flask-SocketIO>=5.0
SQLAlchemy>=2.0
Werkzeug>=2.3
python-socketio>=5.0
xlsxwriter>=3.0
reportlab>=4.0
python-dotenv>=1.0
```

---

## 🚀 9. Despliegue

### 9.1 Local (Producción ligera)
```bash
pip install -r requirements.txt
python server.py
```

### 9.2 Render ( cloud)
1. Conectar repositorio Git
2. Configurar variables:
   - `RENDER`: true
   - `DATABASE_URL`: (PostgreSQL de Render)
3. Build command: `pip install -r requirements.txt`
4. Start command: `python server.py`

### 9.3 Docker (Opcional)
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "server.py"]
```

---

## 📚 10. Estructura de Archivos

```
GlucoAmigo/
├── app.py                    # Aplicación principal
├── server.py                 # Entry point
├── models.py                 # Modelos de datos
├── models_extended.py        # Modelos extendidos
├── routes/                   # Rutas/Endpoints
│   ├── auth_routes.py       # Autenticación
│   ├── panel_routes.py      # Panel especialista
│   ├── comida_routes.py     # Gestión comidas
│   ├── dosis_routes.py      # Cálculo dosis
│   └── ...
├── services/                # Lógica de negocio
│   ├── user_service.py
│   ├── alerta_tiempo_real.py
│   ├── export_service.py
│   └── ...
├── templates/               # Plantillas HTML
│   ├── login.html
│   ├── index.html
│   └── ...
├── static/                  # Archivos estáticos
│   ├── js/
│   │   └── app.js
│   └── css/
│       └── styles.css
├── utils/                   # Utilidades
│   └── password_validator.py
└── docs/                    # Documentación
    ├── ARQUITECTURA.md
    ├── MANUAL_USUARIO.md
    ├── MANUAL_DESARROLLADOR.md
    └── NOTAS_CODIGO.md
```

---

> 📝 **Nota:** El sistema está optimizado para Python 3.10+ y utiliza gestión de entornos virtuales (`venv`) para el control de dependencias.

---

> 👨‍💻 **Desarrollado por:** Cristian J Garcia | CI: 32.170.910 | Email: cjgarciag.dev@gmail.com
