import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/leaves/balances`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/leaves/balances/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/leaves/balances/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/leaves/balances/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/leaves/balances`, {
      params: queryParams
    })
    return response.data
  },

  async getEmployeeLeaveBalance(employeeId) {
    const response = await axiosInstance.get(`${API_URL}/leaves/employee/${employeeId}/balance`)
    return response.data
  },

  async carryForward(employeeId, leaveTypeId) {
    const response = await axiosInstance.post(
      `${API_URL}/leaves/employee/${employeeId}/leave-type/${leaveTypeId}/carry-forward`
    )
    return response.data
  }
}
