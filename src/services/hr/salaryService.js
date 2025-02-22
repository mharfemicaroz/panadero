import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/hr/salaries`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/hr/salaries/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/hr/salaries/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/hr/salaries/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/hr/salaries`, { params: queryParams })
    return response.data
  },

  async getCurrentSalary(employeeId) {
    const response = await axiosInstance.get(
      `${API_URL}/hr/salaries/employee/${employeeId}/current`
    )
    return response.data
  },

  async getSalaryHistory(employeeId) {
    const response = await axiosInstance.get(
      `${API_URL}/hr/salaries/employee/${employeeId}/history`
    )
    return response.data
  },

  async calculateRates(data) {
    const response = await axiosInstance.post(`${API_URL}/hr/salaries/calculate-rates`, data)
    return response.data
  }
}
