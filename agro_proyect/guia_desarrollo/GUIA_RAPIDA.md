# 📘 Guía Rápida de Desarrollo - Agro-Master

## Resumen Ejecutivo para Desarrolladores

---

## 🎯 Objetivo de Esta Guía

Este documento proporciona un **mapa completo** para replicar, entender y extender el sistema Agro-Master. Está diseñado para que cualquier desarrollador Python/JavaScript pueda:

1. **Instalar** el proyecto desde cero
2. **Comprender** la arquitectura y decisiones técnicas
3. **Modificar** o extender funcionalidades
4. **Mantener** y depurar el sistema

---

## 🏗️ Stack Tecnológico Resumido

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| **Backend** | Python | 3.10+ | Lenguaje principal |
| **Framework Web** | Flask | 3.0.0 | Servidor HTTP y rutas API |
| **ORM** | SQLAlchemy | 3.1.1 | Mapeo objeto-relacional |
| **Base de Datos** | SQLite | 3 | Almacenamiento embebido |
| **Exportación PDF** | FPDF | 1.7.2 | Generación de reportes PDF |
| **Gráficas** | Matplotlib | 3.8.2 | Visualizaciones científicas |
| **Export Excel** | OpenPyXL | 3.1.2 | Archivos Excel (.xlsx) |
| **Frontend** | JavaScript | ES6+ | Lógica cliente Vanilla JS |
| **Gráficas Web** | Chart.js | 4.x | Dashboards interactivos |
| **Grafos** | Vis.js | 9.x | Árboles genealógicos |
| **Estilos** | CSS3 | - | Diseño responsive |
| **Iconos** | Font Awesome | 6.4 | Iconografía profesional |

---

## 📁 Estructura del Proyecto (Árbol Completo)

```
agro_proyect/
│
├── 📄 app.py                      # Aplicación Flask principal (punto de entrada)
├── 📄 models.py                   # Modelos SQLAlchemy (12 tablas)
├── 📄 requirements.txt            # Dependencias Python
├── 📄 run_project.bat             # Script de inicio Windows
├── 📄 .env                        # Variables de entorno (config sensible)
│
├── 📁 routes/                     # Blueprints de Flask (API REST)
│   ├── animal_routes.py           # CRUD de ganado (/api/ganado, /api/animal/<id>)
│   ├── export_routes.py           # Exportación PDF/Excel (/api/export/*)
│   ├── nutricion_routes.py        # Gestión nutricional (/api/nutricion/*)
│   └── analisis_routes.py         # Estadísticas y gráficas (/api/graficos)
│
├── 📁 services/                   # Lógica de negocio (Service Layer)
│   ├── animal_service.py          # Calcular_nutricion(), validaciones
│   ├── auth_service.py            # Hash contraseñas, verificar permisos
│   ├── export_service.py          # ExportadorPDF, ExportadorExcel
│   └── genealogia_service.py      # Árboles genealógicos, consanguinidad
│
├── 📁 static/                     # Assets públicos
│   ├── 📁 css/
│   │   └── styles.css             # Estilos globales (variables CSS, componentes)
│   ├── 📁 js/
│   │   ├── app.js                 # Orquestador SPA principal (showSection, CRUD)
│   │   ├── app-advanced.js        # Funciones avanzadas (nutrición)
│   │   ├── genealogia.js          # Árbol familiar con Vis.js
│   │   ├── grafos_complex.js      # Grafos de red complejos
│   │   └── agro_notify.js         # Sistema de notificaciones custom
│   └── 📁 img/                    # Imágenes y logos
│
├── 📁 templates/                  # Plantillas HTML (Jinja2)
│   ├── index.html                 # Dashboard principal (SPA container)
│   ├── login.html                 # Autenticación
│   └── [otros templates]          # Secciones modulares
│
├── 📁 utils/                      # Utilidades y helpers
│   └── decorators.py              # @require_permission, @require_login
│
├── 📁 instance/                   # Datos de instancia (no versionar)
│   └── ganado.db                  # Base de datos SQLite
│
├── 📁 docs/                       # Documentación original del proyecto
│
└── 📁 guia_desarrollo/            # Esta guía detallada
    ├── README.md                  # Índice general
    ├── 01_ARQUITECTURA_Y_DISEÑO.md
    ├── 02_INSTALACION_DESDE_CERO.md
    ├── 03_BASE_DE_DATOS.md
    └── [Este archivo]
```

