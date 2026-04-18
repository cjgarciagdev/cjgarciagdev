"""
GradeScanner - Server Entry Point
Punto de entrada para el servidor en producción (Render)
"""
import os
from app import app

# Gunicorn necesita el Flask app como objeto WSGI callable
# La aplicación se define en app.py

if __name__ == '__main__':
    debug = os.getenv('FLASK_DEBUG', '0') in ['1', 'true', 'True']
    host = os.getenv('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.getenv('PORT', 5000))
    app.run(debug=debug, host=host, port=port)
