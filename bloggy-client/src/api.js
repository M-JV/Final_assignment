// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,      // send cookies on cross-site requests
});

// before each API request, fetch a fresh CSRF token
api.interceptors.request.use(async config => {
  const { data } = await axios.get('/api/csrf-token', {
    withCredentials: true
  });
  config.headers['X-CSRF-Token'] = data.csrfToken;
  return config;
});

export default api;
