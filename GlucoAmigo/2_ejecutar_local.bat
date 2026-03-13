@echo off
echo ============================================
echo   GlucoAmigo - Servidor Local
echo ============================================
cd /d "%~dp0"

if not exist .venv (
    echo El entorno virtual no existe. Por favor ejecute 1_instalar.bat primero.
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat

echo.
echo ============================================
echo Iniciando servidor en modo local...
echo.
echo Abre en tu navegador: http://127.0.0.1:5000
echo Presiona Ctrl+C para detener el servidor
echo ============================================
echo.

python server.py

pause
