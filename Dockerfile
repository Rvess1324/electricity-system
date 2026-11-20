FROM serversideup/php:8.3-fpm-nginx

USER root

RUN curl -fsSL https://nodesource.com | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && npm ci \
    && npm run build \
    && rm -rf node_modules

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

ENV AUTORUN_ENABLED=false
ENV PHP_OPCACHE_ENABLE=1

CMD ["/usr/local/bin/start.sh"]
