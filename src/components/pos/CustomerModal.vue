<!-- src/components/CustomerModal.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white p-6 rounded-lg md:w-1/3 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Add Customer</h2>
      <form @submit.prevent="handleSave">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Name</label>
          <input
            v-model="localCustomer.name"
            type="text"
            placeholder="Customer Name"
            class="w-full p-2 border rounded"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="localCustomer.email"
            type="email"
            placeholder="Customer Email"
            class="w-full p-2 border rounded"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Phone</label>
          <input
            v-model="localCustomer.phone"
            type="text"
            placeholder="Customer Phone"
            class="w-full p-2 border rounded"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="$emit('close')"
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button type="submit" class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const localCustomer = reactive({ name: '', email: '', phone: '' })
function handleSave() {
  // Emit the local customer data to the parent
  $emit('saveCustomer', { ...localCustomer })
}
const emit = defineEmits(['saveCustomer', 'close'])
</script>
