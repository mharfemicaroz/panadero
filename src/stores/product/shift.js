import { defineStore } from 'pinia'
import { ref } from 'vue'
import shiftService from '../../services/product/shiftService'

export const useShiftStore = defineStore('shift', () => {
  // --- STATE ---
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })

  // Track loading and error states
  const isLoading = ref(false)
  const error = ref(null)

  // Control to indicate we've fetched data at least once already
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a list of shifts
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    error.value = null
    if (!forceRefresh && isLoaded.value) {
      return
    }
    try {
      isLoading.value = true
      const response = await shiftService.list(queryParams)
      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })
      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch shifts'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new shift and return the created object.
   */
  const createItem = async (data) => {
    error.value = null
    let response
    try {
      isLoading.value = true
      response = await shiftService.create(data)
      items.value.data.push(response)
      items.value.total += 1
      return response // <--- Return the new shift here
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create shift'
      throw err // Rethrow so the calling component can catch it.
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing shift.
   */
  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await shiftService.updateById(id, data)
      const index = items.value.data.findIndex((item) => item.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
      return response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update shift'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a shift by ID.
   */
  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await shiftService.delete(id)
      items.value.data = items.value.data.filter((item) => item.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete shift'
      throw err
    } finally {
      isLoading.value = false
    }
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
    deleteItem
  }
})
