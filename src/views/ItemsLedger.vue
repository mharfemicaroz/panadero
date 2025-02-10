<script setup>
import { ref, computed, onMounted } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useItemStore } from '@/stores/product/item'
import { useStockMovementStore } from '@/stores/product/stockMovement'
import { mdiTableBorder, mdiAlertCircle, mdiEye, mdiArrowDownBold, mdiArrowUpBold } from '@mdi/js'

// --- STATE & STORES ---
const itemStore = useItemStore()
const stockMovementStore = useStockMovementStore()
const isLedgerModalVisible = ref(false)

// These variables manage the ledger data fetched from the backend:
const ledgerModalData = ref([]) // Full ledger entries loaded so far
const ledgerLimit = ref(10) // Current fetch limit (initially 10; increases by 10 with Load More)
const ledgerTotal = ref(0) // Total available ledger entries (from API)
const ledgerLoading = ref(false) // Loader flag for "Load More"
const selectedInventoryId = ref(null) // The inventory ID for which ledger is loaded

// Variables for local display pagination (fixed page size of 5 per page):
const ledgerDisplayPage = ref(1) // Current local display page
const ledgerDisplayPageSize = 5 // Always display 5 entries per page

// --- DATA FETCHING ---
// Fetch items with history for the main items table (limit fixed at 10)
async function fetchLedgerItems(queryParams = {}) {
  await itemStore.fetchItemsWithHistory(queryParams, true)
}

// Initial fetch for the main items table on component mount
onMounted(() => {
  fetchLedgerItems({ page: 1, limit: 10 })
})

// --- COMPUTED PROPERTIES ---
// Data for the main items table from the item store
const ledgerData = computed(() => ({
  total: itemStore.items.total || 0,
  totalPages: itemStore.items.totalPages || 1,
  currentPage: itemStore.items.currentPage || 1,
  pageSize: itemStore.items.pageSize || 10,
  data: itemStore.items.data || []
}))

// Computed data for the ledger modal cards (local pagination of the fetched ledger data)
const ledgerCardData = computed(() => {
  const total = ledgerModalData.value.length
  const totalPages = Math.ceil(total / ledgerDisplayPageSize)
  const startIndex = (ledgerDisplayPage.value - 1) * ledgerDisplayPageSize
  const pageData = ledgerModalData.value.slice(startIndex, startIndex + ledgerDisplayPageSize)
  return {
    total,
    totalPages,
    currentPage: ledgerDisplayPage.value,
    pageSize: ledgerDisplayPageSize,
    data: pageData
  }
})

// --- TABLE COLUMNS FOR MAIN ITEMS (Unchanged) ---
const mainColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'price', label: 'Price', sortable: true, filterable: true },
  { key: 'cost', label: 'Cost', sortable: true, filterable: true },
  {
    key: 'ledgerCount',
    label: 'Ledger Entries',
    formatter: (value, row) => (row.history ? row.history.length : 0)
  }
]

// --- EVENT HANDLERS ---
// Handler for queries (pagination, filtering, etc.) in the main items table
const handleQueryChange = async (query) => {
  await fetchLedgerItems(query)
}

// When "View Ledger" is clicked on an item row:
// 1. Extract the inventory ID (using the first inventory in the array),
// 2. Reset both the fetch and local display state for the ledger modal,
// 3. Fetch the first 10 ledger entries for that inventory.
const viewLedger = async (row) => {
  selectedInventoryId.value =
    (row.inventories && row.inventories[0] && row.inventories[0].id) || null
  if (!selectedInventoryId.value) {
    ledgerModalData.value = []
    isLedgerModalVisible.value = true
    return
  }
  // Reset fetch and display state for the modal:
  ledgerLimit.value = 10
  ledgerDisplayPage.value = 1
  ledgerModalData.value = []
  await loadLedgerData()
  isLedgerModalVisible.value = true
}

// Function to load ledger data from the backend using the current fetch limit.
// Always fetch from page 1; increasing the limit returns more items from the beginning.
const loadLedgerData = async () => {
  if (!selectedInventoryId.value) return
  ledgerLoading.value = true
  try {
    const queryParams = {
      page: 1,
      limit: ledgerLimit.value,
      inventory_id: selectedInventoryId.value
    }
    await stockMovementStore.fetchItems(queryParams, true)
    // Filter the fetched data to include only entries for the selected inventory.
    ledgerModalData.value = stockMovementStore.items.data.filter(
      (entry) => entry.inventory_id === selectedInventoryId.value
    )
    ledgerTotal.value = stockMovementStore.items.total
  } catch (error) {
    // Optionally handle errors (e.g. show a notification)
  } finally {
    ledgerLoading.value = false
  }
}

