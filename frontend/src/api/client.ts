// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  // Vite uses import.meta.env; Webpack/CRA uses process.env
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;