import { defineStore } from 'pinia'
import { ref } from 'vue'
import itemService from '../../services/product/itemService'

export const useItemStore = defineStore('item', () => {
  // --- STATE ---
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })
  const item = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isLoaded = ref(false) // Prevents redundant fetching

  // --- ACTIONS ---
  /**
   * Fetch paginated list of items with optional filters
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    error.value = null // Reset errors

    // Skip API call if already loaded and not forcing refresh
    if (!forceRefresh && isLoaded.value) return

    try {
      isLoading.value = true
      const response = await itemService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to fetch items'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single item by ID
   */
  const fetchItemById = async (itemId) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await itemService.getById(itemId)
      item.value = response
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to fetch item'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new item
   */
  const createItem = async (itemData) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await itemService.create(itemData)

      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to create item'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing item
   */
  const updateItem = async (itemId, itemData) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await itemService.updateById(itemId, itemData)

      const index = items.value.data.findIndex((i) => i.id === itemId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to update item'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete an item by ID
   */
  const deleteItem = async (itemId) => {
    error.value = null

    try {
      isLoading.value = true
      await itemService.delete(itemId)

      items.value.data = items.value.data.filter((i) => i.id !== itemId)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to delete item'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the store (useful e.g. on logout)
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

  // --- RETURN STORE ---
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
