import json
import os


def cargar_datos_desde_json(nombre_archivo):
    if not os.path.exists(nombre_archivo):
        return []
    

    with open(nombre_archivo, 'r', encoding='utf-8') as archivo:
        return json.load(archivo)

def guardar_datos_en_json(nombre_archivo, datos):
  
    with open(nombre_archivo, 'w', encoding='utf-8') as archivo:
        json.dump(datos, archivo, indent=4, ensure_ascii=False)
