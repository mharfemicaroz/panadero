import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// 🔹 Define API and Frontend origins
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const ALLOWED_ORIGINS = new Set(import.meta.env.VITE_ALLOWED_ORIGINS?.split(','))
const FRONTEND_ORIGIN = ALLOWED_ORIGINS.has(window.location.origin)
  ? window.location.origin
  : import.meta.env.VITE_FALLBACK_ORIGIN || ''

// 🔹 Create Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { Origin: FRONTEND_ORIGIN }
})

// 🔹 Request Interceptor: Attach Bearer Token
axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 🔹 Response Interceptor: Handle Token Expiry & Refresh
axiosInstance.interceptors.response.use(
  (response) => response, // Pass valid responses
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config

    // 🔥 If 401 (Unauthorized), attempt to refresh token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // Prevent infinite loops

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: authStore.refreshToken // Send refresh token
        })

        // ✅ Update token and retry failed request
        authStore.token = refreshResponse.data.accessToken
        localStorage.setItem('authToken', authStore.token)
        originalRequest.headers.Authorization = `Bearer ${authStore.token}`

        return axiosInstance(originalRequest) // 🔄 Retry failed request
      } catch (refreshError) {
        // authStore.logout() // ❌ If refresh fails, force logout
      }
    }

    return Promise.reject(error) // Pass other errors
  }
)

export default axiosInstance
