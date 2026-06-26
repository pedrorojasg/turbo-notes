#!/usr/bin/env sh
# Production entrypoint (Railway). Runs DB migrations and collects admin static
# files, then starts gunicorn bound to the platform-provided $PORT.
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
