import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import saleService from '../../services/product/saleService'

export const useProductSaleStore = defineStore('sale', () => {
  // State
  const items = ref([])
  const item = ref(null)

  const totalItems = ref(0)
  const pageSize = ref(10)

  const totalPages = ref(1)

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      const response = await saleService.list(queryParams)
      items.value = response
      totalItems.value = response.total
      totalPages.value = response.totalPages
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items')
    }
  }

  const fetchItemById = async (itemId) => {
    try {
      const response = await saleService.getById(itemId)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    }
  }

  const createItem = async (itemData) => {
    try {
      const response = await saleService.create(itemData)
      items.value = response
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item')
    }
  }

  const updateItem = async (itemId, itemData) => {
    try {
      const response = await saleService.updateById(itemId, itemData)
      const index = items.value.findIndex((s) => s.id === itemId)
      if (index !== -1) {
        items.value[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item')
    }
  }

  const deleteItem = async (itemId) => {
    try {
      await saleService.delete(itemId)
      items.value = items.value.filter((s) => s.id !== itemId)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  const completeItem = async (itemId) => {
    try {
      const response = await saleService.complete(itemId)
      const index = items.value.findIndex((s) => s.id === itemId)
      if (index !== -1) {
        items.value[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete item')
    }
  }

  return {
    items,
    item,
    totalItems,
    totalPages,
    pageSize,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    completeItem
  }
})
