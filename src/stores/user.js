import { defineStore } from 'pinia'
import { ref } from 'vue'
import userService from '../services/user/userService'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
  const user = ref(null)

  // Actions
  const fetchAll = async (queryParams) => {
    try {
      const response = await userService.list(queryParams)
      users.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  }

  const fetchById = async (id) => {
    try {
      const response = await userService.getById(id)
      user.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  }

  const create = async (data) => {
    try {
      const response = await userService.create(data)
      users.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  }

  const updateById = async (id, data) => {
    try {
      const response = await userService.updateById(id, data)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  }

  const deleteById = async (id) => {
    try {
      await userService.delete(id)
      users.value = users.value.filter((u) => u.id !== id)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  return {
    users,
    user,
    fetchAll,
    fetchById,
    create,
    updateById,
    deleteById
  }
})
