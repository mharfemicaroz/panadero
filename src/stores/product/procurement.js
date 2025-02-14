import { defineStore } from 'pinia'
import { ref } from 'vue'
import procurementService from '../../services/product/procurementService'

export const useProcurementStore = defineStore('procurement', () => {
  // --- STATE ---
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })
  const item = ref(null)

  // Track loading and error states
  const isLoading = ref(false)
  const error = ref(null)

  // Control to indicate data has been fetched at least once
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a list of procurements
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    // Clear any previous error
    error.value = null

    // Skip API call if data is already loaded and refresh is not forced
    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await procurementService.list(queryParams)
      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })
      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch procurements'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a procurement by ID
   */
  const fetchItemById = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await procurementService.getById(id)
      item.value = response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch procurement'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new procurement
   */
  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await procurementService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create procurement'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing procurement
   */
  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await procurementService.updateById(id, data)
      const index = items.value.data.findIndex((p) => p.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update procurement'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a procurement by ID
   */
  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await procurementService.delete(id)
      items.value.data = items.value.data.filter((p) => p.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete procurement'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark a procurement as complete
   */
  const completeItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await procurementService.complete(id)
      const index = items.value.data.findIndex((p) => p.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to complete procurement'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the procurement store (e.g., on logout)
   */
  const resetStore = () => {
    items.value = {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
      data: []
    }
    item.value = null
    isLoaded.value = false
    isLoading.value = false
    error.value = null
  }

  // --- RETURN ---
  return {
    items,
    item,
    isLoading,
    error,
    isLoaded,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    completeItem,
    resetStore
  }
})
