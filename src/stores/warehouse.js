import { defineStore } from 'pinia'
import { ref } from 'vue'
import warehouseService from '../services/warehouse/warehouseService'

export const useWarehouseStore = defineStore('warehouse', () => {
  // --- STATE ---
  const warehouses = ref([])
  const warehouse = ref(null)

  // Track loading and error states
  const isLoading = ref(false)
  const error = ref(null)

  // Mark if we already fetched data once (to skip re-fetch on subsequent uses)
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a paginated list of warehouses
   */
  const fetchAll = async (queryParams = {}, forceRefresh = false) => {
    // Reset previous error
    error.value = null

    // Skip API call if we've already loaded data once and not forcing a refresh
    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await warehouseService.list(queryParams)
      warehouses.value = response.data
      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch warehouses'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single warehouse by ID
   */
  const fetchById = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await warehouseService.getById(id)
      warehouse.value = response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch warehouse'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new warehouse
   */
  const create = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await warehouseService.create(data)
      warehouses.value.push(response)
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create warehouse'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing warehouse
   */
  const updateById = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await warehouseService.updateById(id, data)

      // Find and update warehouse in local store
      const index = warehouses.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        warehouses.value[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update warehouse'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a warehouse by ID
   */
  const deleteById = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await warehouseService.delete(id)

      // Remove from local store
      warehouses.value = warehouses.value.filter((w) => w.id !== id)
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete warehouse'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the store (useful e.g. on logout)
   */
  const resetStore = () => {
    warehouses.value = []
    warehouse.value = null
    isLoading.value = false
    error.value = null
    isLoaded.value = false
  }

  return {
    warehouses,
    warehouse,
    isLoading,
    error,
    isLoaded,
    fetchAll,
    fetchById,
    create,
    updateById,
    deleteById,
    resetStore
  }
})
