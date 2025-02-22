import { defineStore } from 'pinia'
import { ref } from 'vue'
import leaveBalanceService from '../../services/hr/leaveBalanceService'

export const useLeaveBalanceStore = defineStore('leaveBalance', () => {
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
      const response = await leaveBalanceService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch leave balances'
    } finally {
      isLoading.value = false
    }
  }

  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await leaveBalanceService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create leave balance'
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await leaveBalanceService.updateById(id, data)
      const index = items.value.data.findIndex((g) => g.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update leave balance'
    } finally {
      isLoading.value = false
    }
  }

  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await leaveBalanceService.delete(id)
      items.value.data = items.value.data.filter((g) => g.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete leave balance'
    } finally {
      isLoading.value = false
    }
  }

  const getEmployeeLeaveBalance = async (employeeId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await leaveBalanceService.getEmployeeLeaveBalance(employeeId)
      return response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch employee leave balance'
    } finally {
      isLoading.value = false
    }
  }

  const carryForward = async (employeeId, leaveTypeId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await leaveBalanceService.carryForward(employeeId, leaveTypeId)
      return response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to carry forward leave balance'
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
    getEmployeeLeaveBalance,
    carryForward,
    resetStore
  }
})
