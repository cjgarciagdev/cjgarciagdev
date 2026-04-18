# Dibuja el menú en la pantalla
def imprimir_menu():
    print("\n--- MENU DE OPCIONES ---")
    print("1. Registrar Estudiante")
    print("2. Registrar Curso")
    print("3. Inscribir en Curso")
    print("4. Mostrar Todo")
    print("5. Buscar por Cédula")
    print("6. Editar Estudiante")
    print("7. Eliminar Registro")
    print("8. Salir")

# Imprime los datos de forma organizada
def mostrar_listado(nombre_seccion, lista_de_datos):
    print(f"\n>>>> {nombre_seccion} <<<<")
    if not lista_de_datos:
        print("No hay registros disponibles.")
    else:
        for item in lista_de_datos:
            print(f"- {item}")
