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

  // Controls
  const isLoading = ref(false)
  const isLoaded = ref(false) // Once fetched, mark loaded

  // Actions
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    // If we've already loaded data and aren't forcing a refresh, skip the API call
    if (!forceRefresh && isLoaded.value) {
      return
    }
    try {
      isLoading.value = true
      const response = await categoryGroupService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true // Mark store as having loaded data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category groups')
    } finally {
      isLoading.value = false
    }
  }

  const createItem = async (data) => {
    try {
      isLoading.value = true
      const response = await categoryGroupService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create category group')
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (id, data) => {
    try {
      isLoading.value = true
      const response = await categoryGroupService.updateById(id, data)
      const index = items.value.data.findIndex((g) => g.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update category group')
    } finally {
      isLoading.value = false
    }
  }

  const deleteItem = async (id) => {
    try {
      isLoading.value = true
      await categoryGroupService.delete(id)
      items.value.data = items.value.data.filter((g) => g.id !== id)
      items.value.total -= 1
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete category group')
    } finally {
      isLoading.value = false
    }
  }

  // Optional helper to reset store if you ever need to
  const resetStore = () => {
    items.value = {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
      data: []
    }
    isLoaded.value = false
    isLoading.value = false
  }

  return {
    items,
    isLoading,
    isLoaded,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    resetStore
  }
})
