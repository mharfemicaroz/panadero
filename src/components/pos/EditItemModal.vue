<!-- src/components/EditItemModal.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white p-6 rounded-lg md:w-1/3 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Edit {{ type === 'discount' ? 'Discount' : 'Price' }}</h2>
      <div class="mb-4 flex items-center gap-2">
        <label class="block text-sm font-medium">
          {{ type === 'discount' ? 'Discount Amount (₱):' : 'New Price (₱):' }}
        </label>
        <input
          v-model.number="valueInternal"
          type="number"
          min="0"
          step="0.01"
          class="p-2 border rounded flex-1"
        />
      </div>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="$emit('close')"
          class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ✘
        </button>
        <button
          type="button"
          @click="handleSave"
          class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
        >
          ✓
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
const props = defineProps({
  type: String,
  value: Number
})
const emit = defineEmits(['save', 'close'])
const valueInternal = ref(props.value)
watch(
  () => props.value,
  (newVal) => {
    valueInternal.value = newVal
  }
)
function handleSave() {
  emit('save', valueInternal.value)
}
</script>
