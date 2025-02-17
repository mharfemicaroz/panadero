<script setup>
import { ref, computed, defineExpose } from 'vue'
import BaseTable from '../BaseTable.vue'
import CardBox from '../CardBox.vue'

const props = defineProps({
  saleStore: Object
})

const breakdownPaymentPage = ref(1)
const breakdownPaymentPageSize = ref(10)

const breakdownPaymentSummaryGroups = computed(() => {
  const groups = {}
  props.saleStore.items.data
    .filter((sale) => sale.status.toLowerCase().includes('completed'))
    .forEach((sale) => {
      const saleDate = sale.sale_date
        ? sale.sale_date.substring(0, 10)
        : sale.created_at.substring(0, 10)
      const paymentType = sale.payment_type || 'Unknown'
      const branch = sale.branch ? sale.branch.name : 'Unknown'
      const key = saleDate + '|' + paymentType + '|' + branch
      if (!groups[key]) {
        groups[key] = {
          date: saleDate,
          payment_type: paymentType,
          branch: branch,
          quantity: 0,
          total_sales: 0
        }
      }
      let saleQuantity = 0
      if (sale.saleItems && Array.isArray(sale.saleItems)) {
        sale.saleItems.forEach((saleItem) => {
          saleQuantity += Number(saleItem.quantity) || 0
        })
      }
      groups[key].quantity += saleQuantity
      groups[key].total_sales += Number(sale.total_amount) || 0
    })
  const summaryArray = Object.values(groups)
  summaryArray.sort((a, b) => a.date.localeCompare(b.date))
  return summaryArray
})

const paginatedBreakdownPaymentData = computed(() => {
  const allData = breakdownPaymentSummaryGroups.value
  const total = allData.length
  const pageSize = breakdownPaymentPageSize.value
  const totalPages = Math.ceil(total / pageSize) || 1
  const currentPage = breakdownPaymentPage.value
  const start = (currentPage - 1) * pageSize
  const paginatedData = allData.slice(start, start + pageSize)
  return { total, totalPages, currentPage, pageSize, data: paginatedData }
})

const breakdownPaymentColumns = [
  { key: 'date', label: 'Date' },
  { key: 'payment_type', label: 'Payment Type' },
  { key: 'branch', label: 'Branch' },
  {
    key: 'quantity',
    label: 'Quantity',
    formatter: (value) => Number(value).toFixed(0),
    aggregate: true
  },
  {
    key: 'total_sales',
    label: 'Total Sales',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  }
]

const handleBreakdownPaymentQueryChange = (query) => {
  breakdownPaymentPage.value = query.page
  breakdownPaymentPageSize.value = query.limit
}

defineExpose({ breakdownPaymentSummaryGroups })
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Breakdown Payment Summary</h2>
    <CardBox class="shadow-lg">
      <BaseTable
        :columns="breakdownPaymentColumns"
        :data="paginatedBreakdownPaymentData"
        :loading="saleStore.isLoading"
        :show-action="false"
        @query-change="handleBreakdownPaymentQueryChange"
        table-class="min-w-full divide-y divide-gray-200"
      />
    </CardBox>
  </section>
</template>
