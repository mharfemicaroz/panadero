import { axiosInstance, API_URL } from './index'

export default {
  async getStockMovements(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/reports/stock-movements`, {
      params: queryParams
    })
    return response.data
  },

  async getWarehouseUtilization(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/reports/warehouse-utilization`, {
      params: queryParams
    })
    return response.data
  },

  async getInventorySummary(queryParams) {
    const response = await axiosInstance.get(`${API_URL}/reports/inventory-summary`, {
      params: queryParams
    })
    return response.data
  }
}
