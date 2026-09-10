# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS="--max-old-space-size=2048"
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 3: Runtime Environment
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache nginx curl bash
WORKDIR /app

# Copy Frontend static build to Nginx html directory
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html

# Copy Spring Boot backend jar
COPY --from=backend-builder /app/backend/target/*.jar /app/backend.jar

# Copy Nginx config & entrypoint script
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/app/entrypoint.sh"]