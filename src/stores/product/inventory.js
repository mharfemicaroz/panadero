import { defineStore } from 'pinia'
import { ref } from 'vue'
import inventoryService from '../../services/product/inventoryService'

export const useInventoryStore = defineStore('inventory', () => {
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

  // Mark if we already fetched data once (to avoid unnecessary calls)
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a paginated list of inventory records with optional filters.
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    error.value = null

    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await inventoryService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch inventory records'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single inventory record by ID.
   */
  const fetchItemById = async (itemId) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await inventoryService.getById(itemId)
      item.value = response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch inventory record'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new inventory record.
   */
  const createItem = async (itemData) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await inventoryService.create(itemData)

      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create inventory record'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an inventory record.
   */
  const updateItem = async (itemId, itemData) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await inventoryService.updateById(itemId, itemData)

      const index = items.value.data.findIndex((inv) => inv.id === itemId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update inventory record'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete an inventory record.
   */
  const deleteItem = async (itemId) => {
    error.value = null

    try {
      isLoading.value = true
      await inventoryService.delete(itemId)

      items.value.data = items.value.data.filter((inv) => inv.id !== itemId)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete inventory record'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Adjust inventory quantity: expects `quantityChange` (positive for stock IN, negative for stock OUT).
   */
  const adjustItemQuantity = async (itemId, quantityChange) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await inventoryService.adjustQuantity(itemId, quantityChange)

      const index = items.value.data.findIndex((inv) => inv.id === itemId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to adjust inventory quantity'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the store (useful e.g. on logout).
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
    isLoading.value = false
    error.value = null
    isLoaded.value = false
  }

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
    adjustItemQuantity,
    resetStore
  }
})
