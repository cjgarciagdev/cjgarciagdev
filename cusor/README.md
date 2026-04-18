# Sistema de Registro de Estudiantes y Cursos

Este sistema permite gestionar la inscripción de alumnos en diferentes materias utilizando una interfaz de consola pura. Desarrollado en Python bajo el paradigma de programación estructurada (sin POO), utilizando diccionarios y listas para el manejo de datos.

## 👥 Integrantes
*   **Integrante 1:** [Tu Nombre Aquí] - Interfaz de Consola
*   **Integrante 2:** [Nombre Compañero 1] - Lógica de Operaciones
*   **Integrante 3:** [Nombre Compañero 2] - Persistencia de Datos

## 🚀 Funcionalidades
1.  **Registro de Estudiantes:** Permite añadir alumnos con su cédula, nombre y apellido.
2.  **Registro de Cursos:** Permite crear materias con secciones y cupos limitados.
3.  **Inscripción:** Valida cupos disponibles y evita inscripciones duplicadas.
4.  **Persistencia:** Los datos se guardan automáticamente en archivos `.json`.
5.  **Búsqueda y Edición:** Herramientas para localizar y modificar registros existentes.

## 📁 Estructura del Proyecto
```text
├── main.py                # Punto de entrada
├── modules/
│   ├── menu.py            # Funciones de visualización
│   └── operaciones.py     # Lógica y validaciones
├── utils/
│   └── archivos.py        # Manejo de JSON
└── *.json                 # Archivos de datos generados
```

## 🛠️ Instrucciones de Uso
Para ejecutar el programa, simplemente corre el siguiente comando en la terminal:
```bash
python main.py
```
