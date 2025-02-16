<script setup>
import { ref, computed, defineExpose } from 'vue'
import BaseTable from '../BaseTable.vue'
import CardBox from '../CardBox.vue'

const props = defineProps({
  saleStore: Object,
  selectedPeriod: String
})

const summaryPage = ref(1)
const summaryPageSize = ref(10)

const summaryGroups = computed(() => {
  const groups = {}
  props.saleStore.items.data.forEach((sale) => {
    let groupKey = ''
    if (props.selectedPeriod === 'all_day') {
      const hr = new Date(sale.created_at).getHours()
      groupKey = (hr < 10 ? '0' + hr : hr) + ':00'
    } else {
      groupKey = sale.created_at.substring(0, 10)
    }
    if (!groups[groupKey]) {
      groups[groupKey] = { gross_sales: 0, discounts: 0, item_cost: 0 }
    }
    groups[groupKey].gross_sales += parseFloat(sale.total_amount) || 0
    groups[groupKey].discounts += parseFloat(sale.discount_total) || 0
    if (sale.saleItems && Array.isArray(sale.saleItems)) {
      sale.saleItems.forEach((saleItem) => {
        const quantity = saleItem.quantity || 0
        const cost = saleItem.item && saleItem.item.cost ? parseFloat(saleItem.item.cost) : 0
        groups[groupKey].item_cost += quantity * cost
      })
    }
  })
  const summaryArray = []
  for (const key in groups) {
    const gross_sales = groups[key].gross_sales
    const item_cost = groups[key].item_cost
    const gross_profit = gross_sales - item_cost
    const discounts = groups[key].discounts
    const net_sales = gross_sales - discounts
    summaryArray.push({
      time: key,
      gross_sales,
      item_cost,
      gross_profit,
      discounts,
      net_sales
    })
  }
  summaryArray.sort((a, b) => a.time.localeCompare(b.time))
  return summaryArray
})

const paginatedSummaryData = computed(() => {
  const allData = summaryGroups.value
  const total = allData.length
  const pageSize = summaryPageSize.value
  const totalPages = Math.ceil(total / pageSize) || 1
  const currentPage = summaryPage.value
  const start = (currentPage - 1) * pageSize
  const paginatedData = allData.slice(start, start + pageSize)
  return { total, totalPages, currentPage, pageSize, data: paginatedData }
})

const summaryColumns = computed(() => [
  { key: 'time', label: props.selectedPeriod === 'all_day' ? 'Time' : 'Date' },
  {
    key: 'gross_sales',
    label: 'Gross Sales',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'item_cost',
    label: 'Item Cost',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'gross_profit',
    label: 'Gross Profit',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'discounts',
    label: 'Discounts',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'net_sales',
    label: 'Net Sales',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  }
])

const handleSummaryQueryChange = (query) => {
  summaryPage.value = query.page
  summaryPageSize.value = query.limit
}

defineExpose({ summaryGroups })
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Sales Report Summary</h2>
    <CardBox class="shadow-lg">
      <BaseTable
        :columns="summaryColumns"
        :data="paginatedSummaryData"
        :loading="saleStore.isLoading"
        :show-action="false"
        @query-change="handleSummaryQueryChange"
        table-class="min-w-full divide-y divide-gray-200"
      />
    </CardBox>
  </section>
</template>
