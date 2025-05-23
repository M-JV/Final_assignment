// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// LOG every request URL
api.interceptors.request.use(request => {
  console.log(`→ [API] ${request.method.toUpperCase()} ${request.baseURL}${request.url}`);
  return request;
});

export default api;
