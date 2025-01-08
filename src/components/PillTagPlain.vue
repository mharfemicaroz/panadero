<script setup>
import BaseIcon from '@/components/BaseIcon.vue'

defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: null
  },
  small: Boolean,
  huge: Boolean,
  opacity: {  // New opacity prop
    type: String,
    default: 'opacity-100'  // Default opacity is 100%
  }
})
</script>

<template>
  <div
    class="inline-flex items-center capitalize leading-none"
    :class="[small ? 'text-xs' : huge ? 'text-5xl' : 'text-sm', opacity]"
  >
    <BaseIcon
      v-if="icon"
      :path="icon"
      :h="huge ? 'h-12' : small ? 'h-4' : 'h-4'"
      :w="huge ? 'w-12' : small ? 'w-4' : 'w-4'"
      :class="[
        small ? 'mr-1' : huge ? 'mr-3' : 'mr-2',
        opacity  // Apply opacity class to the icon
      ]"
      :size="huge ? 50 : small ? 14 : null"
    />
    <span>{{ label }}</span>
  </div>
</template>
