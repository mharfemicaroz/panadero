import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/hr/payrolls`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/hr/payrolls/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/hr/payrolls/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/hr/payrolls/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/hr/payrolls`, { params: queryParams })
    return response.data
  },

  async calculatePayroll(data) {
    const response = await axiosInstance.post(`${API_URL}/hr/payrolls/calculate`, data)
    return response.data
  },

  async generatePayroll(data) {
    const response = await axiosInstance.post(`${API_URL}/hr/payrolls/generate`, data)
    return response.data
  },

  async approvePayroll(id) {
    const response = await axiosInstance.post(`${API_URL}/hr/payrolls/${id}/approve`)
    return response.data
  },

  async markAsPaid(id) {
    const response = await axiosInstance.post(`${API_URL}/hr/payrolls/${id}/mark-paid`)
    return response.data
  }
}
