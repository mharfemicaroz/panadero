import { axiosInstance, API_URL } from './index'

export default {
  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/returns`, { params: queryParams })
    return response.data
  },

  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/returns`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/returns/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/returns/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/returns/${id}`)
    return response.data
  },

  async complete(id) {
    const response = await axiosInstance.put(`${API_URL}/returns/${id}/complete`)
    return response.data
  }
}
