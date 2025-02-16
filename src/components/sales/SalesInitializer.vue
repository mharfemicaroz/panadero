<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  onInitialize: {
    type: Function,
    required: true
  }
})

onMounted(() => {
  // Apply initial filter for today's date
  const today = new Date()
  props.onInitialize({
    selectedPeriod: 'all_day',
    allDayRange: [today, today],
    monthlyYear: today.getFullYear(),
    monthlyMonth: today.getMonth() + 1,
    selectedCashier: '',
    selectedBranch: '',
    selectedWarehouse: ''
  })
})
</script>

<template>
  <!-- This component doesn't render anything, it just handles initialization -->
  <div style="display: none"></div>
</template>
