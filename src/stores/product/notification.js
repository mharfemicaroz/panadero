import { defineStore } from 'pinia'
import { ref } from 'vue'
import notificationService from '../../services/product/notificationService'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])

  // Actions
  const fetchNotifications = async (queryParams) => {
    try {
      const response = await notificationService.listNotifications(queryParams)
      notifications.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      const index = notifications.value.findIndex((n) => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index].read = true
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read')
    }
  }

  return {
    notifications,
    fetchNotifications,
    markAsRead
  }
})
