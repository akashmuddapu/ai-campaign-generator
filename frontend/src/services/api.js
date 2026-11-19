import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach authenticated user id if present in storage
api.interceptors.request.use(
  (config) => {
    try {
      const userId = localStorage.getItem('cg_user_id')
      if (userId && !config.headers['X-User-Id']) {
        config.headers['X-User-Id'] = userId
      }
    } catch {}
    return config
  },
  (error) => Promise.reject(error)
)

// Global response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response ? error.response.status : 500,
      message:
        (error.response && error.response.data && error.response.data.message) ||
        (error.response && error.response.data && error.response.data.error) ||
        error.message ||
        'An unexpected error occurred',
      data: error.response ? error.response.data : null,
    }
    return Promise.reject(customError)
  }
)

export default api
