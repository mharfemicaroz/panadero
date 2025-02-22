// stores/hr/timeLogStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import timeLogService from '../../services/hr/timeLogService'

export const useTimeLogStore = defineStore('timeLog', () => {
  // --- STATE ---
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })

  const isLoading = ref(false)
  const error = ref(null)
  const isLoaded = ref(false)

  // --- ACTIONS ---

  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    error.value = null

    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await timeLogService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch time logs'
    } finally {
      isLoading.value = false
    }
  }

  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await timeLogService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create time log'
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await timeLogService.updateById(id, data)
      const index = items.value.data.findIndex((g) => g.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update time log'
    } finally {
      isLoading.value = false
    }
  }

  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await timeLogService.delete(id)
      items.value.data = items.value.data.filter((g) => g.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete time log'
    } finally {
      isLoading.value = false
    }
  }

  // Updated action to accept an object with type, base64Image, picturePath, etc.
  const recordTimeLog = async (employeeId, { type, base64Image, picturePath }) => {
    error.value = null
    try {
      isLoading.value = true
      // pass the entire payload to the service
      const response = await timeLogService.recordTimeLog(employeeId, {
        type,
        base64Image,
        picturePath
      })
      return response
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to record time log'
    } finally {
      isLoading.value = false
    }
  }

  const faceVerifyTimeLog = async (base64Image, type) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await timeLogService.faceVerifyTimeLog(base64Image, type)
      return response // { message, distance, employee, timeLog } or "No match found"
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to verify face'
    } finally {
      isLoading.value = false
    }
  }

  const getDailyLogs = async (employeeId, queryParams = {}, forceRefresh = false) => {
    error.value = null
    if (!forceRefresh && isLoaded.value) return
    try {
      isLoading.value = true
      const response = await timeLogService.getDailyLogs(employeeId, queryParams)
      items.value.total = response.total || 0
      items.value.totalPages = response.totalPages || 1
      items.value.currentPage = queryParams.page || 1
      items.value.pageSize = queryParams.limit || 10
      items.value.data = response.data || []
      isLoaded.value = true
    } catch (err) {
      console.error(err)
      error.value = err?.response?.message || 'Failed to fetch daily logs'
    } finally {
      isLoading.value = false
    }
  }

  const resetStore = () => {
    items.value = {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
      data: []
    }
    isLoaded.value = false
    isLoading.value = false
    error.value = null
  }

  // --- RETURN ---
  return {
    items,
    isLoading,
    error,
    isLoaded,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    recordTimeLog,
    faceVerifyTimeLog,
    getDailyLogs,
    resetStore
  }
})
