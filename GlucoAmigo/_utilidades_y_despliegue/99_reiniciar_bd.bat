@echo off
echo ============================================
echo   GlucoAmigo - Reiniciar Base de Datos
echo ============================================
cd /d "%~dp0"

echo Borrando la base de datos antigua...
del /F /Q instance\glucoamigo.db

if exist instance\glucoamigo.db (
    echo.
    echo ERROR: La base de datos sigue ahi. 
    echo Asegurate de que cerraste el SERVIDOR (presiona CTRL+C en la ventana donde este corriendo el servidor)
    echo antes de intentar borrarla.
) else (
    echo.
    echo EXITO: Base de datos borrada con exito.
    echo Vuelve a ejecutar 2_ejecutar_local.bat y el sistema creara una nueva base de datos automaticamente.
)
pause
