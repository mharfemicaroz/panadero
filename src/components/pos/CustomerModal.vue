<!-- src/components/CustomerModal.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white p-6 rounded-lg md:w-1/3 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Add Customer</h2>
      <form @submit.prevent="handleSave">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input
            v-model="localCustomer.first_name"
            type="text"
            placeholder="Customer First Name"
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input
            v-model="localCustomer.last_name"
            type="text"
            placeholder="Customer Last Name"
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="localCustomer.email"
            type="email"
            placeholder="Customer Email"
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Phone</label>
          <input
            v-model="localCustomer.phone"
            type="text"
            placeholder="Customer Phone"
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <div v-if="store.error" class="mb-4 text-red-500 text-sm">
          {{ store.error }}
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="emit('close')"
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            :disabled="store.isLoading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
            :disabled="store.isLoading"
          >
            {{ store.isLoading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useCustomerStore } from '../../stores/customer'

const store = useCustomerStore()
const localCustomer = reactive({ first_name: '', last_name: '', email: '', phone: '' })
const emit = defineEmits(['saveCustomer', 'close'])

async function handleSave() {
  try {
    await store.createItem({ ...localCustomer })
    emit('saveCustomer', { ...localCustomer })
    if (!store.error) emit('close')
  } catch (error) {
    // Error handling is managed by the store
    console.error('Failed to save customer:', error)
  }
}
</script>
