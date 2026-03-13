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

echo Actualizando pip, setuptools y wheel...
python -m pip install --upgrade pip setuptools wheel

echo Instalando dependencias criticas (binarios)...
:: Se fuerza el uso de binarios para evitar errores de compilacion de pg_config
python -m pip install --only-binary :all: psycopg2-binary flask-sqlalchemy flask-login flask-migrate python-dotenv

echo Instalando resto de dependencias...
python -m pip install -r requirements.txt

if %ERRORLEVEL% neq 0 (
    echo Error al instalar dependencias. Verifique su conexion o version de Python.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Instalacion completada con exito.
pause
