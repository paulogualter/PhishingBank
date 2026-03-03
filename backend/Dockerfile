FROM python:3.11-slim

WORKDIR /app

# Dependências do sistema para WeasyPrint/ImageMagick
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    imagemagick \
    wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Criar diretório de uploads
RUN mkdir -p /app/uploads

ENV FLASK_APP=app
EXPOSE 5000

CMD ["python", "run.py"]
