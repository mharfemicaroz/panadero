import { axiosInstance, API_URL } from './index'

export default {
  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/sales`, { params: queryParams })
    return response.data
  },

  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/sales`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/sales/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/sales/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/sales/${id}`)
    return response.data
  },

  async complete(id) {
    const response = await axiosInstance.put(`${API_URL}/sales/${id}/complete`)
    return response.data
  },

  async getTotalForShift(shiftId) {
    const response = await axiosInstance.get(`${API_URL}/sales/${shiftId}/total`)
    return response.data
  }
}
