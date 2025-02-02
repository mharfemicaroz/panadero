import axiosInstance from '../../plugins/axiosConfig'

export default {
  async create(data) {
    const response = await axiosInstance.post(`/customer`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`/customer/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`/customer/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/customer/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`/customer`, { params: queryParams })
    return response.data
  }
}