---

## 🔄 Flujo de Desarrollo Típico

### 1. **Agregar Nueva Funcionalidad**

#### Backend (Python)

```python
# 1. Crear modelo (si necesita tabla nueva)
# models.py
class NuevaTabla(db.Model):
    __tablename__ = 'nueva_tabla'
    id = db.Column(db.Integer, primary_key=True)
    # ... campos

# 2. Crear servicio (lógica)
# services/nuevo_service.py
def procesar_algo(datos):
    # lógica de negocio
    return resultado

# 3. Crear ruta API
# routes/nueva_routes.py
nueva_bp = Blueprint('nueva', __name__)

@nueva_bp.route('/api/nuevo/recurso')
def get_recurso():
    resultado = procesar_algo(datos)
    return jsonify(resultado)

# 4. Registrar blueprint en app.py
from routes.nueva_routes import nueva_bp
app.register_blueprint(nueva_bp)
```

#### Frontend (JavaScript)

```javascript
// 5. Crear función para consumir API
// static/js/nuevo_modulo.js
async function loadNuevoRecurso() {
    try {
        const res = await fetch('/api/nuevo/recurso');
        const data = await res.json();
        renderNuevoRecurso(data);
    } catch (error) {
        console.error(error);
    }
}

// 6. Agregar sección en HTML
// templates/index.html
<div id="sec-nuevo" class="content-section hidden">
    <h2>Nuevo Módulo</h2>
    <div id="contenidoNuevo"></div>
</div>

// 7. Enlazar navegación
<a onclick="showSection('nuevo')" id="link-nuevo">Nuevo</a>
```

---

## 🧩 Patrones de Código Comunes

### Patrón: CRUD Estándar

```python
# CREATE
@bp.route('/api/recurso', methods=['POST'])
def create_recurso():
    data = request.get_json()
    nuevo = Modelo(**data)
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({'status': 'success', 'id': nuevo.id})

# READ (All)
@bp.route('/api/recurso', methods=['GET'])
def get_all_recursos():
    recursos = Modelo.query.all()
    return jsonify([r.to_dict() for r in recursos])

# READ (One)
@bp.route('/api/recurso/<int:id>', methods=['GET'])
def get_recurso(id):
    recurso = Modelo.query.get_or_404(id)
    return jsonify(recurso.to_dict())

# UPDATE
@bp.route('/api/recurso/<int:id>', methods=['PUT'])
def update_recurso(id):
    recurso = Modelo.query.get_or_404(id)
    data = request.get_json()
    for key, value in data.items():
        setattr(recurso, key, value)
    db.session.commit()
    return jsonify({'status': 'success'})

# DELETE
@bp.route('/api/recurso/<int:id>', methods=['DELETE'])
def delete_recurso(id):
    recurso = Modelo.query.get_or_404(id)
    db.session.delete(recurso)
    db.session.commit()
    return jsonify({'status': 'success'})
```

### Patrón: Fetch con Loading State

```javascript
async function loadData(url, button) {
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Procesar datos
        renderData(data);
        
    } catch (error) {
        console.error(error);
        alert('Error cargando datos');
    } finally {
        button.innerHTML = originalContent;
        button.disabled = false;
    }
}
```

---

## 🗂️ Convenciones de Código

### Nomenclatura

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Python - Variables** | snake_case | `peso_promedio = 450.5` |
| **Python - Funciones** | snake_case | `def calcular_nutricion():` |
| **Python - Clases** | PascalCase | `class GanadoService:` |
| **Python - Constantes** | UPPER_SNAKE | `MAX_PESO = 1000` |
| **JavaScript - Variables** | camelCase | `const animalId = 123` |
| **JavaScript - Funciones** | camelCase | `function loadAnimals()` |
| **JavaScript - Clases** | PascalCase | `class AgroNotify` |
| **CSS - Clases** | kebab-case | `.content-section` |
| **SQL - Tablas** | snake_case | `historial_medico` |

