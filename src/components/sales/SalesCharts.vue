<script setup>
import { ref, watch, defineExpose } from 'vue'
import LineChart from '../Charts/LineChart.vue'
import DoughnutChart from '../Charts/DoughnutChart.vue'
import CardBox from '../CardBox.vue'

const props = defineProps({
  saleStore: Object,
  selectedPeriod: String
})

const chartData = ref(null)
const doughnutData = ref(null)

const fillChartData = () => {
  if (props.selectedPeriod === 'all_day') {
    const labels = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' + i : i) + ':00')
    const dataValues = new Array(24).fill(0)
    if (props.saleStore.items.data.length > 0) {
      props.saleStore.items.data.forEach((sale) => {
        const saleDate = new Date(sale.created_at)
        const hour = saleDate.getHours()
        dataValues[hour] += parseFloat(sale.total_amount)
      })
    }
    chartData.value = {
      labels,
      datasets: [
        {
          label: 'Total Amount',
          data: dataValues,
          fill: false,
          borderColor: '#00D1B2',
          borderWidth: 2,
          tension: 0.5
        }
      ]
    }
  } else {
    if (props.saleStore.items.data.length === 0) {
      chartData.value = {
        labels: [],
        datasets: [
          {
            label: 'Total Amount',
            data: [],
            fill: false,
            borderColor: '#00D1B2',
            borderWidth: 2,
            tension: 0.5
          }
        ]
      }
    } else {
      const sortedSales = [...props.saleStore.items.data].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      )
      const labels = sortedSales.map((sale) => sale.created_at.substring(0, 10))
      const dataValues = sortedSales.map((sale) => parseFloat(sale.total_amount))
      chartData.value = {
        labels,
        datasets: [
          {
            label: 'Total Amount',
            data: dataValues,
            fill: false,
            borderColor: '#00D1B2',
            borderWidth: 2,
            tension: 0.5
          }
        ]
      }
    }
  }
}

const fillDoughnutData = () => {
  const paymentSummary = {}
  props.saleStore.items.data.forEach((sale) => {
    const type = sale.payment_type || 'Unknown'
    const amount = parseFloat(sale.total_amount) || 0
    if (!paymentSummary[type]) {
      paymentSummary[type] = 0
    }
    paymentSummary[type] += amount
  })
  const labels = Object.keys(paymentSummary)
  const dataValues = Object.values(paymentSummary)
  const colors = ['#00D1B2', '#209CEE', '#FF3860', '#FFDD57', '#8A2BE2', '#FF7F50']
  doughnutData.value = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: labels.map((_, index) => colors[index % colors.length])
      }
    ]
  }
}

watch(
  () => [props.saleStore.items.data, props.selectedPeriod],
  () => {
    fillChartData()
    fillDoughnutData()
  },
  { deep: true }
)

defineExpose({ chartData, doughnutData })
</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 mb-6">
    <div class="w-full md:w-2/3">
      <CardBox class="p-4 shadow-lg">
        <line-chart :data="chartData" :loading="saleStore.isLoading" class="h-96" />
      </CardBox>
    </div>
    <div class="w-full md:w-1/3">
      <CardBox class="p-4 shadow-lg">
        <doughnut-chart :data="doughnutData" :loading="saleStore.isLoading" class="h-96" />
      </CardBox>
    </div>
  </div>
</template>
