<script setup>
import { ref, computed, onMounted } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import { useProductSaleStore } from '../stores/product/sale'
import { useUserStore } from '../stores/user'
import { useBranchStore } from '../stores/branch'
import { useWarehouseStore } from '../stores/warehouse'
import SalesFilters from '../components/sales/SalesFilters.vue'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import BaseButton from '../components/BaseButton.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import { mdiTableBorder, mdiAlertCircle, mdiEye } from '@mdi/js'

// --- STATE ---
const showReceiptModal = ref(false)
const selectedSale = ref(null)

// --- STORES ---
const saleStore = useProductSaleStore()
const userStore = useUserStore()
const branchStore = useBranchStore()
const warehouseStore = useWarehouseStore()

// --- FETCH STORE DATA ---
userStore.fetchAll()
branchStore.fetchAll()
warehouseStore.fetchAll()

// --- FETCH DATA ---
async function fetchSales(queryParams = {}, forceRefresh = true) {
  await saleStore.fetchItems(queryParams, forceRefresh)
}

// Initialize with today's date
onMounted(() => {
  const today = new Date()
  handleFilter({
    selectedPeriod: 'all_day',
    allDayRange: [today, today],
    monthlyYear: today.getFullYear(),
    monthlyMonth: today.getMonth() + 1,
    selectedCashier: '',
    selectedBranch: '',
    selectedWarehouse: ''
  })
})

// --- FILTER HANDLING ---
const selectedPeriod = ref('all_day')

const formatDate = (date) => {
  const d = new Date(date)
  const month = '' + (d.getMonth() + 1)
  const day = '' + d.getDate()
  const year = d.getFullYear()
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
}

const getThisWeekRange = () => {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: formatDate(monday), end: formatDate(sunday) }
}

const getLastWeekRange = () => {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const lastSunday = new Date(now)
  lastSunday.setDate(now.getDate() - dayOfWeek)
  const lastMonday = new Date(lastSunday)
  lastMonday.setDate(lastSunday.getDate() - 6)
  return { start: formatDate(lastMonday), end: formatDate(lastSunday) }
}

const handleFilter = async (filterData) => {
  let start_date, end_date
  const today = new Date()

  if (filterData.selectedPeriod === 'all_day') {
    if (filterData.allDayRange && filterData.allDayRange.length === 2) {
      start_date = formatDate(filterData.allDayRange[0]) + 'T00:00:00'
      end_date = formatDate(filterData.allDayRange[1]) + 'T23:59:59'
    }
  } else if (filterData.selectedPeriod === 'monthly') {
    const year = parseInt(filterData.monthlyYear)
    const month = parseInt(filterData.monthlyMonth)
    const startMonth = new Date(year, month - 1, 1)
    const endMonth = new Date(year, month, 0)
    start_date = formatDate(startMonth)
    end_date = formatDate(endMonth)
  } else if (filterData.selectedPeriod === 'this_week') {
    const { start, end } = getThisWeekRange()
    start_date = start
    end_date = end
  } else if (filterData.selectedPeriod === 'last_week') {
    const { start, end } = getLastWeekRange()
    start_date = start
    end_date = end
  } else if (filterData.selectedPeriod === 'last_7_days') {
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - 6)
    start_date = formatDate(pastDate)
    end_date = formatDate(today)
  } else if (filterData.selectedPeriod === 'last_30_days') {
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - 29)
    start_date = formatDate(pastDate)
    end_date = formatDate(today)
  }

  let queryParams = { page: 1, limit: 10 }
  if (start_date || end_date) {
    queryParams.filters = {}
    if (start_date) queryParams.filters.start_date = start_date
    if (end_date) queryParams.filters.end_date = end_date
  }
  if (filterData.selectedCashier) {
    queryParams.filters = queryParams.filters || {}
    queryParams.filters.user_id = filterData.selectedCashier
  }
  if (filterData.selectedBranch) {
    queryParams.filters = queryParams.filters || {}
    queryParams.filters.branch_id = filterData.selectedBranch
  }
  if (filterData.selectedWarehouse) {
    queryParams.filters = queryParams.filters || {}
    queryParams.filters.warehouse_id = filterData.selectedWarehouse
  }

  selectedPeriod.value = filterData.selectedPeriod
  await saleStore.fetchItems(queryParams, true)
}

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  const queryParams = {
    page: query.page || 1,
    limit: query.limit || 10,
    filters: {}
  }
  await fetchSales(queryParams, true)
}

