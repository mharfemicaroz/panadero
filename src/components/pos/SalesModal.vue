<!-- src/components/pos/SalesModal.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white p-6 rounded-lg md:w-2/3 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
      <!-- 1. NotificationBar if there is an error from the sale store -->
      <NotificationBar v-if="saleStore.error" :icon="mdiAlertCircle" color="danger">
        {{ saleStore.error }}
      </NotificationBar>

      <!-- 2. Header -->
      <div class="flex flex-wrap md:flex-nowrap justify-between items-center mb-4">
        <h2 class="text-xl font-bold">All Sales</h2>
        <button
          type="button"
          @click="closeModal"
          class="p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <BaseIcon :path="mdiClose" size="16" />
        </button>
      </div>

      <!-- 3. Filters -->
      <div class="flex flex-wrap gap-2 mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by ID, Customer Name, etc."
          class="p-2 border rounded flex-1"
        />
        <div class="flex items-center gap-1">
          <label class="text-sm">From:</label>
          <input v-model="fromDate" type="date" class="p-1 border rounded" />
        </div>
        <div class="flex items-center gap-1">
          <label class="text-sm">To:</label>
          <input v-model="toDate" type="date" class="p-1 border rounded" />
        </div>
      </div>

      <!-- 4. Sales Table -->
      <BaseTable
        :columns="salesTableColumns"
        :data="salesTableData"
        :checkable="false"
        :loading="saleStore.isLoading"
        @query-change="handleQueryChange"
        @edit="handleEditSale"
      >
        <!-- Scoped slot for the actions column -->
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button
              v-if="row.status === 'suspended'"
              @click="unsuspendSale(row)"
              class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Unsuspend
            </button>
            <button
              v-if="row.status === 'suspended' || row.status === 'completed'"
              @click="voidSale(row)"
              class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Void
            </button>
            <button
              @click="printSale(row)"
              class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print
            </button>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProductSaleStore } from '@/stores/product/sale'
import BaseIcon from '@/components/BaseIcon.vue'
import BaseTable from '@/components/BaseTable.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { mdiAlertCircle, mdiClose } from '@mdi/js'

const emit = defineEmits(['close', 'unsuspendSale', 'voidSale', 'printSale', 'edit'])

// Local reactive state for filters
const searchQuery = ref('')
const fromDate = ref('')
const toDate = ref('')

// Initialize the sale store
const saleStore = useProductSaleStore()

// Initial fetch
async function fetchSales(queryParams, forceRefresh = false) {
  await saleStore.fetchItems(queryParams, forceRefresh)
}
fetchSales({ page: 1, limit: 5 })

// Prepare the table data from the store’s items
const salesTableData = computed(() => ({
  total: saleStore.items.total,
  totalPages: saleStore.items.totalPages,
  currentPage: saleStore.items.currentPage,
  pageSize: saleStore.items.pageSize,
  data: saleStore.items.data
}))

// Helper: format a date string into a locale string
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString()
}

// Define the columns for the BaseTable
const salesTableColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'created_at', label: 'Date', formatter: (val) => formatDate(val), sortable: true },
  { key: 'customer_name', label: 'Customer', sortable: true, filterable: true },
  { key: 'status', label: 'Status', sortable: true, filterable: true },
  { key: 'payment_type', label: 'Type', sortable: true, filterable: true },
  {
    key: 'total_amount',
    label: 'Total',
    formatter: (val) => `₱${(Number(val) || 0).toFixed(2)}`,
    sortable: true
  }
]

// Watch filters to trigger fetching sales
watch([searchQuery, fromDate, toDate], () => {
  const query = {
    page: 1,
    limit: 5,
    filters: {
      search: searchQuery.value,
      start_date: fromDate.value,
      end_date: toDate.value
    }
  }
  fetchSales(query, true)
})

const handleQueryChange = async (query) => {
  await fetchSales(query, true)
}

// Emit the edit event from the table to the parent (if needed)
function handleEditSale(row) {
  emit('edit', row)
}

// Methods for sale actions – simply re‑emit the events for the parent to handle.
function unsuspendSale(row) {
  emit('unsuspendSale', row)
}
function voidSale(row) {
  emit('voidSale', row)
}
function printSale(row) {
  emit('printSale', row)
}

// Close the modal by emitting a close event
function closeModal() {
  emit('close')
}
</script>
