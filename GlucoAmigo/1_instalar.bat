@echo off
echo ============================================
echo   GlucoAmigo - Instalacion de Dependencias
echo ============================================
cd /d "%~dp0"

if not exist .venv (
    echo Creando entorno virtual...
    py -m venv .venv
)

call .venv\Scripts\activate.bat

echo.
echo Actualizando pip, setuptools y wheel...
python -m pip install --upgrade pip setuptools wheel

echo.
echo Instalando dependencias criticas (binarios)...
python -m pip install --only-binary :all: psycopg2-binary

echo.
echo Instalando dependencias de requirements.txt...
python -m pip install -r requirements.txt

if %ERRORLEVEL% neq 0 (
    echo Error al instalar dependencias. Verifique su conexion o version de Python.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ============================================
echo Instalacion completada con exito.
echo.
echo Ahora puede ejecutar:
echo   - 2_ejecutar_local.bat (servidor local)
echo   - 3_ejecutar_tailscale.bat (red local + Tailscale)
echo ============================================
pause
