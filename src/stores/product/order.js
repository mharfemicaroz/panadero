import { defineStore } from 'pinia'
import { ref } from 'vue'
import orderService from '../../services/product/orderService'

export const useOrderStore = defineStore('order', () => {
  // State
  const items = ref([])
  const item = ref(null)

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      const response = await orderService.list(queryParams)
      items.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items')
    }
  }

  const fetchItemById = async (itemId) => {
    try {
      const response = await orderService.getById(itemId)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    }
  }

  const createItem = async (itemData) => {
    try {
      const response = await orderService.create(itemData)
      items.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item')
    }
  }

  const updateItem = async (itemId, itemData) => {
    try {
      const response = await orderService.updateById(itemId, itemData)
      const index = items.value.findIndex((o) => o.id === itemId)
      if (index !== -1) {
        items.value[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item')
    }
  }

  const deleteItem = async (itemId) => {
    try {
      await orderService.delete(itemId)
      items.value = items.value.filter((o) => o.id !== itemId)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  const completeItem = async (itemId) => {
    try {
      const response = await orderService.completeOrder(itemId)
      const index = items.value.findIndex((o) => o.id === itemId)
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
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    completeItem
  }
})
