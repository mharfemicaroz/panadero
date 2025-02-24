import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/payrolls`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/payrolls/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/payrolls/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/payrolls/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/payrolls`, { params: queryParams })
    return response.data
  },

  async calculatePayroll(data) {
    const response = await axiosInstance.post(`${API_URL}/payrolls/calculate`, data)
    return response.data
  },

  async generatePayroll(data) {
    const response = await axiosInstance.post(`${API_URL}/payrolls/generate`, data)
    return response.data
  },

  async approvePayroll(id) {
    const response = await axiosInstance.post(`${API_URL}/payrolls/${id}/approve`)
    return response.data
  },

  async markAsPaid(id, data) {
    const response = await axiosInstance.post(`${API_URL}/payrolls/${id}/mark-paid`, data)
    return response.data
  }
}
