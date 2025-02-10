import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/stockmovements`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/stockmovements/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/stockmovements/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/stockmovements/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/stockmovements`, {
      params: queryParams
    })
    return response.data
  }
}
