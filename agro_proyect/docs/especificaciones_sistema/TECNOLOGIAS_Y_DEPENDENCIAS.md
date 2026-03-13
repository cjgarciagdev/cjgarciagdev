# Diccionario Tecnológico: Extensiones, Librerías y Código
> **OBJETIVO DEL DOCUMENTO:** Explicar el "Por Qué" y el "Cómo" de cada herramienta tecnológica integrada en el proyecto Agro-Master.

---

## 1. Núcleo del Sistema (Backend & Frameworks)

### 1.1 Flask (Framework Web)
*   **¿Por qué?**: Es un micro-framework ligero que no impone una estructura rígida, permitiendo construir una solución a medida para las necesidades específicas de la gestión ganadera sin exceso de código innecesario.
*   **¿Cómo?**: Orquesta las peticiones HTTP, gestiona las sesiones de usuario y renderiza las plantillas Jinja2 que ve el usuario final.

### 1.2 SQLAlchemy (ORM)
*   **¿Por qué?**: Permite interactuar con la base de datos usando objetos de Python en lugar de SQL puro. Esto reduce errores tipográficos y facilita el mantenimiento a largo plazo.
*   **¿Cómo?**: Define las tablas como clases de Python (modelos). Al salvar un objeto, SQLAlchemy traduce automáticamente los datos al formato de SQLite.

### 1.3 Flask-SQLAlchemy
*   **¿Por qué?**: Integra perfectamente SQLAlchemy con el ciclo de vida de Flask, facilitando la gestión de conexiones y sesiones de base de datos.
*   **¿Cómo?**: Provee el objeto `db` que se utiliza en todo el proyecto para realizar consultas y transacciones.

---

## 2. Motores de Inteligencia y Análisis

### 2.1 NetworkX (Teoría de Grafos)
*   **¿Por qué?**: Las relaciones de parentesco en el ganado son complejas y recursivas. SQL tiene dificultades para encontrar parientes de 5ta generación rápidamente.
*   **¿Cómo?**: Carga el rebaño en memoria como un grafo. Cada animal es un "Nodo" y los padres son "Aristas". Esto permite ejecutar algoritmos de búsqueda instantáneos para detectar endogamia.

### 2.3 Matplotlib (Visualización Estadística)
*   **¿Por qué?**: Los datos numéricos son difíciles de interpretar. Las gráficas de tendencia permiten ver si un animal está ganando peso o si su salud está decayendo.
*   **¿Cómo?**: Genera curvas de crecimiento en el servidor que luego son convertidas a imágenes base64 para ser incrustadas en los reportes PDF.

---

## 3. Generación de Documentos y Archivos

### 3.1 FPDF2 (Generador de PDF)
*   **¿Por qué?**: Los productores necesitan fichas técnicas físicas. FPDF2 permite un control total sobre el diseño del documento (celdas, fuentes, márgenes).
*   **¿Cómo?**: Construye el documento línea por línea, permitiendo la inserción de tablas dinámicas y logos corporativos en cada página.

### 3.2 OpenPyXL (Gestor de Excel)
*   **¿Por qué?**: El análisis avanzado de datos a menudo se hace en Excel o PowerBI. Exportar en formato `.xlsx` es estándar en la industria.
*   **¿Cómo?**: Crea libros de trabajo nativos de Microsoft Excel, inyectando los datos de la base de datos en columnas organizadas y con formatos de fecha correctos.

### 3.3 Pillow (Procesamiento de Imágenes)
*   **¿Por qué?**: Para manipular logos, generar marcas de agua o redimensionar gráficas antes de incluirlas en los reportes.
*   **¿Cómo?**: Procesa archivos de imagen en crudo para asegurar que tengan el tamaño y resolución óptimos para la impresión.

---

## 4. Utilidades de Sistema

### 4.1 Python-Dotenv
*   **¿Por qué?**: Para separar las claves de seguridad (secret keys) y configuraciones del código fuente, siguiendo las mejores prácticas de seguridad.
*   **¿Cómo?**: Lee un archivo oculto `.env` al iniciar la aplicación y carga las variables en el entorno de ejecución de Python.

### 4.2 Python-Dateutil
*   **¿Por qué?**: El manejo de fechas en agricultura (gestaciones, edades, vencimientos) es complejo. Dateutil facilita los cálculos de intervalos (ej: "sumar 9 meses a la fecha de parto").
*   **¿Cómo?**: Extiende las capacidades nativas de Python para manejar formatos de fecha regionales de forma robusta.

### 4.3 Werkzeug (Seguridad de Claves)
*   **¿Por qué?**: Nunca se deben guardar contraseñas en texto plano por razones de seguridad legal.
*   **¿Cómo?**: Provee funciones de **Hashing** (Pbkdf2) que transforman la contraseña en una cadena irreversible, protegiendo al usuario incluso si la base de datos es robada.

---
> **Doc-Tech:** Este diccionario garantiza que cualquier auditor o desarrollador externo comprenda la justificación detrás de cada línea de código y cada herramienta utilizada en Agro-Master.
