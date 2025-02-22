// services/hr/timeLogService.js

import { axiosInstance, API_URL } from './index'

export default {
  async create(data) {
    const response = await axiosInstance.post(`${API_URL}/timelogs`, data)
    return response.data
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/timelogs/${id}`)
    return response.data
  },

  async updateById(id, data) {
    const response = await axiosInstance.put(`${API_URL}/timelogs/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/timelogs/${id}`)
    return response.data
  },

  async list(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/timelogs`, { params: queryParams })
    return response.data
  },

  // Updated method to accept an object payload
  // (including type, base64Image, and picturePath).
  async recordTimeLog(employeeId, payload) {
    // Example payload structure:
    // {
    //   type: 'time_in' | 'time_out',
    //   base64Image: 'data:image/jpeg;base64,...',
    //   picturePath: '/uploads/employees/employee_xxx.jpg'
    // }
    const response = await axiosInstance.post(`${API_URL}/timelogs/record/${employeeId}`, payload)
    return response.data
  },

  async getDailyLogs(employeeId, queryParams) {
    const response = await axiosInstance.get(`${API_URL}/timelogs/daily/${employeeId}`, {
      params: queryParams
    })
    return response.data
  },

  async faceVerifyTimeLog(base64Image, type) {
    // This calls our new endpoint
    const response = await axiosInstance.post(`${API_URL}/timelogs/face-verify`, {
      base64Image,
      type
    })
    return response.data
  }
}
