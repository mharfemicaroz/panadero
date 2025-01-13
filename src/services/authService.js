import axios from 'axios'

// Determine the current origin
const API_URL = 'http://localhost:3000/api/auth'
const FRONTEND_ORIGIN = window.location.origin === 'http://localhost:5173'

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
