import { axiosInstance, API_URL } from './index'

export default {
  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/order-items/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/order-items/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/order-items/${id}`)
    return response.data
  }
}
