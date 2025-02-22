import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/leaves/requests`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/leaves/requests/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/leaves/requests/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/leaves/requests/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/leaves/requests`, {
      params: queryParams
    })
    return response.data
  },

  async reject(id, reason) {
    const response = await axiosInstance.post(`${API_URL}/leaves/requests/${id}/reject`, {
      reason
    })
    return response.data
  },

  async escalate(id, approverId) {
    const response = await axiosInstance.post(`${API_URL}/leaves/requests/${id}/escalate`, {
      approver_id: approverId
    })
    return response.data
  }
}
