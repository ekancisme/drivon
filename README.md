# Drivon

Car rental and fleet management application with a React frontend and a Spring Boot backend.

## Requirements

- Node.js and npm
- Java 17

## Install dependencies

```bash
npm install
cd frontend && npm install
```

## Run locally

Start the backend and frontend in separate terminals:

```bash
cd backend && ./mvnw spring-boot:run
```

```bash
cd frontend && npm start
```

## Build

```bash
cd frontend && npm run build
cd ../backend && ./mvnw clean package
```

Configure required application credentials through your local environment; do not commit secrets.
