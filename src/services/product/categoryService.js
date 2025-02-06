import { axiosInstance, API_URL } from './index'

export default {
  // Fetch paginated categories with optional filters
  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/categories`, { params: queryParams })
    return response.data
  },

  // Fetch all categories with related products and subcategories
  async showAll(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/categories/showall`, {
      params: queryParams
    })
    return response.data
  },

  // Create a new category
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/categories`, data)
    return response.data
  },

  // Fetch a single category by ID
  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/categories/${id}`)
    return response.data
  },

  // Update a category by ID
  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/categories/${id}`, data)
    return response.data
  },

  // Delete a category by ID
  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/categories/${id}`)
    return response.data
  },

  // Fetch subcategories by category ID
  async listSubcategoriesByCategory(categoryId, queryParams = {}) {
    const response = await axiosInstance.get(`${API_URL}/categories/${categoryId}/subcategories`, {
      params: queryParams
    })
    return response.data
  }
}
