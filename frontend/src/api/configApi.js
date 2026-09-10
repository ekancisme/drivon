// frontend/src/api/configApi.js
const isDev = process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost' && window.location.port === '3000';
export const API_URL = isDev ? "http://localhost:8080/api" : "/api";