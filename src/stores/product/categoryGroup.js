import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryGroupService from '../../services/product/categoryGroupService'

export const useCategoryGroupStore = defineStore('categoryGroup', () => {
  // State
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })
  const item = ref(null)
  const isLoading = ref(false) // <-- Add the isLoading state

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      isLoading.value = true
      const response = await categoryGroupService.list(queryParams)
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
      isLoading.value = false
    }
  }

  const fetchItemById = async (itemId) => {
    try {
      // isLoading.value = true (optional if you want loading for single item)
      const response = await categoryGroupService.getById(itemId)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    } finally {
      // isLoading.value = false
    }
  }

  const createItem = async (itemData) => {
    try {
      // isLoading.value = true
      const response = await categoryGroupService.create(itemData)
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
      const response = await categoryGroupService.updateById(itemId, itemData)
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
      await categoryGroupService.delete(itemId)
      items.value.data = items.value.data.filter((s) => s.id !== itemId)
      items.value.total -= 1
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item')
    } finally {
      // isLoading.value = false
    }
  }

  return {
    items,
    item,
    isLoading, // <-- expose isLoading
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem
  }
})
