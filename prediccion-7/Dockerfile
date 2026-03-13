# Usar una imagen base de Python estable
FROM python:3.11-slim

# Evitar que mencione que la versión de pip es antigua y no generar archivos .pyc
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instalar dependencias del sistema, Google Chrome y soporte para PostgreSQL
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    libpq-dev \
    gcc \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update && apt-get install -y google-chrome-stable \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Comando por defecto para ejecutar la aplicación (usando Gunicorn)
# Las variables de entorno controlarán si se inicia el scheduler interno
CMD gunicorn --bind 0.0.0.0:$PORT app:app
