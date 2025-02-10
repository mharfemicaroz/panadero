import { defineStore } from 'pinia'
import { ref } from 'vue'
import subcategoryService from '../../services/product/subcategoryService'

export const useSubcategoryStore = defineStore('subcategory', () => {
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
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch all subcategories with pagination, sorting, and filtering
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    error.value = null

    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await subcategoryService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch subcategories'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch subcategories by category ID
   */
  const fetchByCategory = async (categoryId, queryParams = {}, forceRefresh = false) => {
    error.value = null

    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await subcategoryService.listByCategory(categoryId, queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch subcategories by category'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single subcategory by ID
   */
  const fetchById = async (id) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await subcategoryService.getById(id)
      item.value = response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch subcategory'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new subcategory
   */
  const createItem = async (data) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await subcategoryService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create subcategory'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing subcategory
   */
  const updateItem = async (id, data) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await subcategoryService.updateById(id, data)
      const index = items.value.data.findIndex((s) => s.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update subcategory'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a subcategory
   */
  const deleteItem = async (id) => {
    error.value = null

    try {
      isLoading.value = true
      await subcategoryService.delete(id)
      items.value.data = items.value.data.filter((s) => s.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete subcategory'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the store
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
    fetchByCategory,
    fetchById,
    createItem,
    updateItem,
    deleteItem,
    resetStore
  }
})
