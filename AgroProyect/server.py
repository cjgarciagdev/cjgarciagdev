from app import create_app
from waitress import serve
import socket
import logging

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('waitress')

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # No necesita ser una IP real, solo para obtener la IP local de la interfaz activa
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == '__main__':
    app = create_app()
    port = 5000
    local_ip = get_ip()
    
    print("=" * 50)
    print("   SERVIDOR AGRO-MASTER ACTIVO")
    print("-" * 50)
    print(f" Acceso Local: http://localhost:{port}")
    print(f" Acceso Red/Tailscale: http://{local_ip}:{port}")
    print("-" * 50)
    print(" Presiona Ctrl+C para detener el servidor")
    print("=" * 50)

    # Correr con Waitress para entorno de producción
    serve(app, host='0.0.0.0', port=port)
    # app.run(host='0.0.0.0', port=port, debug=True)
