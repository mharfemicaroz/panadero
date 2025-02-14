import axiosInstance from '../../plugins/axiosConfig'

export default {
  /**
   * Creates a new customer.
   * @param {Object} data - The customer data to create.
   * @returns {Promise<Object>} The created customer data.
   */
  async create(data) {
    try {
      const response = await axiosInstance.post('/customer', data)
      return response.data
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`)
    }
  },

  /**
   * Retrieves a customer by ID.
   * @param {string|number} id - The ID of the customer to retrieve.
   * @returns {Promise<Object>} The customer data.
   */
  async getById(id) {
    try {
      const response = await axiosInstance.get(`/customer/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`)
    }
  },

  /**
   * Updates a customer by ID.
   * @param {string|number} id - The ID of the customer to update.
   * @param {Object} data - The updated customer data.
   * @returns {Promise<Object>} The updated customer data.
   */
  async updateById(id, data) {
    try {
      const response = await axiosInstance.put(`/customer/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`)
    }
  },

  /**
   * Deletes a customer by ID.
   * @param {string|number} id - The ID of the customer to delete.
   * @returns {Promise<Object>} The deletion response.
   */
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`/customer/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Error deleting customer: ${error.message}`)
    }
  },

  /**
   * Lists customers with optional query parameters.
   * @param {Object} queryParams - The query parameters for filtering, sorting, and pagination.
   * @returns {Promise<Object>} The list of customers and pagination metadata.
   */
  async list(queryParams) {
    try {
      const response = await axiosInstance.get('/customer', { params: queryParams })
      return response.data
    } catch (error) {
      throw new Error(`Error fetching customer list: ${error.message}`)
    }
  }
}
