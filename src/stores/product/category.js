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

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      const response = await categoryService.list(queryParams)

      // Ensure reactivity by using Object.assign
      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams?.page || 1, // Ensure the requested page is set
        pageSize: queryParams?.limit || 10,
        data: response.data || []
      })
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items')
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

  const showAllItems = async (queryParams) => {
    try {
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
    }
  }

  return {
    items,
    item,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    showAllItems
  }
})
