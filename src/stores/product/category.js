import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryService from '../../services/product/categoryService'

export const useProductCategoryStore = defineStore('productCategory', () => {
  // State
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })
  const item = ref(null)

  /**
   * Controls
   */
  const isLoading = ref(false)
  const isLoaded = ref(false) // <-- Once data is fetched, mark true

  // Actions
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    // If data is already loaded and we're NOT forcing a refresh, skip the API call
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

      isLoaded.value = true // Mark as loaded
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items')
    } finally {
      isLoading.value = false
    }
  }

  const fetchItemById = async (itemId) => {
    try {
      const response = await categoryService.getById(itemId)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    }
  }

  const createItem = async (itemData) => {
    try {
      const response = await categoryService.create(itemData)
      // Upsert to local state
      items.value.data.push(response)
      items.value.total += 1
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item')
    }
  }

  const updateItem = async (itemId, itemData) => {
    try {
      const response = await categoryService.updateById(itemId, itemData)
      const index = items.value.data.findIndex((s) => s.id === itemId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item')
    }
  }

  const deleteItem = async (itemId) => {
    try {
      await categoryService.delete(itemId)
      items.value.data = items.value.data.filter((s) => s.id !== itemId)
      items.value.total -= 1
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  // Optional helper to reset store state
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
    isLoaded.value = false
  }

  return {
    items,
    item,
    isLoading,
    isLoaded,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    resetStore
  }
})
