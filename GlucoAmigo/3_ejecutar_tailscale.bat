@echo off
echo ============================================
echo   GlucoAmigo - Servidor Red Local + Tailscale
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
echo Servidor abierto a todas las interfaces de red (0.0.0.0)
echo.
echo Puedes conectarte a traves de:
echo  - Tu direccion IP local (ej. 192.168.x.x:5000)
echo  - Tu direccion de Tailscale (ej. 100.x.x.x:5000)
echo =========================================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

python -m flask --app server:app run --host=0.0.0.0 --port=5000 --debug

pause
