import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    debug = os.getenv('FLASK_DEBUG', '1') in ['1', 'true', 'True']
    host = os.getenv('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.getenv('PORT', 5000))
    app.run(debug=debug, host=host, port=port)
