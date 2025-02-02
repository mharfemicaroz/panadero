import { defineStore } from 'pinia'
import { ref } from 'vue'
import reportService from '../../services/product/reportService'

export const useReportStore = defineStore('report', () => {
  // State
  const stockMovements = ref([])
  const warehouseUtilization = ref([])
  const inventorySummary = ref([])

  // Actions
  const fetchStockMovements = async (queryParams) => {
    try {
      const response = await reportService.getStockMovements(queryParams)
      stockMovements.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stock movements')
    }
  }

  const fetchWarehouseUtilization = async (queryParams) => {
    try {
      const response = await reportService.getWarehouseUtilization(queryParams)
      warehouseUtilization.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch warehouse utilization')
    }
  }

  const fetchInventorySummary = async (queryParams) => {
    try {
      const response = await reportService.getInventorySummary(queryParams)
      inventorySummary.value = response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory summary')
    }
  }

  return {
    stockMovements,
    warehouseUtilization,
    inventorySummary,
    fetchStockMovements,
    fetchWarehouseUtilization,
    fetchInventorySummary
  }
})
