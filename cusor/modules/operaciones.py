# Esta función busca si algo (cédula o ID) ya existe en nuestra lista
def verificar_si_existe(lista, propiedad, valor_a_buscar):
    for elemento in lista:
        if elemento[propiedad] == valor_a_buscar:
            return True # Si lo encuentra, devuelve Verdadero
    return False # Si termina el ciclo y no lo vio, devuelve Falso

# Crea un "paquete" (diccionario) con la información del estudiante
def preparar_diccionario_estudiante(cedula, nombre, apellido):
    return {
        "cedula": cedula,
        "nombre": nombre,
        "apellido": apellido,
        "cursos": [] # Lista vacía porque empieza sin materias
    }

# Crea un "paquete" (diccionario) con la información del curso
def preparar_diccionario_curso(id_curso, nombre_materia, seccion, cupos):
    return {
        "id": id_curso,
        "nombre": nombre_materia,
        "seccion": seccion,
        "cupos": int(cupos) # Convertimos a entero para poder restar después
    }
