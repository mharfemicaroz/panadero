<script setup>
import { ref, computed, defineExpose } from 'vue'
import BaseTable from '../BaseTable.vue'
import CardBox from '../CardBox.vue'

const props = defineProps({
  saleStore: Object
})

const categorySummaryPage = ref(1)
const categorySummaryPageSize = ref(10)

const categorySummaryGroups = computed(() => {
  const groups = {}
  props.saleStore.items.data
    .filter((sale) => sale.status.toLowerCase().includes('completed'))
    .forEach((sale) => {
      const createdAt = sale.created_at.substring(0, 10)
      if (sale.saleItems && Array.isArray(sale.saleItems)) {
        sale.saleItems.forEach((saleItem) => {
          const categoryName =
            saleItem.item && saleItem.item.category ? saleItem.item.category.name : 'Unknown'
          const subCategoryName =
            saleItem.item && saleItem.item.subcategory ? saleItem.item.subcategory.name : ''
          const key = createdAt + '|' + categoryName + '|' + subCategoryName
          if (!groups[key]) {
            groups[key] = {
              createdAt,
              category: categoryName,
              subcategory: subCategoryName,
              sales_quantity: 0,
              gross_sales: 0,
              item_discounts: 0
            }
          }
          groups[key].sales_quantity += Number(saleItem.quantity) || 0
          groups[key].gross_sales += Number(saleItem.total) || 0
          groups[key].item_discounts += Number(saleItem.discount) || 0
        })
      }
    })
  const summaryArray = []
  for (const key in groups) {
    const group = groups[key]
    group.net_sales = group.gross_sales - group.item_discounts
    summaryArray.push(group)
  }
  summaryArray.sort((a, b) => {
    const dateComp = a.createdAt.localeCompare(b.createdAt)
    if (dateComp !== 0) return dateComp
    const catComp = a.category.localeCompare(b.category)
    if (catComp !== 0) return catComp
    return a.subcategory.localeCompare(b.subcategory)
  })
  return summaryArray
})

const paginatedCategorySummaryData = computed(() => {
  const allData = categorySummaryGroups.value
  const total = allData.length
  const pageSize = categorySummaryPageSize.value
  const totalPages = Math.ceil(total / pageSize) || 1
  const currentPage = categorySummaryPage.value
  const start = (currentPage - 1) * pageSize
  const paginatedData = allData.slice(start, start + pageSize)
  return { total, totalPages, currentPage, pageSize, data: paginatedData }
})

const categorySummaryColumns = [
  { key: 'createdAt', label: 'Created At' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'SubCategory' },
  {
    key: 'sales_quantity',
    label: 'Sales Quantity',
    formatter: (value) => Number(value).toFixed(0),
    aggregate: true
  },
  {
    key: 'gross_sales',
    label: 'Gross Sales',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'item_discounts',
    label: 'Item Discounts',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'net_sales',
    label: 'Net Sales',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  }
]

const handleCategorySummaryQueryChange = (query) => {
  categorySummaryPage.value = query.page
  categorySummaryPageSize.value = query.limit
}

defineExpose({ categorySummaryGroups })
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Category Sales Summary</h2>
    <CardBox class="shadow-lg">
      <BaseTable
        :columns="categorySummaryColumns"
        :data="paginatedCategorySummaryData"
        :loading="saleStore.isLoading"
        :show-action="false"
        @query-change="handleCategorySummaryQueryChange"
        table-class="min-w-full divide-y divide-gray-200"
      />
    </CardBox>
  </section>
</template>
