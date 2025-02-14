import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplierService from '../../services/product/supplierService'

export const useSupplierStore = defineStore('supplier', () => {
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

  // Control to indicate we've fetched data once already
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a list of suppliers
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    // Clear any old error
    error.value = null

    // Skip API call if data is already loaded and refresh is not forced
    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await supplierService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch suppliers'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a supplier by ID
   */
  const fetchItemById = async (itemId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await supplierService.getById(itemId)
      item.value = response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch supplier'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new supplier
   */
  const createItem = async (itemData) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await supplierService.create(itemData)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create supplier'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing supplier
   */
  const updateItem = async (itemId, itemData) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await supplierService.updateById(itemId, itemData)
      const index = items.value.data.findIndex((s) => s.id === itemId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update supplier'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a supplier by ID
   */
  const deleteItem = async (itemId) => {
    error.value = null
    try {
      isLoading.value = true
      await supplierService.delete(itemId)
      items.value.data = items.value.data.filter((s) => s.id !== itemId)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete supplier'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the supplier store (e.g., on logout)
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
    resetStore
  }
})
