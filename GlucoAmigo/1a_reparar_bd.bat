@echo off
echo ============================================
echo   GlucoAmigo - Reparar Instalacion de BD
echo ============================================
cd /d "%~dp0"

if not exist .venv (
    echo El entorno virtual no existe. Ejecuta 1_instalar.bat
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat

echo Intentando instalar la ultima version disponible de psycopg2-binary
echo Las versiones mas recientes suelen tener binarios precompilados para Windows.
python -m pip install "psycopg2-binary>=2.9.9"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ATENCION: Sigue dando error. 
    echo Si no usas PostgreSQL en tu entorno local (Windows), 
    echo puedes borrar o comentar la linea de "psycopg2-binary" en el archivo "requirements.txt"
    echo ya que la app por defecto usa SQLite localmente.
) else (
    echo.
    echo psycopg2-binary se instaló correctamente.
)
pause
