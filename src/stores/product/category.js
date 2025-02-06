import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryService from '../../services/product/categoryService'

export const useProductCategoryStore = defineStore('productCategory', () => {
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

  // Mark if we already fetched data once (to skip re-fetch on subsequent uses)
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a list of categories
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    // Reset any previous error
    error.value = null

    // Skip API call if we've already loaded data once and not forcing a refresh
    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await categoryService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      // Capture the error in the store state
      error.value = err?.response?.message || 'Failed to fetch categories'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single category by ID
   */
  const fetchItemById = async (itemId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await categoryService.getById(itemId)
      item.value = response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch item'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new category
   */
  const createItem = async (itemData) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await categoryService.create(itemData)
      // Append the new item to our store list
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create category'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing category
   */
  const updateItem = async (itemId, itemData) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await categoryService.updateById(itemId, itemData)

      // If found, replace the existing item
      const index = items.value.data.findIndex((cat) => cat.id === itemId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update category'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a category by ID
   */
  const deleteItem = async (itemId) => {
    error.value = null
    try {
      isLoading.value = true
      await categoryService.delete(itemId)

      // Remove from local store
      items.value.data = items.value.data.filter((cat) => cat.id !== itemId)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete category'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Show all items (using the showAll endpoint)
   *
   * This action calls the categoryService.showAll method, which returns all categories
   * with their products and subcategories. It then maps the nested `categories` array
   * to the store's `data` property.
   */
  const showAllItems = async (queryParams = {}) => {
    // Reset error before new request
    error.value = null

    try {
      isLoading.value = true
      const response = await categoryService.showAll(queryParams)

      // Map the response to the store state.
      // Note: the server returns `data: { categories: [...] }`
      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1,
        pageSize: response.pageSize || 10,
        data: response.data || []
      })
    } catch (err) {
      error.value = err?.response?.message || 'Failed to show all items'
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

  // Return everything we need
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
    showAllItems,
    resetStore
  }
})
