<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const root = ref(null)
let chart

// Register the required Chart.js components for the doughnut chart.
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

onMounted(() => {
  chart = new Chart(root.value, {
    type: 'doughnut',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          enabled: true
        }
      }
    }
  })
})

const chartData = computed(() => props.data)

watch(chartData, (data) => {
  if (chart) {
    chart.data = data
    chart.update()
  }
})
</script>

<template>
  <canvas ref="root" />
</template>
