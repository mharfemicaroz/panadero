import { axiosInstance, API_URL } from './index'

export default {
  async listNotifications(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/notifications`, { params: queryParams })
    return response.data
  },

  async markAsRead(notificationId) {
    const response = await axiosInstance.put(`${API_URL}/notifications/${notificationId}/read`)
    return response.data
  }
}
