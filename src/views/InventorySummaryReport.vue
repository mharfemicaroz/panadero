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

// --- COMPUTE TABLE DATA FOR INDIVIDUAL RECORDS ---
// For each inventory record we compute:
// - Beginning Qty from the associated item (item.beginning_qty)
// - Added Qty & Purchased Qty: aggregated from stock movements of type "IN"
// - Deduct Qty & Sales Qty: aggregated from stock movements of type "OUT"
const computedInventoryData = computed(() => {
  return inventoryStore.items.data.map((record) => {
    const beginningQty = record.item ? record.item.beginning_qty : 0

    const { totalIn, addedQty } = (record.stock_movements || []).reduce(
      (acc, { type, note, quantity_change }) => {
        if (type === 'IN') {
          if (note === 'purchased') {
            acc.totalIn += quantity_change
          } else {
            acc.addedQty += quantity_change
          }
        }
        return acc
      },
      { totalIn: 0, addedQty: 0 }
    )

    const { totalOut, deductQty } = (record.stock_movements || []).reduce(
      (acc, { type, note, quantity_change }) => {
        if (type === 'OUT') {
          if (note === 'manual deduct') {
            acc.deductQty += quantity_change
          } else {
            acc.totalOut += quantity_change
          }
        }
        return acc
      },
      { totalOut: 0, deductQty: 0 }
    )

    // Sales Qty is the total non-manual "OUT" movements.
    const salesQty = totalOut

    return {
      item: record.item ? record.item.name : '',
      category: record.item && record.item.category ? record.item.category.name : '',
      beginning_qty: beginningQty,
      added_qty: addedQty,
      purchased_qty: totalIn,
      deduct_qty: deductQty,
      sales_qty: salesQty,
      current_qty: record.current_quantity
    }
  })
})

const inventoryData = computed(() => ({
  total: inventoryStore.items.total || 0,
  totalPages: inventoryStore.items.totalPages || 1,
  currentPage: inventoryStore.items.currentPage || 1,
  pageSize: inventoryStore.items.pageSize || 10,
  data: computedInventoryData.value
}))

// --- COMPUTE AGGREGATED DATA BY CATEGORY ---
// Group the computed inventory records by category and sum up all quantities.
const computedCategoryData = computed(() => {
  const groups = {}
  computedInventoryData.value.forEach((record) => {
    const category = record.category || 'Uncategorized'
    if (!groups[category]) {
      groups[category] = {
        category,
        beginning_qty: 0,
        added_qty: 0,
        purchased_qty: 0,
        deduct_qty: 0,
        sales_qty: 0,
        current_qty: 0
      }
    }
    groups[category].beginning_qty += record.beginning_qty
    groups[category].added_qty += record.added_qty
    groups[category].purchased_qty += record.purchased_qty
    groups[category].deduct_qty += record.deduct_qty
    groups[category].sales_qty += record.sales_qty
    groups[category].current_qty += record.current_qty
  })
  return Object.values(groups)
})

const categoryData = computed(() => ({
  total: computedCategoryData.value.length,
  data: computedCategoryData.value
}))

// --- TABLE COLUMNS ---
const inventoryColumns = [
  { key: 'item', label: 'Item' },
  { key: 'category', label: 'Category' },
  { key: 'beginning_qty', label: 'Beginning Qty' },
  { key: 'added_qty', label: 'Added Qty' },
  { key: 'purchased_qty', label: 'Purchased Qty' },
  { key: 'deduct_qty', label: 'Deduct Qty' },
  { key: 'sales_qty', label: 'Sales Qty' },
  { key: 'current_qty', label: 'Current Qty' }
]

const categoryColumns = [
  { key: 'category', label: 'Category' },
  { key: 'beginning_qty', label: 'Beginning Qty' },
  { key: 'added_qty', label: 'Added Qty' },
  { key: 'purchased_qty', label: 'Purchased Qty' },
  { key: 'deduct_qty', label: 'Deduct Qty' },
  { key: 'sales_qty', label: 'Sales Qty' },
  { key: 'current_qty', label: 'Current Qty' }
]

// --- APPLY FILTERS ---
const applyFilters = async () => {
  let startDate = ''
  let endDate = ''
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    startDate = formatDateTimeStart(selectedDateRange.value[0])
    endDate = formatDateTimeEnd(selectedDateRange.value[1])
  }
  const filters = {}
  if (startDate) filters['filters[start_date]'] = startDate
  if (endDate) filters['filters[end_date]'] = endDate
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

      <SectionTitleLineWithButton
        title="Inventory Summary Report"
        main
      ></SectionTitleLineWithButton>

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

      <!-- First Table: Individual Inventory Records -->
      <CardBox class="mb-6">
        <BaseTable
          :columns="inventoryColumns"
          :data="inventoryData"
          :loading="inventoryStore.isLoading"
          :show-action="false"
          @query-change="handleQueryChange"
        />
      </CardBox>

      <!-- Second Table: Aggregated Data by Category -->
      <SectionTitleLineWithButton
        title="Inventory Summary By Category"
        main
      ></SectionTitleLineWithButton>
      <CardBox class="mb-6">
        <BaseTable
          :columns="categoryColumns"
          :data="categoryData"
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
