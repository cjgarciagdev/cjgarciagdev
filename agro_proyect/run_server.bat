@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo   INICIANDO SERVIDOR AGRO-MASTER (PROD)
echo ========================================
echo.

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] No se pudo encontrar el entorno virtual en .venv.
    pause
    exit /b 1
)

echo [1/2] Verificando dependencias...
".venv\Scripts\python.exe" -m pip install waitress

if %ERRORLEVEL% neq 0 (
    echo [ERROR] No se pudo instalar 'waitress'. Verifica tu conexion a internet.
    pause
    exit /b 1
)

echo [2/2] Iniciando servidor en el puerto 5000...
echo.
echo TIP: Si usas Tailscale, comparte tu IP de Tailscale con otros dispositivos.
echo.

".venv\Scripts\python.exe" server.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] El servidor se detuvo inesperadamente.
    pause
)
pause
