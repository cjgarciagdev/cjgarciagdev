from modules.menu import imprimir_menu, mostrar_listado
from modules.operaciones import verificar_si_existe, preparar_diccionario_estudiante, preparar_diccionario_curso
from utils.archivos import cargar_datos_desde_json, guardar_datos_en_json

def ejecutar_sistema():
    # 1. Cargamos al iniciar el programa
    estudiantes = cargar_datos_desde_json("estudiantes.json")
    cursos = cargar_datos_desde_json("cursos.json")

    while True:
        imprimir_menu()
        opcion = input("\nElige una opción (1-8): ")

        # REGISTRAR ESTUDIANTE
        if opcion == "1":
            ci = input("Cédula: ")
            if not verificar_si_existe(estudiantes, "cedula", ci):
                nom = input("Nombre: ")
                ape = input("Apellido: ")
                # Creamos el diccionario y lo metemos a la lista
                nuevo = preparar_diccionario_estudiante(ci, nom, ape)
                estudiantes.append(nuevo)
                # Guardamos inmediatamente en el archivo
                guardar_datos_en_json("estudiantes.json", estudiantes)
                print("¡Estudiante guardado!")
            else:
                print("Error: Esa cédula ya existe.")

        # REGISTRAR CURSO
        elif opcion == "2":
            id_c = input("ID del Curso: ")
            if not verificar_si_existe(cursos, "id", id_c):
                nom = input("Nombre Materia: ")
                sec = input("Sección: ")
                cup = input("Cupos iniciales: ")
                nuevo = preparar_diccionario_curso(id_c, nom, sec, cup)
                cursos.append(nuevo)
                guardar_datos_en_json("cursos.json", cursos)
                print("¡Curso creado!")
            else:
                print("Error: El ID del curso ya existe.")

        # INSCRIBIR (RELACIONAR AMBOS)
        elif opcion == "3":
            ci = input("Cédula Estudiante: ")
            id_c = input("ID Curso: ")
            
            # Buscamos al estudiante y al curso
            est_encontrado = None
            for e in estudiantes:
                if e['cedula'] == ci: est_encontrado = e
            
            cur_encontrado = None
            for c in cursos:
                if c['id'] == id_c: cur_encontrado = c

            # Si ambos existen y hay cupo...
            if est_encontrado and cur_encontrado:
                if cur_encontrado['cupos'] > 0:
                    est_encontrado['cursos'].append(id_c) # Añadimos curso al alumno
                    cur_encontrado['cupos'] -= 1            # Restamos un cupo al curso
                    guardar_datos_en_json("estudiantes.json", estudiantes)
                    guardar_datos_en_json("cursos.json", cursos)
                    print("¡Inscripción exitosa!")
                else:
                    print("Error: No quedan cupos.")
            else:
                print("Error: Estudiante o Curso no encontrado.")

        # MOSTRAR LISTADOS
        elif opcion == "4":
            mostrar_listado("ESTUDIANTES REGISTRADOS", estudiantes)
            mostrar_listado("MATERIAS DISPONIBLES", cursos)

        # BUSQUEDA
        elif opcion == "5":
            ci = input("Introduce Cédula: ")
            encontrado = False
            for e in estudiantes:
                if e['cedula'] == ci:
                    print(f"Datos: {e['nombre']} {e['apellido']} | Cursos: {e['cursos']}")
                    encontrado = True
            if not encontrado: print("No se encontró.")

        # EDICIÓN
        elif opcion == "6":
            ci = input("Cédula del alumno a modificar: ")
            for e in estudiantes:
                if e['cedula'] == ci:
                    e['nombre'] = input(f"Nuevo nombre ({e['nombre']}): ")
                    e['apellido'] = input(f"Nuevo apellido ({e['apellido']}): ")
                    guardar_datos_en_json("estudiantes.json", estudiantes)
                    print("Datos actualizados.")

        # ELIMINACIÓN
        elif opcion == "7":
            ci = input("Cédula a borrar: ")
            # Sobreescribimos la lista quitando al que coincida con la cédula
            longitud_antes = len(estudiantes)
            estudiantes = [e for e in estudiantes if e['cedula'] != ci]
            
            if len(estudiantes) < longitud_antes:
                guardar_datos_en_json("estudiantes.json", estudiantes)
                print("Registro eliminado.")
            else:
                print("No se encontró esa cédula.")

        # SALIR
        elif opcion == "8":
            print("Cerrando el sistema... ¡Adiós!")
            break
        
        else:
            print("Opción inválida, intenta de nuevo.")

# Punto de inicio del programa
if __name__ == "__main__":
    ejecutar_sistema()
