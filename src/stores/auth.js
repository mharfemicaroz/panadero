import { defineStore } from 'pinia'
import { ref } from 'vue'
import AuthService from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)

  // Actions
  const register = async (userData) => {
    try {
      const { name, email, password } = userData
      await AuthService.register(name, email, password)
      user.value = { name, email }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password)
      token.value = response.token
      localStorage.setItem('authToken', response.token)
      user.value = { name: response.name, email: response.email }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('authToken')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  const initializeAuth = () => {
    if (token.value) {
      verifyToken()
    }
  }

  const verifyToken = async () => {
    try {
      const response = await AuthService.verifyToken(token.value)
      user.value = response.user
    } catch (error) {
      logout()
    }
  }

  return {
    user,
    token,
    register,
    login,
    logout,
    isAuthenticated,
    initializeAuth,
    verifyToken
  }
})
