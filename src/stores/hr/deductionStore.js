import { defineStore } from 'pinia'
import { ref } from 'vue'
import deductionService from '../../services/hr/deductionService'

export const useDeductionStore = defineStore('deduction', () => {
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
      const response = await deductionService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch deductions'
    } finally {
      isLoading.value = false
    }
  }

  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await deductionService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create deduction'
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await deductionService.updateById(id, data)
      const index = items.value.data.findIndex((g) => g.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update deduction'
    } finally {
      isLoading.value = false
    }
  }

  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await deductionService.delete(id)
      items.value.data = items.value.data.filter((g) => g.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete deduction'
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
    resetStore
  }
})
