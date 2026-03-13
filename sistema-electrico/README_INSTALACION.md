# Guía de Instalación del Sistema Eléctrico

Esta guía explica cómo configurar el proyecto en una computadora nueva para que funcione de forma local (offline).

## Requisitos Previos

Asegúrate de tener instalado **Python** (versión 3.8 o superior). Puedes descargarlo desde [python.org](https://www.python.org/). Durante la instalación, marca la casilla **"Add Python to PATH"**.

## Pasos para la Instalación Inicial

Sigue estos comandos en la terminal (PowerShell o CMD) dentro de la carpeta del proyecto:

### 1. Crear el Entorno Virtual
```powershell
python -m venv venv
```

### 2. Activar e Instalar Dependencias
```powershell
# Activar
.\venv\Scripts\activate

# Instalar librerías
pip install -r requirements.txt
```

### 3. Inicializar Datos (Solo la primera vez)
Si necesitas cargar los transformadores y conexiones de ejemplo:
```powershell
python init_db.py
```

## Ejecución Rápida (Uso Diario)

Para facilitar el uso del sistema, se ha incluido un archivo ejecutable que hace todo el trabajo por ti:

1. Busca el archivo **`ejecutar_proyecto.bat`** en la carpeta principal.
2. Haz **doble clic** sobre él.
3. El servidor se iniciará automáticamente.
4. Abre tu navegador en: `http://127.0.0.1:5000`

---
**¿Por qué este proyecto es Offline?**
*   **Python Local**: Utiliza un entorno virtual (`venv`) para no depender de internet al ejecutar el código.
*   **Interfaz Local**: Todos los iconos (FontAwesome) y librerías de grafos (Vis.js) han sido integrados en la carpeta `static/vendor/`.
*   **Fuentes del Sistema**: Se han configurado tipografías que ya vienen en Windows para evitar peticiones a Google Fonts.
