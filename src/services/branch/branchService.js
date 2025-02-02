import axiosInstance from '../../plugins/axiosConfig'

export default {
  async create(data) {
    const response = await axiosInstance.post(`/branch`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`/branch/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`/branch/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/branch/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`/branch`, { params: queryParams })
    return response.data
  }
}
