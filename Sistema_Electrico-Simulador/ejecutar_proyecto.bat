@echo off
setlocal
cd /d "%~dp0"

echo ======================================================
echo       SISTEMA ELECTRICO - INICIO AUTOMATICO
echo ======================================================
echo.

:: Verificar si existe el entorno virtual
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] No se encontro el entorno virtual en la carpeta 'venv'.
    echo Por favor, ejecuta primero: python -m venv venv
    pause
    exit /b
)

echo [1/2] Activando entorno virtual...
call venv\Scripts\activate

echo [2/2] Iniciando servidor Flask...
echo.
echo >> El sistema estara disponible en: http://127.0.0.1:5000
echo >> Cierre esta ventana para detener el servidor.
echo.

python app.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Hubo un problema al iniciar la aplicacion.
    echo Asegurate de haber instalado las dependencias con: pip install -r requirements.txt
    pause
)

pause
