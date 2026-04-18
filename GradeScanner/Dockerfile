# Usa Python oficial como base
FROM python:3.11-slim

# Instalar dependencias del sistema operativo (solo libglib necesario para opencv-headless)
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar el archivo de dependencias
COPY requirements.txt .

# Instalar pip actualizado y luego las dependencias
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código del proyecto
COPY . .

# Crear carpetas necesarias
RUN mkdir -p uploads static/img

# Variables de entorno
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV MALLOC_TRIM_THRESHOLD_=65536

# Exponer el puerto
EXPOSE 10000

# Comando para iniciar - 1 worker para ahorrar RAM en plan gratuito (512MB)
CMD gunicorn --workers 1 --bind 0.0.0.0:${PORT:-10000} app:app --timeout 120
