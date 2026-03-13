# 🛠️ Instalación Desde Cero

## Guía Completa para Replicar el Proyecto Agro-Master

---

## 📋 Requisitos del Sistema

### Hardware Mínimo
- **CPU:** Procesador dual-core 2.0 GHz o superior
- **RAM:** 4 GB (8 GB recomendado)
- **Disco:** 500 MB libres
- **Pantalla:** 1366x768 o superior

### Software Requerido

#### 1. Python 3.10+ 
```bash
# Verificar versión instalada
python --version
# Debe ser Python 3.10.0 o superior
```

**Descarga:** https://www.python.org/downloads/

**Instalación Windows:**
1. Descargar instalador desde python.org
2. ✅ **IMPORTANTE:** Marcar "Add Python to PATH"
3. Elegir "Install Now"
4. Verificar: `python --version`

#### 2. Git (Opcional, para control de versiones)
```bash
git --version
```

**Descarga:** https://git-scm.com/downloads

#### 3. Editor de Código (Recomendado)
- **Visual Studio Code:** https://code.visualstudio.com/
- **PyCharm Community:** https://www.jetbrains.com/pycharm/

#### 4. Navegador Moderno
- Google Chrome 90+
- Mozilla Firefox 88+
- Microsoft Edge 90+

---

## 🚀 Instalación Paso a Paso

### Método 1: Desde Cero (Proyecto Nuevo)

#### PASO 1: Crear Directorio del Proyecto

```bash
# Crear carpeta del proyecto
mkdir agro_proyect
cd agro_proyect
```

#### PASO 2: Crear Entorno Virtual

```bash
# Windows
python -m venv venv

# Linux/Mac
python3 -m venv venv
```

#### PASO 3: Activar Entorno Virtual

```bash
# Windows (PowerShell)
venv\Scripts\activate

# Windows (CMD)
venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

**Importante:** Verás `(venv)` al inicio de tu prompt cuando esté activo.

#### PASO 4: Instalar Dependencias

```bash
# Actualizar pip primero
python -m pip install --upgrade pip

# Crear requirements.txt con estas dependencias:
```

**Contenido de `requirements.txt`:**
```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.3
bcrypt==4.1.2
fpdf==1.7.2
matplotlib==3.8.2
openpyxl==3.1.2
Pillow==10.2.0
python-dateutil==2.8.2
```

```bash
# Instalar todas las dependencias
pip install -r requirements.txt
```

#### PASO 5: Crear Estructura de Carpetas

```bash
# Crear estructura completa
mkdir routes services static templates utils instance guia_desarrollo

# Subcarpetas
mkdir static\css static\js static\img
mkdir instance
```

**Estructura resultante:**
```
agro_proyect/
├── venv/
├── routes/
├── services/
├── static/
│   ├── css/
│   ├── js/
│   └── img/
├── templates/
├── utils/
├── instance/
├── guia_desarrollo/
└── requirements.txt
```

#### PASO 6: Crear Archivo Principal `app.py`

```python
# app.py
from flask import Flask, render_template, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
import os

# Inicializar aplicación Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'tu-clave-secreta-super-segura-aqui-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/ganado.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar base de datos
db = SQLAlchemy(app)

# Importar modelos (se crearán después)
# from models import *

# Ruta principal
@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

# Ejecutar aplicación
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crear tablas si no existen
    app.run(debug=True, port=5000, host='0.0.0.0')
```

#### PASO 7: Crear Modelos de Base de Datos `models.py`

```python
# models.py
from app import db
from datetime import datetime

