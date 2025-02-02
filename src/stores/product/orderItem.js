import { defineStore } from 'pinia'
import { ref } from 'vue'
import orderItemService from '../../services/product/orderItemService'

export const useOrderItemStore = defineStore('orderItem', () => {
  // State
  const items = ref([])
  const item = ref(null)

  // Actions
  const fetchItemById = async (itemId) => {
    try {
      const response = await orderItemService.getById(itemId)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    }
  }

  const updateItem = async (itemId, itemData) => {
    try {
      const response = await orderItemService.updateById(itemId, itemData)
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
      await orderItemService.delete(itemId)
      items.value = items.value.filter((s) => s.id !== itemId)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  return {
    items,
    item,
    fetchItemById,
    updateItem,
    deleteItem
  }
})
