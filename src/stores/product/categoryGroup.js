import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryGroupService from '../../services/product/categoryGroupService'

export const useCategoryGroupStore = defineStore('categoryGroup', () => {
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
   * Fetch a list of category groups
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
      const response = await categoryGroupService.list(queryParams)

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
      error.value = err?.response?.message || 'Failed to fetch category groups'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new category group
   */
  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await categoryGroupService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create category group'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing category group
   */
  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await categoryGroupService.updateById(id, data)
      const index = items.value.data.findIndex((g) => g.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update category group'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a category group by ID
   */
  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await categoryGroupService.delete(id)
      items.value.data = items.value.data.filter((g) => g.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete category group'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset store if you ever need to (e.g. on logout)
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

  // --- RETURN ---
  return {
    items,
    isLoading,
    error, // <-- export error so components can check or display it
    isLoaded,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    resetStore
  }
})
