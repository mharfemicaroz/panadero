import { axiosInstance, API_URL } from './index'

export default {
  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/subcategories`, { params: queryParams })
    return response.data
  },

  async listByCategory(categoryId, queryParams) {
    const response = await axiosInstance.get(`${API_URL}/categories/${categoryId}/subcategories`, {
      params: queryParams
    })
    return response.data
  },

  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/subcategories`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/subcategories/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/subcategories/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/subcategories/${id}`)
    return response.data
  }
}
