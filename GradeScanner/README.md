# GradeScanner - Sistema de Revisión de Notas con Escáner

## Descripción
Sistema web para profesores que permite escanear y revisar exámenes/notas usando la cámara del dispositivo, con reconocimiento OCR y gestión de calificaciones.

## Características Principales
- 📷 Escaneo con Cámara
- 🔍 OCR Automático con Tesseract
- ✅ Calificación Automática con Plantillas
- 🏫 Gestión de Secciones (Años y Clases)
- 📊 Dashboard con Estadísticas
- 📥 Exportación CSV/Excel
- 📱 PWA (Funciona Offline)
- 🔐 Soporte para Supabase/PostgreSQL

## Instalación Local (SQLite)

### Requisitos
- Python 3.8+
- Tesseract OCR (opcional)

### Pasos
```bash
cd GradeScanner
pip install -r requirements.txt
python app.py
```
Abrir: http://localhost:5000

## Despliegue con Render + Supabase

### 1. Crear Proyecto en Supabase
1. Ir a https://supabase.com y crear cuenta
2. Nuevo proyecto > Configurar:
   - Name: gradescanner
   - Database Password: (guardar esta contraseña)
   - Region:Más cercana
3. Esperar que termine el setup
4. Ir a Settings > API > copiar:
   - Project URL
   - anon public key

### 2. Configurar Base de Datos
En el SQL Editor de Supabase, ejecutar:
```sql
-- Crear tablas
CREATE TABLE IF NOT EXISTS secciones (
    id SERIAL PRIMARY KEY,
    asignatura VARCHAR(100) NOT NULL,
    grado VARCHAR(50) NOT NULL,
    letra VARCHAR(10) NOT NULL,
    lapso VARCHAR(20),
    profesor VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plantillas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    seccion_id INTEGER REFERENCES secciones(id),
    tipo_examen VARCHAR(20) DEFAULT 'multiple_choice',
    respuestas_correctas TEXT,
    preguntas_texto TEXT,
    puntaje_total FLOAT DEFAULT 10,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS examenes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    seccion_id INTEGER REFERENCES secciones(id),
    plantilla_id INTEGER REFERENCES plantillas(id),
    imagen_path VARCHAR(500),
    texto_ocr TEXT,
    confianza_ocr FLOAT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    nota_final FLOAT,
    observaciones TEXT,
    fecha_escaneo TIMESTAMP DEFAULT NOW(),
    fecha_revision TIMESTAMP
);

CREATE TABLE IF NOT EXISTS preguntas (
    id SERIAL PRIMARY KEY,
    examen_id INTEGER REFERENCES examenes(id) ON DELETE CASCADE,
    plantilla_id INTEGER REFERENCES plantillas(id),
    numero INTEGER NOT NULL,
    tipo VARCHAR(20) DEFAULT 'multiple_choice',
    respuesta_estudiante VARCHAR(10),
    respuesta_correcta VARCHAR(10),
    respuesta_texto TEXT,
    respuesta_esperada TEXT,
    coincidencias FLOAT,
    puntos FLOAT DEFAULT 0,
    puntos_obtenidos FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT,
    descripcion VARCHAR(200)
);
```
passwordercopys12
### 3. Configurar Render
1. Crear cuenta en https://render.com
2. New Web Service > conectar repositorio GitHub
3. Configurar:
   - Name: gradescanner
   - Environment: Python
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn app:app --workers 2
4. En Environment Variables agregar:
   ```
   FLASK_ENV=production
   USE_SUPABASE=true
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT_REF].supabase.co
   SUPABASE_KEY=[ANON_KEY]
   SECRET_KEY=[GENERATE_RANDOM_KEY]
   ```

### 4. Desplegar
- Click en "Create Web Service"
- Esperar build y deploy
- Abrir URL proporcionada

## Uso del Sistema

### 1. Configuración Inicial
- Crear secciones (clases y grados) desde "Secciones"
- Crear plantillas con respuestas correctas

### 2. Escanear Exámenes
- Ir a "Escanear"
- Seleccionar cámara o subir imagen
- Elegir sección y plantilla
- Procesar

### 3. Revisar Resultados
- Ver nota automática
- Guardar en historial
- Generar reportes

## Estructura del Proyecto
```
GradeScanner/
├── app.py              # Servidor Flask
├── config.py           # Configuración
├── database.py         # Base de datos
├── models.py           # Modelos SQLAlchemy
├── ocr_engine.py       # Motor OCR
├── requirements.txt     # Dependencias
├── Procfile           # Render
├── .env.example       # Variables de entorno
├── templates/          # HTML
└── static/             # CSS, JS, PWA
```

## Notas
- OCR requiere Tesseract instalado en el servidor
- Para producción, usar almacenamiento cloud (S3, Cloudinary) para imágenes
- Configurar SSL/HTTPS en Render

## Licencia
MIT
