# 📚 Notas Importantes para Aprender Python

## 1. Fundamentos Básicos

### Variables y Tipos de Datos
- **Variables**: Contenedores para almacenar datos
- **Tipos primitivos**: `int`, `float`, `str`, `bool`
- **Tipado dinámico**: No necesitas declarar el tipo de variable

```python
nombre = "Carlos"      # str
edad = 25              # int
altura = 1.75          # float
es_estudiante = True   # bool
```

### Operadores
- **Aritméticos**: `+`, `-`, `*`, `/`, `//`, `%`, `**`
- **Comparación**: `==`, `!=`, `>`, `<`, `>=`, `<=`
- **Lógicos**: `and`, `or`, `not`
- **Asignación**: `=`, `+=`, `-=`, `*=`, `/=`

---

## 2. Estructuras de Control

### Condicionales
```python
if edad >= 18:
    print("Es mayor de edad")
elif edad >= 13:
    print("Es adolescente")
else:
    print("Es niño")
```

### Bucles
```python
# For loop
for i in range(5):
    print(i)

# While loop
while condicion:
    # código
```

### Control de Bucles
- `break` - Sale del bucle
- `continue` - Salta a la siguiente iteración

---

## 3. Estructuras de Datos

### Listas (Lists)
```python
frutas = ["manzana", "banano", "cereza"]
frutas.append("naranja")
frutas[0]  # "manzana"
```

### Tuplas (Tuples)
```python
coordenadas = (10, 20)
# Inmutables - no se pueden modificar
```

### Diccionarios (Dictionaries)
```python
persona = {
    "nombre": "Carlos",
    "edad": 25,
    "ciudad": "Caracas"
}
persona["nombre"]  # "Carlos"
```

### Conjuntos (Sets)
```python
numeros = {1, 2, 3, 4, 5}
# No permite duplicados
```

---

## 4. Funciones

### Definición y Llamada
```python
def saludar(nombre):
    return f"Hola, {nombre}!"

resultado = saludar("Carlos")
```

### Parámetros
- **Posicionales**: Se pasan en orden
- **Nombrados**: Se pasan con nombre clave
- **Valores por defecto**
- **`*args`**: Argumentos variables posicionales
- **`**kwargs`**: Argumentos variables nombrados

```python
def funcion_flexible(*args, **kwargs):
    print(args)    # Tupla de argumentos
    print(kwargs)  # Diccionario de argumentos nombrados
```

---

## 5. Programación Orientada a Objetos (POO)

### Clases y Objetos
```python
class Persona:
    def __init__(self, nombre, edad):
        self.nombre = nombre
        self.edad = edad
    
    def saludar(self):
        return f"Hola, soy {self.nombre}"

# Crear objeto
persona = Persona("Carlos", 25)
```

### Pilares de POO
1. **Encapsulamiento**: Proteger datos
2. **Herencia**: Reutilizar código
3. **Polimorfismo**: Multiple formas
4. **Abstracción**: Simplificar complejidad

---

## 6. Módulos y Paquetes

### Importación
```python
import math
from datetime import datetime
from os import path as os_path
```

### Módulos Estándar Importantes
- `math` - Funciones matemáticas
- `datetime` - Fechas y tiempos
- `json` - Manejo de JSON
- `os` - Operaciones del sistema
- `random` - Números aleatorios

---

## 7. Manejo de Errores

### Try-Except
```python
try:
    resultado = 10 / 0
except ZeroDivisionError:
    print("No se puede dividir por cero")
except Exception as e:
    print(f"Error: {e}")
finally:
    print("Siempre se ejecuta")
```

### Excepciones Personalizadas
```python
class MiError(Exception):
    pass
```

---

## 8. Archivos y Entrada/Salida

### Leer Archivos
```python
with open("archivo.txt", "r") as f:
    contenido = f.read()

# Leer líneas
with open("archivo.txt", "r") as f:
    lineas = f.readlines()
```

