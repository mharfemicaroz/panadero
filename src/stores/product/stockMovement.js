import { defineStore } from 'pinia'
import { ref } from 'vue'
import stockMovementService from '../../services/product/stockMovementService'

export const useStockMovementStore = defineStore('stockMovement', () => {
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

  // Control to indicate we've fetched data once already
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a list of stock movements.
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    // Clear any old error
    error.value = null

    // Skip API if data already loaded and not forcing refresh
    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await stockMovementService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      // Capture error in store instead of throwing
      error.value = err?.response?.data?.message || 'Failed to fetch stock movements'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new stock movement.
   */
  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await stockMovementService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to create stock movement'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing stock movement.
   */
  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await stockMovementService.updateById(id, data)
      const index = items.value.data.findIndex((item) => item.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to update stock movement'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a stock movement by ID.
   */
  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await stockMovementService.delete(id)
      items.value.data = items.value.data.filter((item) => item.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to delete stock movement'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the store (e.g. on logout)
   */
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

  // --- RETURN STORE ---
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
