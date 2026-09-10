#!/bin/sh
set -e

echo "Starting Spring Boot Backend..."
java -jar /app/backend.jar &

echo "Starting Nginx..."
nginx -g "daemon off;"