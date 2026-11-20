FROM node:22-slim AS node_builder
FROM serversideup/php:8.3-fpm-nginx

USER root

COPY --from=node_builder /usr/local/bin /usr/local/bin
COPY --from=node_builder /usr/local/lib/node_modules /usr/local/lib/node_modules

WORKDIR /var/www/html

COPY . .

RUN cp .env.example .env \
    && composer install --no-dev --optimize-autoloader --no-interaction \
    && php artisan key:generate \
    && npm ci \
    && npm run build \
    && rm -rf node_modules .env

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

ENV AUTORUN_ENABLED=false
ENV PHP_OPCACHE_ENABLE=1

CMD ["/usr/local/bin/start.sh"]
