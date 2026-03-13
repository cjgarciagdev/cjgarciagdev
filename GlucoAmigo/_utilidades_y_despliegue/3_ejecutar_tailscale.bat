@echo off
echo ============================================
echo   GlucoAmigo - Servidor Red Local y Tailscale
echo ============================================
cd /d "%~dp0"

if not exist .venv (
    echo El entorno virtual no existe. Por favor ejecute 1_instalar.bat primero.
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat

echo.
echo =========================================================
echo Abriendo servidor hacia todas las interfaces de red (0.0.0.0)
echo.
echo Puedes conectarte a traves de:
echo  1. Tu direccion IP local (ej. 192.168.x.x:5000)
echo  2. Tu direccion de Tailscale (ej. 100.x.x.x:5000)
echo =========================================================
echo.
python -m flask --app server:app run --host=0.0.0.0 --port=5000 --debug
pause
