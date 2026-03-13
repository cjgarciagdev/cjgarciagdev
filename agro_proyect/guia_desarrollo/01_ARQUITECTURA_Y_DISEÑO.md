# 🏛️ Arquitectura y Diseño del Sistema

## Agro-Master - Documentación Técnica

---

## 📐 Arquitectura General

### Patrón MVC Adaptado

Agro-Master implementa una variante del patrón **MVC (Model-View-Controller)** adaptada para aplicaciones web modernas:

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │   HTML     │  │    CSS      │  │    JavaScript        │  │
│  │ (Templates)│  │  (Styles)   │  │   (SPA Logic)        │  │
│  └────────────┘  └─────────────┘  └──────────────────────┘  │
│                         VIEW                                 │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTP/AJAX (JSON)
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                      SERVIDOR FLASK                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               CONTROLLER LAYER                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │   │
│  │  │   Routes    │  │  Blueprints │  │  Decorators  │ │   │
│  │  │  (app.py)   │  │  (routes/)  │  │   (utils/)   │ │   │
│  │  └─────────────┘  └─────────────┘  └──────────────┘ │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │              SERVICE LAYER (BUSINESS LOGIC)          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │ Animal       │  │ Genealogia   │  │ Export    │  │   │
│  │  │ Service      │  │ Service      │  │ Service   │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │               MODEL LAYER (DATA)                     │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │           SQLAlchemy ORM Models                 │ │   │
│  │  │  (Ganado, HistorialMedico, PlanNutricional...)  │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │ SQL Queries
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              BASE DE DATOS SQLITE (ganado.db)                │
│  Tablas: ganado, historial_medico, plan_nutricional, etc.   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Principios de Diseño Aplicados

### 1. **Separación de Responsabilidades (SoC)**

Cada capa tiene una responsabilidad única:

- **Vista (Frontend):** Presentación y UX
- **Controlador (Routes):** Manejo de requests HTTP
- **Servicio (Services):** Lógica de negocio
- **Modelo (Models):** Persistencia de datos

### 2. **Single Responsibility Principle (SRP)**

Cada módulo/clase tiene una única razón para cambiar:

```python
# ✅ CORRECTO: Responsabilidad única
def calcular_nutricion(peso, edad, especie):
    """Solo calcula requerimientos nutricionales"""
    # lógica de cálculo
    return nutricion_dict

# ❌ INCORRECTO: Múltiples responsabilidades
def procesar_animal(data):
    """Hace demasiadas cosas"""
    # validar, calcular, guardar, notificar, exportar...
```

### 3. **DRY (Don't Repeat Yourself)**

Código reutilizable en servicios y utilidades:

```javascript
// Función reutilizable para descargas
function downloadFileWithLoading(url, button, filenamePrefix) {
    // Una sola implementación usada en todas las exportaciones
}
```

### 4. **Open/Closed Principle**

Abierto para extensión, cerrado para modificación:

```python
# Fácil agregar nuevas especies sin modificar código existente
ESPECIES_CONFIG = {
    'Bovino': {...},
    'Ovino': {...},
    'Nuevo_Animal': {...}  # Extensión sin modificar existente
}
```

---

## 🔄 Flujo de Datos

### Request-Response Cycle

```
┌─────────────────────────────────────────────────────────────┐
│  1. USUARIO HACE CLIC                                       │
│     onclick="exportPDF()"                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. JAVASCRIPT ENVÍA REQUEST                                │
│     fetch('/api/export/pdf/ficha/123')                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP GET
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. FLASK ROUTE RECIBE REQUEST                              │
│     @export_bp.route('/api/export/pdf/ficha/<int:id>')      │
│     def export_pdf_ficha(id):                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. SERVICIO PROCESA LÓGICA                                 │
│     exportador = ExportadorPDF(...)                         │
│     animal = obtener_animal(id)  # Consulta DB             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  5. MODELO CONSULTA BASE DE DATOS                           │
│     Ganado.query.get(id)                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  6. RESPONSE CON ARCHIVO                                    │
│     return send_file(pdf_buffer, as_attachment=True)        │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP Response 200 + Binary
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  7. JAVASCRIPT PROCESA DESCARGA                             │
│     const blob = await response.blob()                      │
│     a.download = filename; a.click()                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Patrones de Diseño Implementados

### 1. **Blueprint Pattern (Flask)**

Organización modular de rutas:

```python
# routes/animal_routes.py
animal_bp = Blueprint('animal', __name__)

@animal_bp.route('/api/ganado')
def get_all_animals():
    return jsonify(obtener_todos())

# app.py
app.register_blueprint(animal_bp)
app.register_blueprint(export_bp)
app.register_blueprint(nutricion_bp)
```

**Ventajas:**
- Código organizado por dominio
- Fácil mantenimiento
- Reutilización de blueprints

### 2. **Repository Pattern**

Funciones centralizadas para acceso a datos:

```python
# models.py
def obtener_todos():
    """Repositorio central para obtener todos los animales"""
    animales = Ganado.query.all()
    return [a.to_dict() for a in animales]

