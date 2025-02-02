import { defineStore } from 'pinia'
import { ref } from 'vue'
import warehouseService from '../services/warehouse/warehouseService'

export const useWarehouseStore = defineStore('warehouse', () => {
  // State
  const warehouses = ref([])
  const warehouse = ref(null)

  // Actions
  const fetchAll = async (queryParams) => {
    try {
      const response = await warehouseService.list(queryParams)
      warehouses.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch warehouses')
    }
  }

  const fetchById = async (id) => {
    try {
      const response = await warehouseService.getById(id)
      warehouse.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch warehouse')
    }
  }

  const create = async (data) => {
    try {
      const response = await warehouseService.create(data)
      warehouses.value.push(response)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create warehouse')
    }
  }

  const updateById = async (id, data) => {
    try {
      const response = await warehouseService.updateById(id, data)
      const index = warehouses.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        warehouses.value[index] = response
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update warehouse')
    }
  }

  const deleteById = async (id) => {
    try {
      await warehouseService.delete(id)
      warehouses.value = warehouses.value.filter((w) => w.id !== id)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete warehouse')
    }
  }

  return {
    warehouses,
    warehouse,
    fetchAll,
    fetchById,
    create,
    updateById,
    deleteById
  }
})
