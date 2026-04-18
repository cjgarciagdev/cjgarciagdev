# Guía Completa para Defensa del Proyecto: Sistema de Gestión de Cursos y Estudiantes

Esta guía está diseñada para que entiendas **cada línea, condición y elemento de tu código**. Aborda desde los conceptos más básicos de Python usados en el proyecto hasta la lógica de negocios detrás de la inscripción de estudiantes.

---

## 1. Estructura General del Proyecto y Conceptos Clave

El proyecto adopta un enfoque modular (dividido en partes) que facilita su lectura y mantenimiento.

- **`main.py`**: Es el archivo principal que se ejecuta. Controla la interacción con el usuario mediante un bucle infinito y un menú.
- **`modules/menu.py`**: Contiene la parte visual (los `print`) para mostrar opciones en pantalla.
- **`modules/operaciones.py`**: Contiene la lógica de negocio; cómo preparar los datos antes de guardarlos y cómo buscar información que esté en la memoria.
- **`utils/archivos.py`**: Controla la "persistencia de datos", es decir, que la información no se borre al cerrar el programa leyendo y escribiendo en archivos `.json`.

### Conceptos Clave de Python Usados
* **Listas (`[]`)**: Usadas para almacenar una colección de elementos. En tu proyecto, se guarda una lista de estudiantes y una lista de cursos.
* **Diccionarios (`{}`)**: Guardan información en pares `clave: valor`. Por ejemplo, `{"nombre": "Carlos"}`. Representan a cada estudiante y cada curso.
* **Bucles `for` y `while`**: Sirven para repetir acciones (iteraciones). `while True` para el menú infinito, y `for` para buscar en las listas.
* **Condicionales (`if`, `elif`, `else`)**: Controlan qué bloque de código ejecutar basados en si una pregunta lógica (condición) es Verdadera (True) o Falsa (False).
* **JSON**: Formato estándar de texto para compartir o guardar información estructurada. Es casi idéntico a cómo se escriben los diccionarios en Python.

---

## 2. Explicación Archivo por Archivo

### A. `utils/archivos.py`
Su trabajo es conectar tu código en Python con los archivos de texto (`estudiantes.json` y `cursos.json`) alojados en tu disco duro.

```python
import json  # Biblioteca para traducir entre diccionarios de Python y texto JSON.
import os    # Biblioteca para interactuar con el Sistema Operativo (archivos del disco).

def cargar_datos_desde_json(nombre_archivo):
    # 'os.path.exists' verifica si el archivo ya fue creado anteriormente en Windows
    if not os.path.exists(nombre_archivo):
        return [] # Si no existe, devuelve una lista vacía para evitar que el programa de error (Crash)
    
    # 'with open(...)' asegura que el archivo se cierre automáticamente tras leerlo.
    # 'r' significa 'read' (leer). 'encoding='utf-8'' asegura que se lean las tildes y ñ.
    with open(nombre_archivo, 'r', encoding='utf-8') as archivo:
        # 'json.load()' agarra el texto JSON y lo convierte en una lista interactuable de diccionarios en Python.
        return json.load(archivo)

def guardar_datos_en_json(nombre_archivo, datos):
    # 'w' significa 'write' (escribir). ¡Ojo! sobreescribe el archivo borrando lo que tenía antes.
    with open(nombre_archivo, 'w', encoding='utf-8') as archivo:
        # 'json.dump()' hace la inversa: convierte tu lista de diccionarios (datos) a texto JSON.
        # 'indent=4' hace que el texto se guarde con saltos de línea y tabulaciones (bonito y legible).
        # 'ensure_ascii=False' permite caracteres especiales de Latinoamérica como á, é, ñ.
        json.dump(datos, archivo, indent=4, ensure_ascii=False)
```

### B. `modules/operaciones.py`
Se encarga de procesar la lógica interna en la memoria. No guarda cosas, sólo ayuda a prepararlas y buscarlas.

