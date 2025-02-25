import { defineStore } from 'pinia'
import { ref } from 'vue'
import orderService from '../../services/product/orderService'

export const useOrderStore = defineStore('order', () => {
  // --- STATE ---
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })
  const item = ref(null)

  // Track loading and error states
  const isLoading = ref(false)
  const error = ref(null)

  // Control to indicate data has been fetched at least once
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a list of orders
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    error.value = null
    if (!forceRefresh && isLoaded.value) return
    try {
      isLoading.value = true
      const response = await orderService.list(queryParams)
      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })
      isLoaded.value = true
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to fetch orders'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch an order by ID
   */
  const fetchItemById = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await orderService.getById(id)
      item.value = response
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to fetch order'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new order.
   * Note: Ensure the payload includes an `items` array (with order item details).
   */
  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await orderService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to create order'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing order.
   */
  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await orderService.updateById(id, data)
      const index = items.value.data.findIndex((o) => o.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to update order'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete an order by ID.
   */
  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await orderService.delete(id)
      items.value.data = items.value.data.filter((o) => o.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to delete order'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark an order as complete.
   * This action should deduct the ordered quantities from inventory.
   */
  const completeItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await orderService.complete(id)
      const index = items.value.data.findIndex((o) => o.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to complete order'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the order store (e.g., on logout).
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
    isLoaded.value = false
    isLoading.value = false
    error.value = null
  }

  // --- RETURN ---
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
    resetStore
  }
})