### Comentarios Docstring (Python)

```python
def calcular_nutricion(peso, edad, especie):
    """
    Calcula requerimientos nutricionales para un animal.
    
    Args:
        peso (float): Peso del animal en kg
        edad (int): Edad en meses
        especie (str): Tipo de animal (Bovino, Ovino, etc.)
    
    Returns:
        dict: Diccionario con forraje_verde, concentrado, suplementos, etc.
    
    Raises:
        ValueError: Si peso es negativo o edad inválida
    
    Example:
        >>> calcular_nutricion(500, 24, 'Bovino')
        {'forraje_verde': 12.5, 'concentrado': 3.0, ...}
    """
    # Implementación
```

---

## 🔍 Debugging y Herramientas

### Consultas SQL en Python

```python
# Habilitar logging de SQL
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### Inspección de Base de Datos

```bash
# Entrar a SQLite
sqlite3 instance/ganado.db

# Comandos útiles
.tables              # Listar tablas
.schema ganado       # Ver estructura de tabla
SELECT * FROM ganado LIMIT 5;  # Ver datos
```

### DevTools del Navegador

```javascript
// Console debugging
console.table(allAnimals);  // Ver arrays como tabla
console.log('Animal:', JSON.stringify(animal, null, 2));  // Pretty print

// Network inspector
// Filtrar por "XHR" para ver llamadas AJAX
```

---

## 📊 Cálculos Clave del Sistema

### 1. Edad del Animal

```python
def calcular_edad_meses(fecha_nacimiento):
    """Calcula edad en meses desde fecha de nacimiento"""
    hoy = datetime.now().date()
    dias = (hoy - fecha_nacimiento).days
    return dias // 30  # Aproximación: 1 mes = 30 días
```

### 2. Requerimientos Nutricionales (Fórmula NRC)

```python
def calcular_nutricion(peso, edad, especie):
    """
    Basado en National Research Council (NRC) guidelines
    
    Fórmula peso metabólico: peso^0.75
    """
    peso_metabolico = peso ** 0.75
    
    # Factores de ajuste por especie
    factores = {
        'Bovino': 1.0,
        'Ovino': 0.6,
        'Caprino': 0.65,
        'Porcino': 0.8,
        'Equino': 0.9
    }
    
    factor_especie = factores.get(especie, 1.0)
    factor_edad = 1.2 if edad < 6 else 1.0
    
    # Forraje Verde (2.5% del peso corporal)
    forraje = peso * 0.025 * factor_especie
    
    # Concentrado (basado en peso metabólico)
    concentrado = (peso_metabolico * 0.08) * factor_edad
    
    return {
        'forraje_verde': round(forraje, 2),
        'concentrado': round(concentrado, 2),
        'energia_metabolizable': round(peso_metabolico * 0.12, 2)
    }
```

### 3. Ganancia Diaria Promedio (GDP)

```python
def calcular_gdp(historial_pesos):
    """
    Calcula ganancia diaria promedio de peso
    
    GDP = (Peso Final - Peso Inicial) / Días transcurridos
    """
    if len(historial_pesos) < 2:
        return 0
    
    peso_inicial = historial_pesos[0]['peso']
    fecha_inicial = datetime.fromisoformat(historial_pesos[0]['fecha'])
    
    peso_final = historial_pesos[-1]['peso']
    fecha_final = datetime.fromisoformat(historial_pesos[-1]['fecha'])
    
    dias = (fecha_final - fecha_inicial).days
    if dias == 0:
        return 0
    
    gdp = (peso_final - peso_inicial) / dias
    return round(gdp, 3)
```

---

## 🚀 Comandos de Desarrollo Frecuentes

```bash
# Activar entorno virtual
venv\Scripts\activate

# Instalar nueva dependencia
pip install nombre-paquete
pip freeze > requirements.txt  # Actualizar requirements

# Ejecutar servidor en modo debug
python app.py

# Ejecutar en modo producción
flask run --host=0.0.0.0 --port=5000

# Crear backup de DB
cp instance/ganado.db backups/ganado_$(date +%Y%m%d).db

