<!-- src/components/BreadcrumbNavigation.vue -->
<template>
  <div class="breadcrumb mb-6 flex flex-wrap items-center gap-2">
    <span class="text-[#b51919] cursor-pointer hover:underline" @click="$emit('reset')">
      Home
    </span>
    <span v-if="breadcrumbs.length" class="text-gray-500">/</span>
    <span
      v-for="(crumb, index) in breadcrumbs"
      :key="index"
      @click="$emit('navigate', index)"
      class="text-[#b51919] cursor-pointer hover:underline"
    >
      {{ crumb }}
    </span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  breadcrumbs: { type: Array, default: () => [] }
})
</script>
