import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/inventory`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/inventory/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/inventory/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/inventory/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/inventory`, { params: queryParams })
    return response.data
  },

  async adjustQuantity(id, quantityChange) {
    const response = await axiosInstance.patch(`${API_URL}/inventory/${id}/adjust-quantity`, {
      quantityChange
    })
    return response.data
  }
}
