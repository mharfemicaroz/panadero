import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerService from '../services/customer/customerService'

export const useCustomerStore = defineStore('customer', () => {
  // --- STATE ---
  const items = ref({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    data: []
  })

  const item = ref(null) // For single customer details

  // Track loading and error states
  const isLoading = ref(false)
  const error = ref(null)

  // Control to indicate we've fetched data once already
  const isLoaded = ref(false)

  // --- ACTIONS ---

  /**
   * Fetch a list of customers
   */
  const fetchItems = async (queryParams = {}, forceRefresh = false) => {
    // Clear any old error
    error.value = null

    // Skip API if data already loaded and not forcing refresh
    if (!forceRefresh && isLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await customerService.list(queryParams)

      Object.assign(items.value, {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: queryParams.page || 1,
        pageSize: queryParams.limit || 10,
        data: response.data || []
      })

      isLoaded.value = true
    } catch (err) {
      // Capture error in store instead of throwing
      error.value = err?.response?.message || 'Failed to fetch customers'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single customer by ID
   */
  const fetchItemById = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await customerService.getById(id)
      item.value = response
    } catch (err) {
      error.value = err?.response?.message || 'Failed to fetch customer'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new customer
   */
  const createItem = async (data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await customerService.create(data)
      items.value.data.push(response)
      items.value.total += 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to create customer'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing customer
   */
  const updateItem = async (id, data) => {
    error.value = null
    try {
      isLoading.value = true
      const response = await customerService.updateById(id, data)
      const index = items.value.data.findIndex((c) => c.id === id)
      if (index !== -1) {
        items.value.data[index] = response
      }
    } catch (err) {
      error.value = err?.response?.message || 'Failed to update customer'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a customer by ID
   */
  const deleteItem = async (id) => {
    error.value = null
    try {
      isLoading.value = true
      await customerService.delete(id)
      items.value.data = items.value.data.filter((c) => c.id !== id)
      items.value.total -= 1
    } catch (err) {
      error.value = err?.response?.message || 'Failed to delete customer'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset store if you ever need to (e.g. on logout)
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
    error, // <-- export error so components can check or display it
    isLoaded,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    resetStore
  }
})
