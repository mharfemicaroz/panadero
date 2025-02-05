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
   * Add an `isLoading` boolean to control loading state.
   */
  const isLoading = ref(false)

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      isLoading.value = true // <-- start loading
      const response = await categoryService.list(queryParams)
      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams?.page || 1,
        pageSize: queryParams?.limit || 10,
        data: response.data || []
      })
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items')
    } finally {
      isLoading.value = false // <-- end loading
    }
  }

  const fetchItemById = async (itemId) => {
    try {
      // You can also set isLoading.value = true here if it’s a separate fetch
      const response = await categoryService.getById(itemId)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    } finally {
      // isLoading.value = false
    }
  }

  const createItem = async (itemData) => {
    try {
      // If you also want to show loading for create, set isLoading.value = true
      const response = await categoryService.create(itemData)
      items.value.data.push(response)
      items.value.total += 1
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item')
    } finally {
      // isLoading.value = false
    }
  }

  const updateItem = async (itemId, itemData) => {
    try {
      // isLoading.value = true
      const response = await categoryService.updateById(itemId, itemData)
      const index = items.value.data.findIndex((s) => s.id === itemId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item')
    } finally {
      // isLoading.value = false
    }
  }

  const deleteItem = async (itemId) => {
    try {
      // isLoading.value = true
      await categoryService.delete(itemId)
      items.value.data = items.value.data.filter((s) => s.id !== itemId)
      items.value.total -= 1
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item')
    } finally {
      // isLoading.value = false
    }
  }

  const showAllItems = async (queryParams) => {
    try {
      isLoading.value = true
      const response = await categoryService.showAll(queryParams)
      items.value = {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1,
        pageSize: response.pageSize || queryParams?.limit || 10,
        data: response.data || []
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to show all items')
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    item,
    isLoading, // <-- export this so we can use it in the component
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    showAllItems
  }
})
