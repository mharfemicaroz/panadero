import { axiosInstance, API_URL } from './index'

export default {
  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/stock-transfers`, { params: queryParams })
    return response.data
  },

  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/stock-transfers`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/stock-transfers/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/stock-transfers/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/stock-transfers/${id}`)
    return response.data
  },

  async complete(id) {
    const response = await axiosInstance.put(`${API_URL}/stock-transfers/${id}/complete`)
    return response.data
  }
}
