import os
from app import create_app

app, socketio = create_app()

if __name__ == '__main__':
    debug = os.getenv('FLASK_DEBUG', '1') in ['1', 'true', 'True']
    host = os.getenv('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.getenv('PORT', 5000))
    # Usar socketio.run en lugar de app.run para WebSockets
    socketio.run(app, debug=debug, host=host, port=port)
    
"""
DESARROLLADOR: Cristian J Garcia
CI: 32.170.910
Email: cjgarciag.dev@gmail.com
"""