```python
def verificar_si_existe(lista, propiedad, valor_a_buscar):
    # Un ciclo 'for' que recorre cada diccionario (estudiante o curso) adentro de tu "lista" principal.
    for elemento in lista:
        # Aquí 'propiedad' puede ser 'cedula' o 'id'. Revisa en el diccionario si el valor es igual al que busco.
        if elemento[propiedad] == valor_a_buscar:
            return True # Retorna True de inmediato. El ciclo termina y la función cierra aquí.
    return False # Si el bucle termina y nunca entró al 'if', entonces NO existe, retorna Falso.

def preparar_diccionario_estudiante(cedula, nombre, apellido):
    # Agarra las variables enviadas por el usuario y empaqueta un Diccionario ({})
    return {
        "cedula": cedula,
        "nombre": nombre,
        "apellido": apellido,
        "cursos": [] # Un estudiante nuevo inicia obligatoriamente con una lista de cursos vacía.
    }

def preparar_diccionario_curso(id_curso, nombre_materia, seccion, cupos):
    return {
        "id": id_curso,
        "nombre": nombre_materia,
        "seccion": seccion,
        "cupos": int(cupos) # MUY IMPORTANTE: Se usa int() para forzar que sea un Número Entero (Matemático) en vez de un texto (String), esto permite poder restarlo después en la inscripción.
    }
```

### C. `modules/menu.py`
Las herramientas para interactuar visualmente con el usuario en la terminal.

```python
def imprimir_menu():
    # Uso básico de print para mostrar el índice numérico por pantalla.
    print("\n--- MENU DE OPCIONES ---")
    ...

def mostrar_listado(nombre_seccion, lista_de_datos):
    # La 'f' antes de las comillas significa Formateo (f-string). 
    # Permite inyectar variables reales directamente dentro del texto usando llaves {}.
    print(f"\n>>>> {nombre_seccion} <<<<")
    
    # 'not lista_de_datos' pregunta a Python: "¿Está la lista vacía o da Falso?"
    if not lista_de_datos:
        print("No hay registros disponibles.")
    else:
        for item in lista_de_datos:
            print(f"- {item}") # Imprime cada estudiante/curso uno por uno
```

### D. El núcleo: `main.py`
El lugar donde todas las piezas se juntan. Aquí es donde se toma lo que se hizo en los otros archivos para que el sistema funcione.

