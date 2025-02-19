import { defineStore } from 'pinia'
import { ref } from 'vue'
import branchService from '../services/branch/branchService'

export const useBranchStore = defineStore('branch', () => {
  // State
  const branches = ref([])
  const branch = ref(null)

  // Actions
  const fetchAll = async (queryParams) => {
    try {
      const response = await branchService.list(queryParams)
      branches.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch branches')
    }
  }

  const fetchById = async (id) => {
    try {
      const response = await branchService.getById(id)
      branch.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch branch')
    }
  }

  const create = async (data) => {
    try {
      const response = await branchService.create(data)
      branches.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create branch')
    }
  }

  const updateById = async (id, data) => {
    try {
      const response = await branchService.updateById(id, data)
      const index = branches.value.data.findIndex((b) => b.id === id)
      if (index !== -1) {
        branches.value.data[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update branch')
    }
  }

  const deleteById = async (id) => {
    try {
      await branchService.delete(id)
      branches.value = branches.value.data.filter((b) => b.id !== id)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete branch')
    }
  }

  return {
    branches,
    branch,
    fetchAll,
    fetchById,
    create,
    updateById,
    deleteById
  }
})
