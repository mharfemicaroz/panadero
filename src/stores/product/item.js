import { defineStore } from 'pinia'
import { ref } from 'vue'
import itemService from '../../services/product/itemService'

export const useItemStore = defineStore('item', () => {
  // State
  const items = ref([])
  const item = ref(null)

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      const response = await itemService.list(queryParams)
      items.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items')
    }
  }

  const fetchItemById = async (itemId) => {
    try {
      const response = await itemService.getById(itemId)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    }
  }

  const createItem = async (itemData) => {
    try {
      const response = await itemService.create(itemData)
      items.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item')
    }
  }

  const updateItem = async (itemId, itemData) => {
    try {
      const response = await itemService.updateById(itemId, itemData)
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
      await itemService.delete(itemId)
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