const saleData = computed(() => ({
  total: saleStore.items?.total || 0,
  totalPages: saleStore.items?.totalPages || 1,
  currentPage: saleStore.items?.currentPage || 1,
  pageSize: saleStore.items?.pageSize || 10,
  data: saleStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const saleColumns = [
  {
    key: 'id',
    label: 'Transaction #',
    sortable: true
  },
  {
    key: 'created_at',
    label: 'Date & Time',
    sortable: true,
    formatter: (value) => new Date(value).toLocaleString()
  },
  {
    key: 'user',
    label: 'Cashier',
    formatter: (value, row) => (row.user ? `${row.user.first_name} ${row.user.last_name}` : '')
  },
  {
    key: 'total_amount',
    label: 'Amount',
    sortable: true,
    formatter: (value) => `₱${parseFloat(value).toFixed(2)}`
  }
]

const handleViewReceipt = async (row) => {
  selectedSale.value = row
  showReceiptModal.value = true
}

// --- CLOSE MODAL ---
const closeReceiptModal = () => {
  showReceiptModal.value = false
  selectedSale.value = null
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="saleStore.error" :icon="mdiAlertCircle" color="danger">
        {{ saleStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Receipts" main />

      <SalesFilters
        :user-store="userStore"
        :branch-store="branchStore"
        :warehouse-store="warehouseStore"
        @filter="handleFilter"
      />

      <CardBox class="mb-6">
        <BaseTable
          :columns="saleColumns"
          :data="saleData"
          :loading="saleStore.isLoading"
          :checkable="false"
          :showAction="true"
          @query-change="handleQueryChange"
        >
          <template #cell-actions="{ row }">
            <button
              class="text-blue-600 underline"
              @click="handleViewReceipt(row)"
              title="View Shift Report"
            >
              <svg style="width: 18px; height: 18px" viewBox="0 0 24 24">
                <path :d="mdiEye" />
              </svg>
            </button>
          </template>
        </BaseTable>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- Receipt Modal -->
  <div
    v-if="showReceiptModal && selectedSale"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[400px]">
      <h2 class="text-xl mb-4 text-center">Sales Receipt</h2>

      <div class="border-t border-b py-4 mb-4">
        <p class="mb-2"><strong>Transaction #:</strong> {{ selectedSale.id }}</p>
        <p class="mb-2">
          <strong>Date:</strong> {{ new Date(selectedSale.created_at).toLocaleString() }}
        </p>
        <p class="mb-2">
          <strong>Cashier:</strong> {{ selectedSale.user.first_name }}
          {{ selectedSale.user.last_name }}
        </p>
      </div>

      <div class="mb-4">
        <h3 class="font-bold mb-2">Items:</h3>
        <div v-for="item in selectedSale.saleItems" :key="item.id" class="mb-2">
          <div class="flex justify-between">
            <span>{{ item.item.name }} x {{ item.quantity }}</span>
            <span>₱{{ parseFloat(item.total).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="border-t pt-4">
        <div class="flex justify-between font-bold">
          <span>Total Amount:</span>
          <span>₱{{ parseFloat(selectedSale.total_amount).toFixed(2) }}</span>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeReceiptModal">Close</button>
      </div>
    </div>
  </div>
</template>
<style>
/* Adjust the Datepicker input styling if needed */
.dp__input {
  margin-top: 4px;
  height: 2.6em !important;
}
</style>
