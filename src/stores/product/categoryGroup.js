import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryGroupService from '../../services/product/categoryGroupService'

export const useCategoryGroupStore = defineStore('categoryGroup', () => {
  // State
  const categoryGroups = ref([])
  const categoryGroup = ref(null)

  // Actions
  const fetchAll = async (queryParams) => {
    try {
      const response = await categoryGroupService.list(queryParams)
      categoryGroups.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category groups')
    }
  }

  const fetchById = async (id) => {
    try {
      const response = await categoryGroupService.getById(id)
      categoryGroup.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category group')
    }
  }

  const create = async (data) => {
    try {
      const response = await categoryGroupService.create(data)
      categoryGroups.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create category group')
    }
  }

  const updateById = async (id, data) => {
    try {
      const response = await categoryGroupService.updateById(id, data)
      const index = categoryGroups.value.findIndex((cg) => cg.id === id)
      if (index !== -1) {
        categoryGroups.value[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update category group')
    }
  }

  const deleteById = async (id) => {
    try {
      await categoryGroupService.delete(id)
      categoryGroups.value = categoryGroups.value.filter((cg) => cg.id !== id)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete category group')
    }
  }

  return {
    categoryGroups,
    categoryGroup,
    fetchAll,
    fetchById,
    create,
    updateById,
    deleteById
  }
})