### Escribir Archivos
```python
with open("archivo.txt", "w") as f:
    f.write("Hola mundo")
```

---

## 9. Conceptos Avanzados

### Generadores
```python
def contador(maximo):
    for i in range(maximo):
        yield i

for num in contador(5):
    print(num)
```

### Decoradores
```python
def mi_decorador(func):
    def wrapper(*args, **kwargs):
        print("Antes")
        resultado = func(*args, **kwargs)
        print("Después")
        return resultado
    return wrapper

@mi_decorador
def funcion():
    print("Ejecutando")
```

### Context Managers
```python
with open("archivo.txt") as f:
    contenido = f.read()
# El archivo se cierra automáticamente
```

### Comprensiones
```python
# Lista
cuadrados = [x**2 for x in range(10)]

# Diccionario
diccionario = {x: x**2 for x in range(5)}

# Filtrado
pares = [x for x in range(20) if x % 2 == 0]
```

---

## 10. Temas Importantes para Proyectos Reales

### Manipulación de Strings
```python
texto = "  Hola Mundo  "
texto.strip()           # Eliminar espacios
texto.lower()           # Minúsculas
texto.upper()           # Mayúsculas
texto.split(",")        # Dividir
",".join(lista)         # Unir
```

### Expresiones Regulares (Regex)
```python
import re
patron = r"\d+"  # Números
resultado = re.findall(patron, "tengo 5 gatos y 3 perros")
```

### Trabajo con Fechas
```python
from datetime import datetime, timedelta

ahora = datetime.now()
manana = ahora + timedelta(days=1)
```

### Lambda Functions
```python
doble = lambda x: x * 2
suma = lambda a, b: a + b
```

---

## 11. Bibliotecas Esenciales

### Para Datos y Ciencia
- **NumPy**: Cálculos numéricos
- **Pandas**: Análisis de datos
- **Matplotlib**: Gráficos

### Para Web
- **Flask**: Framework web ligero
- **Django**: Framework web completo
- **FastAPI**: APIs modernas

### Para Automatización
- **Selenium**: Automatización de navegadores
- **Requests**: HTTP requests
- **BeautifulSoup**: Web scraping

---

## 12. Mejores Prácticas

### PEP 8 - Guía de Estilo
- snake_case para variables y funciones
- PascalCase para clases
- 4 espacios para indentación
- Líneas máximo 79 caracteres

### Tips de Código Limpio
1. ✅ Nombres descriptivos
2. ✅ Funciones pequeñas (una sola responsabilidad)
3. ✅ Comentarios cuando sea necesario
4. ✅ DRY (Don't Repeat Yourself)
5. ✅ Type hints (anotaciones de tipo)

```python
def saludar(nombre: str) -> str:
    return f"Hola, {nombre}!"
```

---

## 13. Entornos Virtuales

### Crear y Usar
```bash
# Crear
python -m venv mi_entorno

# Activar (Windows)
mi_entorno\Scripts\activate

# Activar (Linux/Mac)
source mi_entorno/bin/activate

# Instalar paquetes
pip install paquete

# Exportar dependencias
pip freeze > requirements.txt
```

---

## 🎯 Roadmap de Aprendizaje

1. **Semana 1-2**: Fundamentos (variables, tipos, operadores, condicionales)
2. **Semana 3-4**: Estructuras de datos y funciones
3. **Semana 5-6**: POO básica
4. **Semana 7-8**: Módulos, archivos y manejo de errores
5. **Semana 9-12**: Proyecto práctico con Flask/Django
6. **Mes 4-6**: Bases de datos, APIs, testing

---

## 📖 Recursos Recomendados

- [Documentación Oficial Python](https://docs.python.org/3/)
- [Real Python](https://realpython.com/)
- [Python.org Tutorial](https://docs.python.org/3/tutorial/)
- [W3Schools Python](https://www.w3schools.com/python/)

---

*¡Practica diariamente! La clave es escribir código constantemente.*
