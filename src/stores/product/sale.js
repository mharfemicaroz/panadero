import { defineStore } from 'pinia'
import { ref } from 'vue'
import saleService from '../../services/product/saleService'

export const useProductSaleStore = defineStore('sale', () => {
  // --- STATE ---
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })
  const item = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isLoaded = ref(false) // Prevents redundant fetching

  // --- ACTIONS ---

  /**
   * Fetch paginated list of sales with optional filters.
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    error.value = null // Reset any previous error
    if (!forceRefresh && isLoaded.value) return

    try {
      isLoading.value = true
      const response = await saleService.list(queryParams)
      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })
      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to fetch sales'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single sale by ID.
   */
  const fetchItemById = async (saleId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await saleService.getById(saleId)
      item.value = response
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to fetch sale'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new sale.
   */
  const createItem = async (saleData) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await saleService.create(saleData)
      // Optionally add the new sale to the items list:
      items.value.data.push(response)
      items.value.total += 1
      return response
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to create sale'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing sale.
   */
  const updateItem = async (saleId, saleData) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await saleService.updateById(saleId, saleData)
      const index = items.value.data.findIndex((s) => s.id === saleId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to update sale'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a sale by ID.
   */
  const deleteItem = async (saleId) => {
    error.value = null
    try {
      isLoading.value = true
      await saleService.delete(saleId)
      items.value.data = items.value.data.filter((s) => s.id !== saleId)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to delete sale'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark a sale as complete.
   */
  const completeItem = async (saleId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await saleService.complete(saleId)
      const index = items.value.data.findIndex((s) => s.id === saleId)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to complete sale'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get total sales for a specific shift.
   *
   * @param {Number|String} shiftId - the ID of the shift
   * @returns {Number} the total sales amount for that shift
   */
  const getTotalForShift = async (shiftId) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await saleService.getTotalForShift(shiftId)
      // Assuming response is an object like { totalSales: 123.45 }
      return response.totalSales
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to fetch total sales for shift'
      return 0
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the store (for example on logout).
   */
  const resetStore = () => {
    items.value = {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
      data: []
    }
    item.value = null
    isLoading.value = false
    error.value = null
    isLoaded.value = false
  }

  // --- RETURN STORE ---
  return {
    items,
    item,
    isLoading,
    error,
    isLoaded,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    completeItem,
    getTotalForShift, // Export the new action
    resetStore
  }
})
