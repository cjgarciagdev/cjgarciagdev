# 🌐 Guía de Despliegue - Predicción-7

Para que el proyecto funcione en un servidor (en la nube) y siga trabajando incluso si apagas tu laptop, la mejor opción gratuita/económica es **Render.com**.

## 🚀 Opción 1: Despliegue Rápido con Render (Recomendado)

He preparado el proyecto para que sea compatible con Docker y Render.

### Pasos:

1. **Sube tu código a GitHub**:
   - Crea un repositorio privado o público en GitHub.
   - Sube todos los archivos (excepto `venv` y `.env`).

2. **Crea una cuenta en [Render.com](https://render.com)**.

3. **Conecta tu repositorio**:
   - En el Dashboard de Render, haz clic en **"New"** > **"Blueprint"**.
   - Conecta tu cuenta de GitHub y selecciona el repositorio de `prediccion-7`.

4. **Configura el despliegue**:
   - Render detectará el archivo `render.yaml` automáticamente.
   - Creará dos cosas:
     1. **Una Base de Datos PostgreSQL**: Para que tus datos no se borren (SQLite se borra cada vez que el servidor se reinicia).
     2. **Un Servicio Web Docker**: Que ejecutará la aplicación y el scraper en segundo plano.

5. **¡Listo!**:
   - Render te dará una URL (ej: `prediccion-7.onrender.com`).
   - El sistema estará activo 24/7.

---

## 🛠️ Configuraciones importantes en el servidor

He modificado el código para que sea "inteligente" en el servidor:

*   **DATABASE_URL**: El sistema detectará automáticamente la base de datos de Render.
*   **RUN_SCHEDULER**: Está configurado en `true` para que el scraper (antiguo `clock.py`) se ejecute dentro de la misma aplicación web, ahorrándote pagar por un segundo servidor.
*   **Selenium**: El archivo `Dockerfile` instala automáticamente Chrome para que el scraping funcione sin errores.

## 📁 ¿Qué pasa con mis datos actuales?

La base de datos actual (`prediccion.db`) es un archivo local. Al subirlo al servidor:
1. El servidor usará una base de datos **PostgreSQL** (más profesional y segura).
2. Si quieres subir tus datos actuales, deberás exportarlos o agregarlos manualmente en el dashboard web una vez esté en línea.

## 💰 Costo
*   **Render**: Tiene un plan **GRATUITO** para la base de datos (por 90 días) y para el servicio web. Es ideal para empezar.

Si prefieres usar un VPS (como DigitalOcean o AWS), puedes usar el archivo `Dockerfile` directamente con `docker-compose`.
