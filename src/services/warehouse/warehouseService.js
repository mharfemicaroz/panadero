import axiosInstance from '../../plugins/axiosConfig'

export default {
  async create(data) {
    const response = await axiosInstance.post(`/warehouse`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`/warehouse/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`/warehouse/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/warehouse/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`/warehouse`, { params: queryParams })
    return response.data
  }
}
