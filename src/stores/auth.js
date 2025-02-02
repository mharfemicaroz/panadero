import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/plugins/axiosConfig'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const requires2FA = ref(false)
  const tempToken = ref(null)

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password })

      if (response.data.requires2FA) {
        console.log('✅ 2FA Required: Redirecting to OTP Page') // Debugging
        requires2FA.value = true
        tempToken.value = response.data.tempToken
        localStorage.setItem('requires2FA', 'true')
        localStorage.setItem('tempToken', tempToken.value)
        router.push('/otp')
        return
      }

      // Normal login without 2FA
      token.value = response.data.accessToken
      refreshToken.value = response.data.refreshToken
      localStorage.setItem('authToken', token.value)
      localStorage.setItem('refreshToken', refreshToken.value)
      user.value = {
        id: response.data.userdata.id,
        email: response.data.userdata.email,
        role: response.data.userdata.role,
        twoFAEnabled: response.data.userdata.twoFAEnabled
      }
      router.push('/dashboard')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      console.error('Login Error:', errorMessage) // Debugging

      throw new Error(errorMessage)
    }
  }

  const verify2FA = async (otp) => {
    try {
      const response = await axios.post('/auth/verify-2fa', {
        otp,
        tempToken: localStorage.getItem('tempToken')
      })

      token.value = response.data.accessToken
      refreshToken.value = response.data.refreshToken
      localStorage.setItem('authToken', token.value)
      localStorage.setItem('refreshToken', refreshToken.value)

      user.value = {
        id: response.data.userdata.id,
        email: response.data.userdata.email,
        role: response.data.userdata.role,
        twoFAEnabled: response.data.userdata.twoFAEnabled
      }

      requires2FA.value = false
      tempToken.value = null
      localStorage.removeItem('requires2FA')
      localStorage.removeItem('tempToken')

      router.push('/dashboard')
    } catch (error) {
      console.error('❌ 2FA Verification Error:', error.response?.data) // Debugging
      throw new Error('Invalid OTP')
    }
  }

  const enable2FA = async (id) => {
    try {
      const response = await axios.post('/auth/enable-2fa', { userId: id })
      console.log(response)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to enable 2FA')
    }
  }

  const disable2FA = async (id) => {
    try {
      await axios.post('/auth/disable-2fa', { userId: id })
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to disable 2FA')
    }
  }

  const logout = () => {
    token.value = null
    refreshToken.value = null
    user.value = null
    requires2FA.value = false
    tempToken.value = null

    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.setItem('logout', Date.now()) // Notify other tabs

    router.push({ name: 'login' })
  }

  const verifyToken = async () => {
    try {
      await axios.get('/auth/verify') // Ensure the token is valid
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('/auth/refresh', {
        refreshToken: refreshToken.value
      })

      token.value = response.data.accessToken
      localStorage.setItem('authToken', token.value)
    } catch (error) {
      throw new Error('Refresh token expired')
    }
  }

  // 🔹 Listen for logout event across tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'logout') {
      logout()
    }
  })

  return {
    user,
    token,
    refreshAccessToken,
    requires2FA,
    enable2FA,
    disable2FA,
    tempToken,
    login,
    logout,
    verify2FA,
    isAuthenticated: () => !!token.value
  }
})
