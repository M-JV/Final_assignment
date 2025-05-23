// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,      // needed for the CSRF cookie
});

// Before each request, get a fresh CSRF token
api.interceptors.request.use(async config => {
  const { data } = await axios.get('/api/csrf-token', { withCredentials: true });
  config.headers['X-CSRF-Token'] = data.csrfToken;
  return config;
});

export default api;
