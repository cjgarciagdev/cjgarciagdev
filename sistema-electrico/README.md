# 🔌 Sistema de Monitoreo Eléctrico

Sistema avanzado de monitoreo de red eléctrica con visualización de grafo interactivo, simulación de fallas, gestión de trabajadores y generación de reportes.

## 📋 Características

### 🎯 Funcionalidades Principales

- **Visualización de Red Eléctrica**: Grafo interactivo que muestra transformadores (nodos) y cables (aristas) en tiempo real
- **Simulación de Fallas**: Simula diferentes tipos de fallas eléctricas:
  - ⚡ Bajo voltaje
  - ⚡ Alto voltaje
  - ⚡ Caída de cable
  - ⚡ Apagón total
- **Código de Colores**: Cada tipo de falla tiene su propio color distintivo para fácil identificación
- **Gestión de Trabajadores**: Sistema completo para administrar técnicos y asignarlos a reparaciones
- **Reportes**: Generación automática de reportes con ubicación y detalles de fallas
- **Dashboard en Tiempo Real**: Monitoreo del estado completo del sistema
- **Historial**: Registro detallado de todas las acciones y cambios

### 🎨 Diseño Premium

- Interfaz moderna con glassmorphism
- Paleta de colores eléctrica vibrante
- Animaciones suaves y micro-interacciones
- Diseño responsive para todos los dispositivos
- Dark mode profesional

### 🔐 Sistema de Autenticación

- Login con roles (Admin, Supervisor, Técnico)
- Permisos basados en roles
- Sesiones seguras con Flask-Login

## 🚀 Instalación

### Requisitos Previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Paso 1: Clonar o descargar el proyecto

Si descargaste el proyecto como ZIP, extrae los archivos. El proyecto debe tener esta estructura:

```
sistema-electrico/
├── app.py
├── requirements.txt
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── templates/
    ├── login.html
    └── dashboard.html
```

### Paso 2: Crear entorno virtual (recomendado)

```bash
# Navegar al directorio del proyecto
cd sistema-electrico

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate
```

### Paso 3: Instalar dependencias

```bash
pip install -r requirements.txt
```

### Paso 4: Ejecutar la aplicación

```bash
python app.py
```

La aplicación estará disponible en: **http://127.0.0.1:5000**

## 👤 Usuarios de Prueba

La aplicación viene con usuarios predefinidos para pruebas:

| Usuario    | Contraseña   | Rol          |
|------------|--------------|--------------|
| admin      | admin123     | Administrador|
| tecnico1   | tecnico123   | Técnico      |
| tecnico2   | tecnico123   | Técnico      |

## 📖 Uso del Sistema

### 1. Dashboard

El dashboard principal muestra:
- Estadísticas en tiempo real del sistema
- Grafo interactivo de la red eléctrica
- Transformadores y sus conexiones
- Fallas activas con código de colores

**Interacción con el grafo:**
- Haz clic en un transformador para ver sus detalles
- Los colores indican el estado:
  - 🟢 Verde: Normal
  - 🟠 Naranja: Bajo voltaje
  - 🔴 Rojo: Alto voltaje
  - 🟤 Marrón: Caída de cable
  - ⚫ Negro/Rojo oscuro: Apagón total

### 2. Simular Fallas

1. Click en el botón **"Simular Falla"**
2. Seleccionar tipo de falla
3. Elegir el transformador afectado
4. Establecer prioridad (baja, media, alta, crítica)
5. Agregar descripción (opcional)
6. Click en **"Simular Falla"**

La falla aparecerá inmediatamente en el grafo con su color correspondiente.

### 3. Gestión de Fallas

En la sección **"Fallas Activas"**:
- Ver todas las fallas del sistema
- Filtrar por estado (Activas, En Reparación, Resueltas)
- Asignar técnicos a las fallas
- Marcar fallas como resueltas
- Ver ubicación exacta de cada falla

### 4. Gestión de Trabajadores

- Ver lista completa de técnicos
- Ver disponibilidad en tiempo real
- Especialidades de cada técnico
- Información de contacto

### 5. Reportes

Generar diferentes tipos de reportes:
- **Reporte de Fallas**: PDF con todas las fallas, ubicaciones y estados
- **Estadísticas**: Análisis detallado del sistema
- **Mapa de Red**: Exportación JSON de la red completa

### 6. Historial

Registro completo de:
- Todas las acciones realizadas
- Usuario que realizó cada acción
- Fecha y hora exacta
- Detalles de los cambios

## 🗄️ Base de Datos

El sistema utiliza SQLite y crea automáticamente las siguientes tablas:

- **usuarios**: Información de usuarios y técnicos
- **transformadores**: Nodos de la red eléctrica
- **conexiones**: Cables que conectan transformadores
- **fallas**: Registro de todas las fallas
- **historial_cambios**: Auditoría completa del sistema

Los datos de ejemplo se crean automáticamente al iniciar la aplicación por primera vez.

## 🎨 Personalización

### Colores del Sistema

Edita `static/css/style.css` en la sección `:root` para cambiar los colores:

```css
:root {
    --primary: #00d9ff;           /* Color principal */
    --falla-bajo-voltaje: #ffaa00; /* Bajo voltaje */
    --falla-alto-voltaje: #ff3366; /* Alto voltaje */
    /* ... más colores */
}
```

### Datos Iniciales

Modifica la función `init_db()` en `app.py` para cambiar:
- Número de transformadores
- Ubicaciones
- Conexiones entre transformadores
- Usuarios predefinidos

## 🔧 Solución de Problemas

### Error: "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### Error: "Port already in use"
Cambia el puerto en `app.py`:
```python
app.run(debug=True, port=5001)  # Cambiar de 5000 a 5001
```

### La base de datos no se crea
Elimina el archivo `sistema_electrico.db` si existe y vuelve a ejecutar:
```bash
python app.py
```

## 📱 Responsive Design

La aplicación está optimizada para:
- 💻 Desktop (1920x1080 y superiores)
- 💻 Laptop (1366x768)
- 📱 Tablet (768x1024)
- 📱 Mobile (375x667)

## 🔒 Seguridad

- Contraseñas hasheadas con Werkzeug
- Sesiones seguras
- Protección CSRF
- Autenticación requerida para todas las rutas
- Control de acceso basado en roles

## 📊 Tecnologías Utilizadas

### Backend
- **Flask**: Framework web
- **SQLAlchemy**: ORM para base de datos
- **Flask-Login**: Autenticación
- **SQLite**: Base de datos

### Frontend
- **HTML5**: Estructura
- **CSS3**: Estilos premium con glassmorphism
- **JavaScript**: Lógica del cliente
- **Vis.js**: Visualización del grafo de red
- **Font Awesome**: Iconos

## 🚀 Próximas Características (Roadmap)

- [ ] Notificaciones push en tiempo real
- [ ] Exportación de reportes a PDF con ReportLab
- [ ] Mapa geográfico real con coordenadas GPS
- [ ] API REST completa para integración externa
- [ ] Gráficos de estadísticas con Chart.js
- [ ] Sistema de alertas automáticas por email/SMS
- [ ] Panel de análisis predictivo
- [ ] Aplicación móvil nativa

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y comercial.

## 👨‍💻 Soporte

Para soporte o preguntas:
- 📧 Email: soporte@sistema-electrico.com
- 📚 Documentación: [En desarrollo]
- 🐛 Reportar bugs: Crear issue en el repositorio

---

**Desarrollado con ⚡ para el monitoreo inteligente de redes eléctricas**
