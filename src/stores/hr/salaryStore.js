import { defineStore } from 'pinia'
import { ref } from 'vue'
import salaryService from '../../services/hr/salaryService'

export const useSalaryStore = defineStore('salary', () => {
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
      const response = await salaryService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch salary records'
    } finally {
      isLoading.value = false
    }
  }

  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await salaryService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create salary record'
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await salaryService.updateById(id, data)
      const index = items.value.data.findIndex((g) => g.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update salary record'
    } finally {
      isLoading.value = false
    }
  }

  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await salaryService.delete(id)
      items.value.data = items.value.data.filter((g) => g.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete salary record'
    } finally {
      isLoading.value = false
    }
  }

  const getCurrentSalary = async (employeeId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await salaryService.getCurrentSalary(employeeId)
      return response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch current salary'
    } finally {
      isLoading.value = false
    }
  }

  const getSalaryHistory = async (employeeId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await salaryService.getSalaryHistory(employeeId)
      return response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch salary history'
    } finally {
      isLoading.value = false
    }
  }

  const calculateRates = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await salaryService.calculateRates(data)
      return response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to calculate salary rates'
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
    getCurrentSalary,
    getSalaryHistory,
    calculateRates,
    resetStore
  }
})