```python
# 'import' y 'from ... import ...' sirven para traer todas tus funciones externas al main para poder usarlas.
from modules.menu import imprimir_menu, mostrar_listado
from modules.operaciones import verificar_si_existe, preparar_diccionario_estudiante, preparar_diccionario_curso
from utils.archivos import cargar_datos_desde_json, guardar_datos_en_json

def ejecutar_sistema():
    # 1. Al Iniciar: Recupera todas las listas de la base de datos (archivos JSON) a nivel interno.
    estudiantes = cargar_datos_desde_json("estudiantes.json")
    cursos = cargar_datos_desde_json("cursos.json")

    # 'while True:' crea un bucle infinito ("ciclo sin fin") que no se detiene a no ser que nosotros explícitamente forcemos su salida.
    while True:
        imprimir_menu() 
        # 'input()' pausa el bucle y le exige al usuario tipear un valor y dar Enter. Lo que tipeó lo guarda en la variable 'opcion' convertido siempre a texto literal (String).
        opcion = input("\nElige una opción (1-8): ")

        # ---------------
        # OPCIÓN 1: Registrar Estudiante
        if opcion == "1":
            ci = input("Cédula: ")
            
            # Condición de Guardia. Usamos 'not' (Negación). "Si el estudiante NO existe..." -> prodecemos a crearlo.
            if not verificar_si_existe(estudiantes, "cedula", ci):
                nom = input("Nombre: ")
                ape = input("Apellido: ")
                
                # Se llama la función que devuelve el diccionario fabricado
                nuevo = preparar_diccionario_estudiante(ci, nom, ape)
                # 'append()' empuja el nuevo estudiante al final de tu gran lista de 'estudiantes'.
                estudiantes.append(nuevo)
                # OBLIGATORIO: Volcar (escribir) toda la lista nuevamente en el JSON para actualizar el archivo.
                guardar_datos_en_json("estudiantes.json", estudiantes)
                print("¡Estudiante guardado!")
            else:
                # Si 'verificar_si_existe' da True (Si existe), el 'not' la vuelve False y entra en este 'else'.
                print("Error: Esa cédula ya existe.")

        # ---------------
        # OPCIÓN 2 y OPCION 4, 5 funcionan bajo una lógica casi idéntica a la opción 1. Solamente que pidiendo y mostrando datos diferentes, pero con condicionales if y ciclos muy similares.
        
        # ---------------
        # OPCIÓN 3: Inscripción (Lógica Sensible a estudiar muy bien)
        elif opcion == "3":
            ci = input("Cédula Estudiante: ")
            id_c = input("ID Curso: ")
            
            # --- Fase de Búsqueda ---
            est_encontrado = None # Inicializamos en Nulo.
            for e in estudiantes: # Recorre toda la lista
                if e['cedula'] == ci: est_encontrado = e # Cuando coincide, este objeto referenciará al estudiante en la memoria.
            
            cur_encontrado = None
            for c in cursos:
                if c['id'] == id_c: cur_encontrado = c # Cuando coincide, lo guardamos temporalmente en la variable.

            # --- Fase Lógica ---
            # Si est_encontrado y cur_encontrado no son Nulos (se hallaron ambos exitosamente en la búsqueda)
            if est_encontrado and cur_encontrado:
                # Accedo a la clave lógica 'cupos' del diccionario a revisar si hay espacio (mayor a 0).
                if cur_encontrado['cupos'] > 0:
                    
                    # Añade el Nombre del curso ('id_c') a la sub-lista 'cursos' del alumno mediante .append()
                    est_encontrado['cursos'].append(id_c) 
                    
                    # Resta matemáticamente 1 al valor de los cupos (cur_encontrado['cupos'] = cur_encontrado['cupos'] - 1)
                    # Aquí la importancia de que en preparar_diccionario_curso pusimos int(cupos).
                    cur_encontrado['cupos'] -= 1 
                    
                    # Guarda el resultado en ambas Listas por separado para actualizar ambos JSONs permanentemente en disco.
                    guardar_datos_en_json("estudiantes.json", estudiantes)
                    guardar_datos_en_json("cursos.json", cursos)
                    print("¡Inscripción exitosa!")
                else:
                    print("Error: No quedan cupos.")
            else:
                print("Error: Estudiante o Curso no encontrado.")

        # ---------------
        # OPCIÓN 6: ACTUALIZACIÓN / EDICIÓN
        elif opcion == "6":
            ci = input("Cédula del alumno a modificar: ")
            for e in estudiantes:
                if e['cedula'] == ci:
                    # Sobreescribe directamente en el diccionario con la información que tipee el usuaio. 
                    e['nombre'] = input(f"Nuevo nombre ({e['nombre']}): ")
                    e['apellido'] = input(f"Nuevo apellido ({e['apellido']}): ")
                    guardar_datos_en_json("estudiantes.json", estudiantes)
                    print("Datos actualizados.")

        # ---------------
        # OPCIÓN 7: Eliminación 
        elif opcion == "7":
            ci = input("Cédula a borrar: ")
            
            # La función len() mide cuantos estudiantes hay actualmente, por ej: si hay 10, guarda un 10.
            longitud_antes = len(estudiantes)
            
            # EXPLICACIÓN COMPREHENSIÓN DE LISTAS:
            # Esta línea milagrosa reescribe toda la lista 'estudiantes'.
            # Traducido: "Agrega cada estudiante (e) a la nueva lista que estoy creando en ests corchetes [...]  SOLO SI (if) e['cedula'] NO ES IGUAL (!=) a la 'ci' que el usuario quiso borrar"
            # Aquel que sea igual a 'ci', no entra a la lista. Así que lo borramos por eliminación pasiva (lo omitimos).
            estudiantes = [e for e in estudiantes if e['cedula'] != ci]
            
            # Si después de filtrar la lista su cantidad inicial bajó (de 10 pasó a ser 9), significa que algo se restó (lo borramos exitosamente).
            if len(estudiantes) < longitud_antes:
                guardar_datos_en_json("estudiantes.json", estudiantes) # Actualizamos el disco
                print("Registro eliminado.")
            else:
                print("No se encontró esa cédula.")

        # ---------------
        # OPCIÓN 8: SALIR
        elif opcion == "8":
            print("Cerrando el sistema... ¡Adiós!")
            break  # Comando 'break': Rompe y deshace el bucle 'while True'. El programa entonces finaliza al no haber más código de Python por debajo que lo retenga.

# -----------------
# PUNTO DE ENTRADA
# -----------------
if __name__ == "__main__":
    # Esto le dice a Python: "¿Este archivo se está ejecutando directamente y no se siendo importado?".
    # Sirve como protección para proyectos grandes. En base, dice que si abres el programa dando 'run' a este main.py, entonces ejecutes la función de iniciar sistema.
    ejecutar_sistema()
```

