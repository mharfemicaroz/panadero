import { defineStore } from 'pinia'
import { ref } from 'vue'
import subcategoryService from '../../services/product/subcategoryService'

export const useSubcategoryStore = defineStore('subcategory', () => {
  // State
  const subcategories = ref([])
  const subcategory = ref(null)

  // Actions
  const fetchItems = async (queryParams) => {
    try {
      const response = await subcategoryService.list(queryParams)
      subcategories.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subcategories')
    }
  }

  const fetchByCategory = async (categoryId, queryParams) => {
    try {
      const response = await subcategoryService.listByCategory(categoryId, queryParams)
      subcategories.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subcategories by category')
    }
  }

  const fetchById = async (id) => {
    try {
      const response = await subcategoryService.getById(id)
      subcategory.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subcategory')
    }
  }

  const createItem = async (data) => {
    try {
      const response = await subcategoryService.create(data)
      subcategories.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create subcategory')
    }
  }

  const updateItem = async (id, data) => {
    try {
      const response = await subcategoryService.updateById(id, data)
      const index = subcategories.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subcategories.value[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update subcategory')
    }
  }

  const deleteItem = async (id) => {
    try {
      await subcategoryService.delete(id)
      subcategories.value = subcategories.value.filter((s) => s.id !== id)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete subcategory')
    }
  }

  return {
    subcategories,
    subcategory,
    fetchItems,
    fetchByCategory,
    fetchById,
    createItem,
    updateItem,
    deleteItem
  }
})
