import { axiosInstance, API_URL } from './index'

export default {
  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/orders`, { params: queryParams })
    return response.data
  },

  async create(data) {
    // data must include an `items` array (e.g., { user_id, customer_id, order_date, status, total_amount, items: [...] })
    // Note: When an order is completed, the inventory will be adjusted (order items quantities are deducted)
    const response = await axiosInstance.post(`${API_URL}/orders`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/orders/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/orders/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/orders/${id}`)
    return response.data
  },

  async complete(id) {
    const response = await axiosInstance.put(`${API_URL}/orders/${id}/complete`)
    return response.data
  }
}
