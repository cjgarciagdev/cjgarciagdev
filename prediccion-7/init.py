"""
Script de inicializacion del proyecto
Ejecuta este script la primera vez para configurar todo automaticamente
"""
import os
import sys


def print_banner():
    """Mostrar banner de bienvenida"""
    print("\n" + "="*60)
    print("PREDICCION-7 - Sistema de Prediccion Inteligente")
    print("="*60 + "\n")


def crear_env_file():
    """Crear archivo .env si no existe"""
    if not os.path.exists('.env'):
        print("[INIT] Creando archivo .env...")
        with open('.env', 'w') as f:
            f.write("""# Configuracion de la base de datos
DATABASE_URL=sqlite:///prediccion.db

# Configuracion de Flask
FLASK_ENV=development
SECRET_KEY=prediccion-7-secret-key-change-in-production

# Configuracion del modelo
MIN_SAMPLES=50
PREDICTION_CONFIDENCE=0.7
""")
        print("[OK] Archivo .env creado\n")
    else:
        print("[OK] Archivo .env ya existe\n")


def inicializar_base_datos():
    """Inicializar la base de datos"""
    print("[DB] Inicializando base de datos...")
    try:
        from database import init_db
        init_db()
        print("[OK] Base de datos inicializada\n")
    except Exception as e:
        print(f"[ERROR] Error al inicializar BD: {e}\n")
        return False
    return True


def agregar_datos_ejemplo():
    """Agregar algunos datos de ejemplo para demostracion"""
    print("[DATA] Deseas agregar datos de ejemplo? (s/n): ", end="")
    respuesta = input().strip().lower()
    
    if respuesta == 's':
        print("Agregando datos de ejemplo...")
        try:
            from database import get_session, NumeroExtraido
            from datetime import datetime
            import random
            
            session = get_session()
            
            # Agregar algunos numeros de ejemplo
            for _ in range(60):
                numero = NumeroExtraido(
                    numero=random.randint(1, 100),
                    fuente="Datos de ejemplo",
                    fecha_extraccion=datetime.utcnow(),
                    nombre_sorteo="Sorteo Demo"
                )
                session.add(numero)
            
            session.commit()
            session.close()
            
            print("[OK] Datos de ejemplo agregados\n")
        except Exception as e:
            print(f"[ERROR] Error al agregar datos: {e}\n")
    else:
        print("[SKIP] Omitiendo datos de ejemplo\n")


def verificar_dependencias():
    """Verificar que las dependencias esten instaladas"""
    print("[CHECK] Verificando dependencias...")
    
    dependencias = [
        'flask',
        'pandas',
        'sklearn',
        'sqlalchemy',
        'numpy'
    ]
    
    faltantes = []
    for dep in dependencias:
        try:
            __import__(dep)
        except ImportError:
            faltantes.append(dep)
    
    if faltantes:
        print("[ERROR] Faltan dependencias:")
        for dep in faltantes:
            print(f"   - {dep}")
        print("\n[HINT] Ejecuta: py -m pip install -r requirements.txt\n")
        return False
    else:
        print("[OK] Todas las dependencias estan instaladas\n")
        return True


def main():
    """Funcion principal"""
    print_banner()
    
    # Verificar dependencias
    if not verificar_dependencias():
        print("[ERROR] Por favor instala las dependencias primero.")
        print("   Comando: py -m pip install -r requirements.txt\n")
        return
    
    # Crear archivo .env
    crear_env_file()
    
    # Inicializar BD
    if not inicializar_base_datos():
        print("[WARN] Hubo un error al inicializar la base de datos.")
        return
    
    # Agregar datos de ejemplo (opcional)
    agregar_datos_ejemplo()
    
    # Mensaje final
    print("="*60)
    print("FINISH Inicializacion completada con exito!")
    print("="*60)
    print("\nRUN Para iniciar el servidor, ejecuta:")
    print("   py app.py")
    print("\nINFO Para mas informacion, consulta el README.md")
    print("\nWEB El servidor estara disponible en: http://127.0.0.1:5000\n")


if __name__ == "__main__":
    main()
