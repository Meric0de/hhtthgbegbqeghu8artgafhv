# Stage 1: Build Python backend environment
FROM python:3.9-slim AS python-builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py php_auth_proxy.py wasm_solver/ static/ templates/ ./
COPY php_auth/ ./php_auth/

# Build wasm module
WORKDIR /app/wasm_solver
RUN apt-get update && apt-get install -y build-essential emscripten && \
    emcc solver.c -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_solve_equation']" -s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']" -o solver.wasm

WORKDIR /app

# Stage 2: PHP + Apache + frontend build
FROM php:7.4-apache

RUN apt-get update && apt-get install -y libpng-dev libonig-dev libxml2-dev zip unzip curl git \
    && docker-php-ext-install pdo pdo_mysql mysqli \
    && a2enmod rewrite

# Copy PHP auth files
COPY php_auth/ /var/www/html/php_auth/
COPY --from=python-builder /app/static/ /var/www/html/static/
COPY --from=python-builder /app/templates/ /var/www/html/templates/
COPY --from=python-builder /app/wasm_solver/solver.wasm /var/www/html/static/wasm_solver/

# Copy Flask backend code & install dependencies
COPY --from=python-builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=python-builder /app/app.py /app/app.py
COPY --from=python-builder /app/php_auth_proxy.py /app/php_auth_proxy.py

# Expose ports: 80 for Apache + 5000 for Flask
EXPOSE 80 5000

# Start both Apache and Flask backend using supervisord
RUN apt-get update && apt-get install -y supervisor

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord", "-n"]
