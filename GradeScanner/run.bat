@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo   GradeScanner - Instalador y Ejecutor
echo   Sistema de Revision de Notas
echo ============================================
echo.

REM Obtener ruta del script
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Verificar Python
echo [*] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Python no esta instalado.
    echo Por favor instala Python desde: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [OK] Python encontrado

REM Verificar pip
echo [*] Verificando pip...
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip no esta disponible
    pause
    exit /b 1
)

echo [OK] pip disponible

REM Crear carpetas necesarias
echo [*] Creando carpetas...
if not exist "uploads" mkdir uploads
if not exist "static\img" mkdir static\img
echo [OK] Carpetas creadas

REM Instalar dependencias
echo [*] Instalando dependencias de Python...
echo.

python -m pip install --upgrade pip >nul 2>&1

for /f "delims=" %%a in ('type requirements.txt') do (
    set "package=%%a"
    set "package=!package:~0,-1!"
    if not "!package!"=="" (
        echo     Instalando: !package!
        python -m pip install !package! --quiet 2>nul
    )
)

echo.
echo [OK] Dependencias instaladas

REM Verificar Tesseract (opcional)
echo [*] Verificando Tesseract OCR...
where tesseract >nul 2>&1
if errorlevel 1 (
    echo.
    echo [AVISO] Tesseract OCR no encontrado en PATH
    echo         El OCR seguira funcionando pero puede fallar
    echo         Instala Tesseract desde: https://github.com/UB-Mannheim/tesseract/wiki
    echo.
) else (
    echo [OK] Tesseract encontrado
)

echo.
echo ============================================
echo   Iniciando GradeScanner...
echo   Servidor disponible en: http://localhost:5000
echo   Presiona CTRL+C para detener
echo ============================================
echo.

REM Ejecutar servidor
python app.py

if errorlevel 1 (
    echo.
    echo [ERROR] El servidor no pudo iniciar
    pause
)
