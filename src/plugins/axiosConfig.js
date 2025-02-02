import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// Determine the current origin
const API_BASE_URL = 'http://localhost:3000/api/'
const FRONTEND_ORIGIN =
  window.location.origin === 'http://localhost:8081' ||
  window.location.origin === 'https://panadero.area51.ph'
    ? window.location.origin
    : 'http://localhost:5173'

// Create the Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Origin: FRONTEND_ORIGIN
  }
})

// Add a request interceptor to include the Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore() // Access the Pinia auth store
    const token = authStore.token // Retrieve the token from the store
    if (token) {
      config.headers.Authorization = `Bearer ${token}` // Add the Bearer token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Export the Axios instance
export default axiosInstance
