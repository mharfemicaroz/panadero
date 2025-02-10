// services/product/itemService.js
import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/items`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/items/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/items/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/items/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/items?warehouse_id=1`, {
      params: queryParams
    })
    return response.data
  },

  // New method to list items with their stock movement history
  async listWithHistory(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/items/with-history`, {
      params: queryParams
    })
    return response.data
  }
}
