import { defineStore } from 'pinia'
import { ref } from 'vue'
import pricingService from '../../services/product/pricingService'

export const usePricingStore = defineStore('pricing', () => {
  // State
  const items = ref([])
  const item = ref(null)

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      const response = await pricingService.list(queryParams)
      items.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items')
    }
  }

  const fetchItemById = async (itemId) => {
    try {
      const response = await pricingService.getById(itemId)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    }
  }

  const createItem = async (itemData) => {
    try {
      const response = await pricingService.create(itemData)
      items.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item')
    }
  }

  const updateItem = async (itemId, itemData) => {
    try {
      const response = await pricingService.updateById(itemId, itemData)
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
      await pricingService.delete(itemId)
      items.value = items.value.filter((s) => s.id !== itemId)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  return {
    items,
    item,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem
  }
})