// Handler for the "Load More" button: Increase the fetch limit by 10 and re-fetch ledger data.
const loadMore = async () => {
  ledgerLimit.value += 10
  await loadLedgerData()
  // Optionally, reset the local display page to 1:
  ledgerDisplayPage.value = 1
}

// Handler for local pagination changes in the ledger modal cards.
// (If your card view supports pagination controls.)
const handleLocalPageChange = (page) => {
  ledgerDisplayPage.value = page
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- Notification Bar for errors -->
      <NotificationBar v-if="itemStore.error" :icon="mdiAlertCircle" color="danger">
        {{ itemStore.error }}
      </NotificationBar>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Item Ledger" main>
        <div class="flex items-center gap-2">
          <BaseButton :icon="mdiExport" color="warning" label="Export Ledger" />
        </div>
      </SectionTitleLineWithButton>
      <!-- Main Items Table using BaseTable -->
      <BaseTable
        :columns="mainColumns"
        :data="ledgerData"
        :loading="itemStore.isLoading"
        @query-change="handleQueryChange"
      >
        <!-- Scoped slot for custom actions (View Ledger) -->
        <template #cell-actions="{ row }">
          <button class="text-blue-600 underline" @click="viewLedger(row)" title="View Ledger">
            <svg style="width: 18px; height: 18px" viewBox="0 0 24 24">
              <path :d="mdiEye" />
            </svg>
          </button>
        </template>
      </BaseTable>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- Ledger Details Modal using a Compact Card-Based UI -->
  <div
    v-if="isLedgerModalVisible"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white p-4 rounded shadow-lg w-[800px] max-h-screen overflow-auto">
      <h2 class="text-lg font-semibold mb-2">Stock Movement Ledger</h2>

      <!-- Ledger Cards Container -->
      <div class="space-y-2">
        <div
          v-for="entry in ledgerCardData.data"
          :key="entry.id"
          class="flex items-center p-2 border-l-4 bg-gray-50 shadow-sm"
          :class="entry.type === 'IN' ? 'border-green-500' : 'border-red-500'"
        >
          <!-- Compact Icon -->
          <div class="mr-2">
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              :class="entry.type === 'IN' ? 'text-green-500' : 'text-red-500'"
            >
              <path :d="entry.type === 'IN' ? mdiArrowDownBold : mdiArrowUpBold" />
            </svg>
          </div>
          <!-- Compact Details -->
          <div class="flex-1 text-xs">
            <div class="flex justify-between">
              <span class="font-semibold">{{ entry.type }}</span>
              <span class="text-gray-500">{{
                new Date(entry.created_at).toLocaleDateString()
              }}</span>
            </div>
            <div class="mt-1">
              <span
                >Qty Change: <strong>{{ entry.quantity_change }}</strong></span
              >
              <span class="ml-2"
                >New Qty: <strong>{{ entry.new_quantity }}</strong></span
              >
            </div>
            <div class="mt-1">
              <span
                >Warehouse: <strong>{{ entry.warehouse?.name || entry.warehouse_id }}</strong></span
              >
            </div>
            <div class="mt-1">
              <span
                >Note: <em>{{ entry.note || 'N/A' }}</em></span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Local Pagination Controls for Card Display -->
      <div class="flex justify-between items-center mt-3 text-xs text-gray-600">
        <button
          v-if="ledgerDisplayPage > 1"
          @click="handleLocalPageChange(ledgerDisplayPage - 1)"
          class="px-3 py-1 bg-gray-300 rounded"
        >
          Previous
        </button>
        <div>Page {{ ledgerCardData.currentPage }} of {{ ledgerCardData.totalPages }}</div>
        <button
          v-if="ledgerDisplayPage < ledgerCardData.totalPages"
          @click="handleLocalPageChange(ledgerDisplayPage + 1)"
          class="px-3 py-1 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>

      <!-- Load More Button / Loader (for fetching additional data from the backend) -->
      <div class="flex justify-center mt-3">
        <button
          v-if="!ledgerLoading && ledgerModalData.length < ledgerTotal"
          @click="loadMore"
          class="px-4 py-1 bg-blue-600 text-white rounded text-xs"
        >
          Load More
        </button>
        <div v-else-if="ledgerLoading" class="text-xs">Loading...</div>
      </div>

      <!-- Close Modal Button -->
      <div class="flex justify-end mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded text-xs" @click="isLedgerModalVisible = false">
          Close
        </button>
      </div>
    </div>
  </div>
</template>
