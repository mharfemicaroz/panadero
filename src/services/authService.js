import axios from 'axios'

// Determine the current origin
const API_URL = 'https://panadero-server.area51.ph/api/auth'
const FRONTEND_ORIGIN =
  window.location.origin === 'http://localhost:8081' ||
  window.location.origin === 'https://panadero.area51.ph'
    ? window.location.origin
    : 'http://localhost:8081'

export default {
  async register(name, email, password) {
    if (!password) throw new Error('Password is required')
    const response = await axios.post(
      `${API_URL}/register`,
      {
        name,
        email,
        password
      },
      {
        headers: {
          Origin: FRONTEND_ORIGIN
        }
      }
    )
    return response.data
  },
  async login(email, password) {
    const response = await axios.post(
      `${API_URL}/login`,
      { email, password },
      {
        headers: {
          Origin: FRONTEND_ORIGIN
        }
      }
    )
    return response.data
  },
  async verifyToken(token) {
    const response = await axios.post(
      `${API_URL}/verify-token`,
      { token },
      {
        headers: {
          Origin: FRONTEND_ORIGIN
        }
      }
    )
    return response.data
  }
}
