import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerService from '../services/customer/customerService'

export const useCustomerStore = defineStore('customer', () => {
  // State
  const items = ref([])
  const item = ref(null)

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      const response = await customerService.list(queryParams)
      items.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items')
    }
  }

  const fetchItemById = async (id) => {
    try {
      const response = await customerService.getById(id)
      item.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item')
    }
  }

  const createItem = async (data) => {
    try {
      const response = await customerService.create(data)
      items.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item')
    }
  }

  const updateItem = async (id, data) => {
    try {
      const response = await customerService.updateById(id, data)
      const index = items.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        items.value[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item')
    }
  }

  const deleteItem = async (id) => {
    try {
      await customerService.delete(id)
      items.value = items.value.filter((c) => c.id !== id)
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
