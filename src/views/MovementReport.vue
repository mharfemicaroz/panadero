<script setup>
import { ref, computed, onMounted } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useInventoryStore } from '../stores/product/inventory'
import { useWarehouseStore } from '../stores/warehouse'

// --- STORES ---
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()

// --- FILTER STATE ---
const selectedDateRange = ref([new Date(), new Date()])
const selectedWarehouse = ref('')

// --- Helper Functions for Date Formatting ---
function formatDateTimeStart(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}T00:00:00`
}
function formatDateTimeEnd(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}T23:59:59`
}

// --- FETCH DATA ---
async function fetchInventory(queryParams = {}, forceRefresh = false) {
  await inventoryStore.fetchItems(queryParams, forceRefresh)
}
async function fetchWarehouses() {
  await warehouseStore.fetchAll({}, true)
}

// --- Initial Fetch ---
onMounted(() => {
  fetchWarehouses()
  fetchInventory({ page: 1, limit: 10 }, true)
})

// --- COMPUTE ITEM ADDED REPORT DATA ---
// For each inventory record, we compute the quantity added from stock movements
// (only include movements where type is "IN" and note is not "manual deduct").
// Then we compute the total cost and total price based on the item’s cost and price.
const computedMovementData = computed(() => {
  return inventoryStore.items.data
    .map((record) => {
      const addedQty = (record.stock_movements || []).reduce((acc, movement) => {
        if (movement.type === 'IN') {
          return acc + movement.quantity_change
        }
        return acc
      }, 0)
      // Only include records where there is an added quantity.
      if (addedQty <= 0) return null

      const currentCost = record.item ? parseFloat(record.item.cost) : 0
      const itemPrice = record.item ? parseFloat(record.item.price) : 0
      const category =
        record.item && record.item.category ? record.item.category.name : 'Uncategorized'

      return {
        item: record.item ? record.item.name : '',
        category,
        current_cost: currentCost,
        quantity: addedQty,
        total_cost: currentCost * addedQty,
        total_price: itemPrice * addedQty
      }
    })
    .filter((row) => row !== null)
})

const movementData = computed(() => ({
  total: computedMovementData.value.length,
  data: computedMovementData.value.map((row) => ({
    ...row,
    current_cost: row.current_cost.toFixed(2),
    total_cost: row.total_cost.toFixed(2),
    total_price: row.total_price.toFixed(2)
  }))
}))

// --- COMPUTE AGGREGATED DATA BY CATEGORY ---
// Group the computed movement data by category and sum the quantities, total cost and total price.
const computedCategoryMovementData = computed(() => {
  const groups = {}
  computedMovementData.value.forEach((row) => {
    const cat = row.category || 'Uncategorized'
    if (!groups[cat]) {
      groups[cat] = {
        category: cat,
        total_quantity: 0,
        total_cost: 0,
        total_price: 0
      }
    }
    groups[cat].total_quantity += row.quantity
    groups[cat].total_cost += row.total_cost
    groups[cat].total_price += row.total_price
  })
  return Object.values(groups)
})

const categoryMovementData = computed(() => ({
  total: computedCategoryMovementData.value.length,
  data: computedCategoryMovementData.value.map((group) => ({
    category: group.category,
    total_quantity: group.total_quantity,
    total_cost: group.total_cost.toFixed(2),
    total_price: group.total_price.toFixed(2)
  }))
}))

// --- TABLE COLUMNS ---
const movementColumns = [
  { key: 'item', label: 'Item' },
  { key: 'current_cost', label: 'Current Cost' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'total_cost', label: 'Total Cost' },
  { key: 'total_price', label: 'Total Price' }
]

const categoryMovementColumns = [
  { key: 'category', label: 'Category' },
  { key: 'total_quantity', label: 'Total Quantity' },
  { key: 'total_cost', label: 'Total Cost' },
  { key: 'total_price', label: 'Total Price' }
]

// --- APPLY FILTERS ---
// The date filter applies to stock_movements.created_at.
const applyFilters = async () => {
  let startDate = ''
  let endDate = ''
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    startDate = formatDateTimeStart(selectedDateRange.value[0])
    endDate = formatDateTimeEnd(selectedDateRange.value[1])
  }
  const filters = {}
  if (startDate) filters['filters[stock_movements.created_at][gte]'] = startDate
  if (endDate) filters['filters[stock_movements.created_at][lte]'] = endDate
  if (selectedWarehouse.value) filters['filters[warehouse_id]'] = selectedWarehouse.value

  await fetchInventory(
    {
      ...filters,
      page: 1,
      limit: 10
    },
    true
  )
}

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchInventory(query, true)
}
</script>

<template>
  <LayoutAuthenticated>
    <div class="p-4">
      <NotificationBar v-if="inventoryStore.error" color="danger">
        {{ inventoryStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton title="Item Added Report" main></SectionTitleLineWithButton>

      <!-- Filters -->
      <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Date Range Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Select Date Range</label>
            <Datepicker
              v-model="selectedDateRange"
              range
              multi-calendars
              format="yyyy-MM-dd"
              input-class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
          <!-- Warehouse Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Select Warehouse</label>
            <select
              v-model="selectedWarehouse"
              class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              <option value="">All Warehouses</option>
              <option
                v-for="warehouse in warehouseStore.warehouses"
                :key="warehouse.id"
                :value="warehouse.id"
              >
                {{ warehouse.name }}
              </option>
            </select>
          </div>
          <!-- Filter Button -->
          <div class="flex items-end">
            <BaseButton label="Filter" color="blue" class="px-4 py-2" @click="applyFilters" />
          </div>
        </div>
      </div>

      <!-- First Table: Item Added Report -->
      <CardBox class="mb-6">
        <BaseTable
          :columns="movementColumns"
          :data="movementData"
          :loading="inventoryStore.isLoading"
          :show-action="false"
          @query-change="handleQueryChange"
        />
      </CardBox>

      <!-- Second Table: Aggregated Data by Category -->
      <SectionTitleLineWithButton title="Categories Added Report" main></SectionTitleLineWithButton>
      <CardBox class="mb-6">
        <BaseTable
          :columns="categoryMovementColumns"
          :data="categoryMovementData"
          :loading="inventoryStore.isLoading"
          :show-action="false"
        />
      </CardBox>
    </div>
  </LayoutAuthenticated>
</template>
<style>
.dp__input {
  margin-top: 4px;
  height: 2.6em !important;
}
</style>