---

## Posibles Preguntas del Jurado / Profesores y Cómo Responderlas

1. **Profesor/Evaluador:** *"¿Qué pasa si el archivo `estudiantes.json` no existe cuando el programa arranca?"*
   **Respuesta Defensiva:** En el archivo `archivos.py`, mi función `cargar_datos_desde_json` utiliza la librería `os` de sistema operativo para preguntar mediante `os.path.exists` si el archivo existe. Si no lo encuentra, en lugar de generar un error y tumbar el programa (Crash), simplemente retorna una lista en blanco (`[]`) que posteriormente será llenada de estudiantes y convertida en archivo sin problema.

2. **Profesor/Evaluador:** *"¿Por qué a veces trabajas con texto y otras lo conviertes a número en `operaciones.py` con `int(cupos)`?"*
   **Respuesta Defensiva:** Porque en Python, la terminal mediante el comando `input()` siempre recoge lo que tipeé como texto plano. Para casos como el `id` o la `cedula` no necesito modificarlos para matemáticas, así que se quedan como texto "str". Sin embargo, para los **cupos**, el programa debe poder restarle matemáticamente `1` cada vez que se inscriba alguien en la opción 3 del menú. Tratar de restar `1` a una letra/texto "5" en programación causa un error crítico; por tanto, usamos `int()` para forzar y asegurar que en la memoria se trata de un número.

3. **Profesor/Evaluador:** *"¿Cómo explicas el proceso paso-a-paso que usaste en la opción 3 para restarle los cupos e inscribir la materia de forma simultánea?"*
   **Respuesta Defensiva:** Utilicé lo que se conoce en Python como asignación a objetos por referencia. Al yo utilizar un `for` para buscar al estudiante y la materia por su cédula y por ID, guardé sus resultados en `est_encontrado` y `cur_encontrado`. Dichas variables no son copias muertas, sino que actúan como "enlaces directos" a mi lista principal guardada en memoria RAM. Al usar `append` para meterle el nombre de un curso, o `-= 1` para restarles cupo, se altera toda mi información en viva y al final guardo ese resultado a disco con la función que re-escribe el archivo JSON con lo último que quedó.

4. **Profesor:** *"¿Por qué escogiste usar JSON para guardar en vez de archivos de texto TXT plano?"*
   **Respuesta:** Porque el Formato JSON está diseñado para objetos y se acopla idénticamente a los diccionarios y listas de Python. En contraste, si usara un bloc de notas TXT estándar, tendría que escribir un montón de código adicional y complicado para "partir" cada línea por las comas y los parámetros del archivo. Todo eso se omite porque la librería de json cuenta con `json.load()` que se encarga automáticamente de ese engorroso proceso.
   
5. **Profesor:** *"¿Qué significa la palabra `if __name__ == "__main__":` en el fondo del archivo?"*
   **Respuesta:** Es una muy buena práctica en Python. Comprueba de si el archivo, la _entidad_, está ejecutándose cómo el archivo principal. Evita que todo el archivo y sus acciones se gatillen si de casualidad otro código del proyecto decide importarlo. Es básicamente asegurar cuál es tu ejecutable principal.