# Limpiar caché Python
find . -type d -name "__pycache__" -exec rm -rf {} +

# Ver logs en tiempo real
tail -f logs/app.log
```

---

## 📦 Deployment (Producción)

### Compilar a Ejecutable Windows

```bash
# Instalar PyInstaller
pip install pyinstaller

# Crear .exe
pyinstaller --onefile ^
    --windowed ^
    --add-data "static;static" ^
    --add-data "templates;templates" ^
    --add-data "instance;instance" ^
    --icon=static/img/logo.ico ^
    --name="AgroMaster" ^
    app.py

# Resultado en: dist/AgroMaster.exe
```

### Configuración para Producción

```python
# config.py
class ProductionConfig:
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
# app.py
app.config.from_object('config.ProductionConfig')
```

---

## 🔐 Seguridad - Checklist

- [x] Contraseñas con hash BCrypt (nunca texto plano)
- [x] Sesiones con SECRET_KEY fuerte y aleatoria
- [x] Validación de datos en cliente Y servidor
- [x] Uso de ORM (previene SQL Injection)
- [x] Templates con auto-escape (previene XSS)
- [x] Sistema de "Reset and Assign" en creación de usuarios (Privilegio Mínimo)
- [x] Sidebar Plegable con persistencia de grupo activo para mejorar el enfoque del usuario
- [x] CSRF tokens en formularios
- [x] HTTPS en producción
- [x] Backups automáticos periódicos
- [x] Logs de acciones críticas
- [x] Rate limiting en endpoints sensibles

---

## 🐛 Troubleshooting Rápido

| Error | Causa | Solución |
|-------|-------|----------|
| `ModuleNotFoundError` | Entorno no activo | `venv\Scripts\activate` |
| `OperationalError: no such table` | DB no creada | `db.create_all()` en app |
| `Address already in use` | Puerto ocupado | Cambiar a puerto 5001 |
| `400 Bad Request` | JSON inválido | Verificar formato de datos |
| `403 Forbidden` | Sin permisos | Comentar `@require_permission` |
| `500 Internal Server Error` | Error en código | Ver traceback en consola |

---

## 📚 Recursos Recomendados

### Documentación Oficial
- **Flask:** https://flask.palletsprojects.com/
- **SQLAlchemy:** https://docs.sqlalchemy.org/
- **Chart.js:** https://www.chartjs.org/docs/
- **Vis.js:** https://visjs.github.io/vis-network/docs/

### Tutoriales
- Flask Mega-Tutorial (Miguel Grinberg)
- SQLAlchemy ORM Tutorial
- JavaScript Moderno (MDN Web Docs)

---

## 🎯 Roadmap de Funcionalidades Futuras

1. **Módulo de Finanzas** (costos, ingresos, ROI)
2. **Predicción de Peso** con Machine Learning
3. **App Móvil** con React Native
4. **Multi-Finca** (gestión de múltiples propiedades)
5. **Integración IoT** (sensores de peso automáticos)
6. **Cloud Sync** (sincronización en la nube)

---

## 👨‍💻 Contribución al Proyecto

```bash
# 1. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "Agregar función X"

# 3. Push y crear Pull Request
git push origin feature/nueva-funcionalidad
```

---

## 📞 Soporte

**Desarrollador:** CRISTIAN J GARCIA  
**Proyecto:** Agro-Master v1.0  
**Año:** 2026  
**Licencia:** Propietario

---

## ✅ Checklist de Maestría del Sistema

Al finalizar esta guía, deberías poder:

- [x] Instalar el proyecto desde cero
- [x] Entender la arquitectura MVC adaptada
- [x] Navegar por el código backend y frontend
- [x] Crear nuevos endpoints API
- [x] Agregar nuevas tablas a la BD
- [x] Modificar la interfaz SPA
- [x] Exportar reportes en PDF/Excel
- [x] Debuggear problemas comunes
- [x] Hacer deployment en producción
- [x] Extender funcionalidades existentes

---

**¡Felicidades! Ahora tienes el conocimiento completo para trabajar con Agro-Master.** 🎉🐄🌾
