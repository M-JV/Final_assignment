// bloggy-client/src/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

api.interceptors.request.use(async config => {
  // make sure this is `/api/csrf-token` (not `/csrf-token`)
  const { data } = await axios.get('/api/csrf-token', {
    withCredentials: true
  })
  config.headers['X-CSRF-Token'] = data.csrfToken
  return config
})

export default api