class Ganado(db.Model):
    """Modelo principal de animales"""
    __tablename__ = 'ganado'
    
    id = db.Column(db.Integer, primary_key=True)
    especie = db.Column(db.String(50), nullable=False)
    raza = db.Column(db.String(100), nullable=False)
    sexo = db.Column(db.String(10), nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    peso = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(50), default='Saludable')
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    historial_medico = db.relationship('HistorialMedico', backref='animal', 
                                       lazy=True, cascade='all, delete-orphan')
    historial_pesos = db.relationship('HistorialPeso', backref='animal', 
                                      lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convertir a diccionario para JSON"""
        edad_meses = (datetime.now().date() - self.fecha_nacimiento).days // 30
        return {
            'id': self.id,
            'especie': self.especie,
            'raza': self.raza,
            'sexo': self.sexo,
            'fecha_nacimiento': self.fecha_nacimiento.isoformat(),
            'peso': self.peso,
            'edad': edad_meses,
            'estado': self.estado,
            'fecha_registro': self.fecha_registro.isoformat()
        }

class HistorialMedico(db.Model):
    """Historial médico de animales"""
    __tablename__ = 'historial_medico'
    
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False)
    tipo = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    veterinario = db.Column(db.String(200))
    
    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'tipo': self.tipo,
            'descripcion': self.descripcion,
            'fecha': self.fecha.isoformat(),
            'veterinario': self.veterinario
        }

class HistorialPeso(db.Model):
    """Registro histórico de pesos"""
    __tablename__ = 'historial_peso'
    
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False)
    peso = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'peso': self.peso,
            'fecha': self.fecha.isoformat()
        }

# Funciones de acceso a datos (Repository Pattern)
def obtener_todos():
    """Obtener todos los animales"""
    animales = Ganado.query.all()
    return [a.to_dict() for a in animales]

def obtener_animal(id):
    """Obtener un animal por ID"""
    animal = Ganado.query.get(id)
    return animal.to_dict() if animal else None

def obtener_pesos_animal(id):
    """Obtener historial de pesos de un animal"""
    pesos = HistorialPeso.query.filter_by(animal_id=id).order_by(HistorialPeso.fecha).all()
    return [p.to_dict() for p in pesos]
```

#### PASO 8: Crear Template Base `templates/base.html`

```html
<!-- templates/base.html -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Agro-Master{% endblock %}</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- CSS Principal -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/styles.css') }}">
    
    {% block extra_css %}{% endblock %}
</head>
<body>
    {% block content %}{% endblock %}
    
    <!-- JavaScript Principal -->
    <script src="{{ url_for('static', filename='js/app.js') }}"></script>
    
    {% block extra_js %}{% endblock %}
</body>
</html>
```

#### PASO 9: Crear CSS Base `static/css/styles.css`

```css
/* static/css/styles.css */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-color: #1b4332;
    --secondary-color: #2d6a4f;
    --accent-color: #40916c;
    --bg-color: #f8f9fa;
    --text-color: #212529;
    --border-radius: 12px;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.6;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

button:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.hidden {
    display: none !important;
}
```

#### PASO 10: Crear JavaScript Base `static/js/app.js`

```javascript
// static/js/app.js

/**
 * Función para cambiar de sección en el SPA
 */
function showSection(id) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar la sección solicitada
    const targetSection = document.getElementById(`sec-${id}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active-link');
    });
    
    const activeLink = document.getElementById(`link-${id}`);
    if (activeLink) {
        activeLink.classList.add('active-link');
    }
}

/**
 * Función para cargar animales desde la API
 */
async function loadAnimals() {
    try {
        const response = await fetch('/api/ganado');
        const data = await response.json();
        
        console.log('Animales cargados:', data);
        
        // Renderizar en tabla (implementar según necesidad)
        renderAnimals(data);
    } catch (error) {
        console.error('Error cargando animales:', error);
    }
}

/**
 * Renderizar lista de animales
 */
function renderAnimals(animals) {
    const tbody = document.getElementById('animalTableBody');
    if (!tbody) return;
    
    if (animals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay animales registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = animals.map(animal => `
        <tr>
            <td>#${animal.id}</td>
            <td>${animal.especie}</td>
            <td>${animal.raza}</td>
            <td>${animal.sexo}</td>
            <td>${animal.edad} meses</td>
            <td>${animal.peso} kg</td>
            <td>
                <button onclick="viewAnimal(${animal.id})">Ver</button>
            </td>
        </tr>
    `).join('');
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Agro-Master iniciado');
    // Cargar datos iniciales si es necesario
});
```

#### PASO 11: Crear Primera Ruta API

```python
# routes/animal_routes.py
from flask import Blueprint, jsonify, request
from models import Ganado, db, obtener_todos, obtener_animal
from datetime import datetime

animal_bp = Blueprint('animal', __name__)

@animal_bp.route('/api/ganado', methods=['GET'])
def get_all_animals():
    """Obtener todos los animales"""
    try:
        animales = obtener_todos()
        return jsonify(animales), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@animal_bp.route('/api/animal/<int:id>', methods=['GET'])
def get_animal(id):
    """Obtener un animal específico"""
    try:
        animal = obtener_animal(id)
        if not animal:
            return jsonify({'error': 'Animal no encontrado'}), 404
        return jsonify(animal), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@animal_bp.route('/api/guardar', methods=['POST'])
def save_animal():
    """Guardar o actualizar un animal"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required = ['especie', 'raza', 'sexo', 'fecha_nacimiento', 'peso']
        for field in required:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        # Crear o actualizar
        if data.get('id'):
            # Actualizar existente
            animal = Ganado.query.get(data['id'])
            if not animal:
                return jsonify({'error': 'Animal no encontrado'}), 404
        else:
            # Crear nuevo
            animal = Ganado()
        
        # Asignar datos
        animal.especie = data['especie']
        animal.raza = data['raza']
        animal.sexo = data['sexo']
        animal.fecha_nacimiento = datetime.fromisoformat(data['fecha_nacimiento'])
        animal.peso = float(data['peso'])
        animal.estado = data.get('estado', 'Saludable')
        
        if not data.get('id'):
            db.session.add(animal)
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Animal guardado correctamente',
            'id': animal.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

**Registrar Blueprint en `app.py`:**

```python
# Agregar al final de app.py antes del if __name__

from routes.animal_routes import animal_bp
app.register_blueprint(animal_bp)
```

#### PASO 12: Primera Ejecución

```bash
# Asegurar que el entorno virtual esté activo
# Debe verse (venv) al inicio

# Ejecutar servidor
python app.py
```

**Salida esperada:**
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server.
 * Running on http://0.0.0.0:5000
Press CTRL+C to quit
```

#### PASO 13: Verificar Funcionamiento

Abrir navegador en: `http://localhost:5000`

**Prueba de API:**
```bash
# En otra terminal o Postman
curl http://localhost:5000/api/ganado
```

---

### Método 2: Desde Proyecto Existente

Si ya tienes el código fuente completo:

```bash
# 1. Extraer/clonar proyecto
cd agro_proyect

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno
venv\Scripts\activate    # Windows
source venv/bin/activate  # Linux/Mac

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Ejecutar
python app.py
```

---

## 🗄️ Inicialización de Base de Datos

### Opción A: Automática (Recomendada)

```python
# En app.py al final
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crea todas las tablas
    app.run(debug=True, port=5000)
```

### Opción B: Script Manual

```python
# scripts/init_db.py
from app import app, db
from models import Ganado, HistorialMedico, HistorialPeso
from datetime import datetime, date

def init_database():
    """Inicializar base de datos con datos de ejemplo"""
    with app.app_context():
        # Eliminar tablas existentes (¡CUIDADO EN PRODUCCIÓN!)
        db.drop_all()
        
        # Crear todas las tablas
        db.create_all()
        
        # Datos de ejemplo
        animales_ejemplo = [
            Ganado(
                especie='Bovino',
                raza='Holstein',
                sexo='Hembra',
                fecha_nacimiento=date(2023, 1, 15),
                peso=450.5,
                estado='Saludable'
            ),
            Ganado(
                especie='Bovino',
                raza='Angus',
                sexo='Macho',
                fecha_nacimiento=date(2022, 6, 20),
                peso=580.0,
                estado='Saludable'
            ),
            Ganado(
                especie='Ovino',
                raza='Merino',
                sexo='Hembra',
                fecha_nacimiento=date(2023, 3, 10),
                peso=65.3,
                estado='Saludable'
            )
        ]
        
        # Agregar a la sesión
        for animal in animales_ejemplo:
            db.session.add(animal)
        
        # Guardar cambios
        db.session.commit()
        
        print(f"✅ Base de datos inicializada con {len(animales_ejemplo)} animales de ejemplo")

if __name__ == '__main__':
    init_database()
```

**Ejecutar:**
```bash
python scripts/init_db.py
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno `.env`

```bash
# .env (crear en raíz del proyecto)
SECRET_KEY=tu-clave-secreta-muy-segura-2026
DATABASE_URI=sqlite:///instance/ganado.db
DEBUG=True
PORT=5000
```

**Cargar en `app.py`:**

```python
from dotenv import load_dotenv
import os

load_dotenv()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
```

**Instalar:**
```bash
pip install python-dotenv
```

---

## 🧪 Verificación de Instalación

### Checklist de Verificación

```bash
# 1. Python instalado correctamente
python --version
# ✅ Debe mostrar Python 3.10 o superior

# 2. Entorno virtual activo
which python  # Linux/Mac
where python  # Windows
# ✅ Debe apuntar a venv/Scripts/python

# 3. Dependencias instaladas
pip list
# ✅ Debe mostrar Flask, SQLAlchemy, etc.

# 4. Base de datos creada
ls instance/
# ✅ Debe existir ganado.db

# 5. Servidor funcionando
curl http://localhost:5000/api/ganado
# ✅ Debe retornar JSON (aunque sea vacío [])
```

---

## 🐛 Problemas Comunes y Soluciones

### Error: "ModuleNotFoundError: No module named 'flask'"

**Causa:** Entorno virtual no activado o dependencias no instaladas

**Solución:**
```bash
venv\Scripts\activate
pip install -r requirements.txt
```

### Error: "Address already in use"

**Causa:** Puerto 5000 ocupado

**Solución:**
```python
# Cambiar puerto en app.py
app.run(debug=True, port=5001)  # Usar otro puerto
```

### Error: "Unable to open database file"

**Causa:** Carpeta instance no existe

**Solución:**
```bash
mkdir instance
python app.py  # Reiniciar para crear DB
```

### Error: "No such table: ganado"

**Causa:** Tablas no creadas

**Solución:**
```python
# En app.py asegurar:
with app.app_context():
    db.create_all()
```

---

## 📦 Empaquetado (Opcional)

### Crear Ejecutable Windows con PyInstaller

```bash
# Instalar PyInstaller
pip install pyinstaller

# Crear ejecutable
pyinstaller --onefile --windowed --add-data "static;static" --add-data "templates;templates" app.py

# El .exe estará en dist/app.exe
```

---

## ✅ Resumen de Comandos

```bash
# Secuencia completa de instalación
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
python app.py

# Navegar a http://localhost:5000
```

---

## 🎯 Siguiente Paso

👉 **03_BASE_DE_DATOS.md** - Estructura completa de la base de datos

---

**¡Instalación completada! El sistema debería estar funcionando.** 🎉
