// src/services/hr/employeeService.js
import { axiosInstance, API_URL } from './index'

export default {
  // When creating/updating an employee, include a "picture" property in the data
  // that is a Base64 encoded image string (e.g. "data:image/jpeg;base64,...")
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/employees`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/employees/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/employees/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/employees/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/employees`, { params: queryParams })
    return response.data
  }
}
