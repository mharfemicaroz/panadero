<script setup>
import { ref, computed, defineExpose } from 'vue'
import BaseTable from '../BaseTable.vue'
import CardBox from '../CardBox.vue'

const props = defineProps({
  saleStore: Object
})

const inventoryPage = ref(1)
const inventoryPageSize = ref(10)

const salesInventoryGroups = computed(() => {
  const groups = {}
  props.saleStore.items.data
    .filter((sale) => sale.status.toLowerCase().includes('completed'))
    .forEach((sale) => {
      const saleDate = sale.sale_date
        ? sale.sale_date.substring(0, 10)
        : sale.created_at.substring(0, 10)
      if (sale.saleItems && Array.isArray(sale.saleItems)) {
        sale.saleItems.forEach((saleItem) => {
          const itemName = saleItem.item ? saleItem.item.name : 'Unknown'
          const warehouse = sale.warehouse
            ? sale.warehouse.name
            : saleItem.item && saleItem.item.warehouse
            ? saleItem.item.warehouse.name
            : 'Unknown'
          const category =
            saleItem.item && saleItem.item.category ? saleItem.item.category.name : 'Unknown'
          const subcategory =
            saleItem.item && saleItem.item.subcategory ? saleItem.item.subcategory.name : ''
          const groupKey =
            saleDate + '|' + itemName + '|' + warehouse + '|' + category + '|' + subcategory
          if (!groups[groupKey]) {
            groups[groupKey] = {
              date: saleDate,
              item_name: itemName,
              warehouse: warehouse,
              category: category,
              subcategory: subcategory,
              total_qty_sold: 0,
              total_amount_sold: 0,
              total_amount_cost: 0,
              total_discount: 0,
              total_qty_current: 0,
              total_amount_current: 0
            }
          }
          groups[groupKey].total_qty_sold += Number(saleItem.quantity) || 0
          groups[groupKey].total_amount_sold += Number(saleItem.total) || 0
          groups[groupKey].total_amount_cost +=
            Number(saleItem.quantity) *
              (saleItem.item && saleItem.item.cost ? Number(saleItem.item.cost) : 0) || 0
          groups[groupKey].total_discount += Number(saleItem.discount) || 0
          let currentQty = 0
          if (
            saleItem.item &&
            saleItem.item.inventories &&
            Array.isArray(saleItem.item.inventories)
          ) {
            saleItem.item.inventories.forEach((inv) => {
              currentQty += Number(inv.current_quantity) || 0
            })
          }
          groups[groupKey].total_qty_current += currentQty
          groups[groupKey].total_amount_current +=
            currentQty * (saleItem.item && saleItem.item.cost ? Number(saleItem.item.cost) : 0)
        })
      }
    })
  const result = []
  for (const key in groups) {
    result.push(groups[key])
  }
  result.sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date)
    if (dateComp !== 0) return dateComp
    return a.item_name.localeCompare(b.item_name)
  })
  return result
})

const paginatedInventoryData = computed(() => {
  const allData = salesInventoryGroups.value
  const total = allData.length
  const pageSize = inventoryPageSize.value
  const totalPages = Math.ceil(total / pageSize) || 1
  const currentPage = inventoryPage.value
  const start = (currentPage - 1) * pageSize
  const paginatedData = allData.slice(start, start + pageSize)
  return { total, totalPages, currentPage, pageSize, data: paginatedData }
})

const inventoryColumns = [
  { key: 'date', label: 'Date' },
  { key: 'item_name', label: 'Item Name' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subcategory' },
  {
    key: 'total_qty_sold',
    label: 'Total Qty (Sold)',
    formatter: (value) => Number(value).toFixed(0),
    aggregate: true
  },
  {
    key: 'total_amount_sold',
    label: 'Total Amount (Sold)',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'total_amount_cost',
    label: 'Total Amount (Cost)',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'total_qty_current',
    label: 'Total Qty (Current)',
    formatter: (value) => Number(value).toFixed(0),
    aggregate: true
  },
  {
    key: 'total_amount_current',
    label: 'Total Amount (Current)',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'total_discount',
    label: 'Total Discount',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  }
]

const handleInventoryQueryChange = (query) => {
  inventoryPage.value = query.page
  inventoryPageSize.value = query.limit
}

defineExpose({ salesInventoryGroups })
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Sales Inventory Report</h2>
    <CardBox class="shadow-lg">
      <BaseTable
        :columns="inventoryColumns"
        :data="paginatedInventoryData"
        :loading="saleStore.isLoading"
        :show-action="false"
        @query-change="handleInventoryQueryChange"
        table-class="min-w-full divide-y divide-gray-200"
      />
    </CardBox>
  </section>
</template>
