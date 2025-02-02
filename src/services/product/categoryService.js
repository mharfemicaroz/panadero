import { axiosInstance, API_URL } from './index'

export default {
  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/categories`, { params: queryParams })
    return response.data
  },

  async showAll(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/categories/showall`, {
      params: queryParams
    })
    return response.data
  },

  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/categories`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/categories/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/categories/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/categories/${id}`)
    return response.data
  }
}
