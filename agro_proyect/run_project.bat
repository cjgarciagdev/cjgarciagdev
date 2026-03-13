@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo   INCICIANDO AGRO-MASTER v2.0
echo ========================================
echo.
if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] No se pudo encontrar el entorno virtual en .venv\Scripts\python.exe
    pause
    exit /b 1
)
".venv\Scripts\python.exe" app.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] La aplicacion se cerro con un error.
    pause
)
pause
