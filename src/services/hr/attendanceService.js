import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/hr/attendances`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/hr/attendances/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/hr/attendances/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/hr/attendances/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/hr/attendances`, { params: queryParams })
    return response.data
  },

  async getDailyAttendance(employeeId) {
    const response = await axiosInstance.get(`${API_URL}/hr/attendances/daily/${employeeId}`)
    return response.data
  },

  async computeAttendance(employeeId) {
    const response = await axiosInstance.post(`${API_URL}/hr/attendances/compute/${employeeId}`)
    return response.data
  }
}
