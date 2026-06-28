FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# No system build deps needed: psycopg2-binary ships a prebuilt wheel (libpq
# bundled) and every other requirement is pure Python. Keeps the image minimal
# and free of a C toolchain in production.

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh

EXPOSE 8000

# Production default: migrate + collectstatic + gunicorn on $PORT.
# docker-compose overrides this command for local dev.
CMD ["./start.sh"]