def obtener_animal(id):
    """Repositorio para obtener un animal específico"""
    animal = Ganado.query.get(id)
    return animal.to_dict() if animal else None
```

### 3. **Service Layer Pattern**

Lógica de negocio separada de rutas:

```python
# services/animal_service.py
def calcular_nutricion(peso, edad, especie, raza=None, sexo=None, estado=None):
    """
    Servicio que encapsula lógica nutricional compleja
    """
    # Cálculos basados en peso metabólico
    peso_metabolico = peso ** 0.75
    
    # Factores de ajuste
    factor_edad = 1.2 if edad < 6 else 1.0
    factor_especie = FACTORES_ESPECIE[especie]
    
    # Retorna objeto completo
    return {
        'forraje_verde': round(forraje, 2),
        'concentrado': round(concentrado, 2),
        'suplementos': suplementos_list,
        # ... más campos
    }
```

### 4. **Decorator Pattern**

Control de acceso mediante decoradores:

```python
# utils/decorators.py
def require_permission(permiso):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return redirect(url_for('login'))
            usuario = Usuario.query.get(session['user_id'])
            if not verificar_permiso(usuario, permiso):
                return jsonify({'error': 'Permiso denegado'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Uso
@export_bp.route('/api/export/pdf/ficha/<int:id>')
@require_permission('exportar')
def export_pdf_ficha(id):
    # ...
```

### 5. **Factory Pattern**

Creación de exportadores:

```python
# services/export_service.py
class ExportadorPDF:
    def __init__(self, titulo, descripcion=""):
        self.pdf = FPDF()
        self.pdf.add_page()
        self._configurar_documento(titulo, descripcion)
    
    def agregar_tabla(self, headers, datos):
        # ...
    
    def agregar_estadisticas(self, stats):
        # ...
    
    def obtener_bytes(self):
        # ...

# Uso
exportador = ExportadorPDF("Ficha Técnica", "Descripción")
exportador.agregar_tabla(headers, datos)
output = exportador.obtener_bytes()
```

### 6. **Observer Pattern (Simplificado)**

Sistema de notificaciones:

```javascript
// agro_notify.js
class AgroNotify {
    static show(mensaje, titulo, tipo) {
        // Notifica a los "observers" (usuarios)
        const notification = this.createNotification(mensaje, titulo, tipo);
        this.observers.push(notification);
        this.render();
    }
}
```

### 7. **Singleton Pattern (Flask App)**

Instancia única de la aplicación:

```python
# app.py
app = Flask(__name__)
db = SQLAlchemy(app)

# Solo una instancia de app y db en toda la aplicación
```

---

## 🎨 Arquitectura Frontend (SPA)

### Single Page Application

```
┌─────────────────────────────────────────────────────────┐
│              index.html (Único HTML)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  <div id="sec-dashboard" class="content-section">  │ │
│  │  <div id="sec-ganado" class="content-section">     │ │
│  │  <div id="sec-salud" class="content-section">      │ │
│  │  <div id="sec-nutricion" class="content-section">  │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│           app.js (Orquestador Principal)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  function showSection(id) {                        │ │
│  │    // Ocultar todas las secciones                  │ │
│  │    // Mostrar solo la solicitada                   │ │
│  │    // Cargar datos dinámicamente                   │ │
│  │  }                                                  │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬────────────┐
        ▼           ▼           ▼            ▼
┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐
│ genealogia│  │ grafos_  │  │ agro_   │  │ app-     │
│   .js    │  │ complex  │  │ notify  │  │ advanced │
│          │  │   .js    │  │   .js   │  │   .js    │
└──────────┘  └──────────┘  └─────────┘  └──────────┘
```

### Ventajas del SPA

1. **Sin Recargas:** Navegación fluida
2. **Carga Rápida:** Recursos cacheados
3. **UX Moderna:** Transiciones suaves
4. **API-Driven:** Separación cliente-servidor

---

## 🗄️ Arquitectura de Base de Datos

### Modelo Relacional Normalizado

```
┌─────────────────────────────────────────────────┐
│                   GANADO (Core)                 │
│  - id (PK)                                      │
│  - especie, raza, sexo                          │
│  - fecha_nacimiento, peso, estado               │
└─────────────┬───────────────────────────────────┘
              │
              │ 1:N Relaciones
      ┌───────┴──────┬──────────┬──────────┬──────────┐
      ▼              ▼          ▼          ▼          ▼
┌──────────┐  ┌──────────┐  ┌──────┐  ┌──────┐  ┌──────┐
│Historial │  │  Plan    │  │Hist. │  │Exped.│  │Pesos │
│ Médico   │  │Nutric.   │  │Peso  │  │Médico│  │Hist. │
└──────────┘  └──────────┘  └──────┘  └──────┘  └──────┘
```

**Normalización:** 3NF (Tercera Forma Normal)
- Sin redundancia de datos
- Integridad referencial con foreign keys
- Cascadas de eliminación configuradas

---

## 🔐 Arquitectura de Seguridad

### Capas de Seguridad

```
┌─────────────────────────────────────────────┐
│  1. AUTENTICACIÓN                           │
│     - Login con usuario/contraseña          │
│     - Hash BCrypt                           │
│     - Sesiones Flask                        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  2. AUTORIZACIÓN                            │
│     - Decoradores @require_permission       │
│     - Roles de usuario                      │
│     - Permisos granulares                   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  3. VALIDACIÓN                              │
│     - Cliente: JavaScript                   │
│     - Servidor: Python                      │
│     - Tipos de datos forzados               │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  4. PROTECCIÓN                              │
│     - CSRF tokens (Flask-WTF)               │
│     - SQL Injection (SQLAlchemy ORM)        │
│     - XSS (Template escaping)               │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  5. SEGURIDAD DINÁMICA (ACTION CHALLENGE)    │
│     - Modal de re-autenticación en caliente │
│     - Verificación de permisos en tiempo real│
│     - Autorización para acciones críticas   │
└─────────────────────────────────────────────┘
```

---

## 📊 Arquitectura de Datos

### Flujo de Transformación de Datos

```
┌──────────────────────────────────────────────────┐
│  BASE DE DATOS (SQLite)                          │
│  Datos persistidos en formato tabular           │
└────────────────┬─────────────────────────────────┘
                 │ SQLAlchemy ORM
                 ▼
┌──────────────────────────────────────────────────┐
│  OBJETOS PYTHON (Models)                         │
│  animal = Ganado.query.get(1)                    │
│  animal.especie = 'Bovino'                       │
└────────────────┬─────────────────────────────────┘
                 │ .to_dict()
                 ▼
┌──────────────────────────────────────────────────┐
│  DICCIONARIOS PYTHON                             │
│  {'id': 1, 'especie': 'Bovino', ...}             │
└────────────────┬─────────────────────────────────┘
                 │ jsonify()
                 ▼
┌──────────────────────────────────────────────────┐
│  JSON (API Response)                             │
│  HTTP 200 + {"status":"success","data":{...}}    │
└────────────────┬─────────────────────────────────┘
                 │ fetch() / axios
                 ▼
┌──────────────────────────────────────────────────┐
│  OBJETOS JAVASCRIPT                              │
│  const animal = await res.json()                 │
│  console.log(animal.especie) // 'Bovino'         │
└────────────────┬─────────────────────────────────┘
                 │ DOM Manipulation
                 ▼
┌──────────────────────────────────────────────────┐
│  HTML RENDERIZADO                                │
│  <td>${animal.especie}</td>                      │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Decisiones Técnicas Clave

### ¿Por qué Flask?

✅ **Microframework flexible**  
✅ **Curva de aprendizaje suave**  
✅ **Excelente para APIs REST**  
✅ **Gran ecosistema de extensiones**  
✅ **Fácil de empaquetar (.exe)**  

### ¿Por qué SQLite?

✅ **Sin servidor separado**  
✅ **Base de datos embebida**  
✅ **Portátil (un solo archivo)**  
✅ **Suficiente para aplicaciones pequeñas/medianas**  
✅ **Fácil backup (copiar .db)**  

### ¿Por qué Vanilla JavaScript?

✅ **Sin dependencias pesadas**  
✅ **Carga rápida**  
✅ **Control total**  
✅ **Mejor para aprender fundamentos**  
✅ **Compatible con todos los navegadores modernos**  

---

## 🔧 Arquitectura de Módulos

Cada módulo sigue esta estructura:

```
MÓDULO_X/
├── Backend
│   ├── routes/modulo_x_routes.py      # Endpoints HTTP
│   ├── services/modulo_x_service.py   # Lógica de negocio
│   └── models.py (sección)            # Modelo de datos
├── Frontend
│   ├── static/js/modulo_x.js          # Lógica cliente
│   ├── templates/modulo_x.html        # Vista (opcional)
│   └── static/css/modulo_x.css        # Estilos (opcional)
└── Tests
    └── test_modulo_x.py               # Pruebas unitarias
```

---

## 📈 Escalabilidad

El sistema está diseñado para escalar de estas formas:

1. **Migración a PostgreSQL** (cambio simple de config)
2. **Separación de frontend** (Vue/React consumiendo API)
3. **Microservicios** (separar módulos en servicios independientes)
4. **Cache Layer** (Redis para consultas frecuentes)
5. **Load Balancer** (Nginx para múltiples instancias)

---

## 🎯 Próximo Documento

👉 **02_INSTALACION_DESDE_CERO.md** - Instalación paso a paso del sistema
