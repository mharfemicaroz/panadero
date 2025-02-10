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
  const subcategories = ref([]) // Holds subcategories for a selected category

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
    error.value = null

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

      items.value.data = items.value.data.filter((cat) => cat.id !== itemId)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete category'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch subcategories of a given category
   */
  const fetchSubcategoriesByCategory = async (categoryId, queryParams = {}) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await categoryService.listSubcategoriesByCategory(categoryId, queryParams)
      subcategories.value = response.data || []
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch subcategories'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Show all items (using the showAll endpoint)
   */
  const showAllItems = async (queryParams = {}) => {
    error.value = null

    try {
      isLoading.value = true
      const response = await categoryService.showAll(queryParams)

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
    subcategories.value = []
    isLoading.value = false
    error.value = null
    isLoaded.value = false
  }

  return {
    items,
    item,
    subcategories,
    isLoading,
    error,
    isLoaded,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    fetchSubcategoriesByCategory,
    showAllItems,
    resetStore
  }
})
