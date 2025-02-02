import { axiosInstance, API_URL } from './index'

export default {
  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/pricing`, { params: queryParams })
    return response.data
  },

  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/pricing`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/pricing/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/pricing/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/pricing/${id}`)
    return response.data
  }
}
