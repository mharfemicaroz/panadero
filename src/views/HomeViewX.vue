<script setup>
import { ref, computed, onMounted } from 'vue'
import { mdiTableBorder, mdiExport } from '@mdi/js'
import { useProductSaleStore } from '@/stores/product/sale'
import { useUserStore } from '@/stores/user'
import { useBranchStore } from '@/stores/branch'
import { useWarehouseStore } from '@/stores/warehouse'
import LineChart from '@/components/Charts/LineChart.vue'
import DoughnutChart from '@/components/Charts/DoughnutChart.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'

// ---------------------------------------------------------------------
// CHART SETUP
// ---------------------------------------------------------------------
const chartData = ref(null) // For the line chart (time-series)
const doughnutData = ref(null) // For the doughnut chart (payment summary)
const saleStore = useProductSaleStore()

/**
 * Build data for the line chart.
 * - For "All Day": x-axis is 24 hourly labels (00:00–23:00) with amounts aggregated per hour.
 * - For other periods: x-axis is dates.
 */
const fillChartData = () => {
  if (selectedPeriod.value === 'all_day') {
    const labels = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' + i : i) + ':00')
    const dataValues = new Array(24).fill(0)
    if (saleStore.items.data.length > 0) {
      saleStore.items.data.forEach((sale) => {
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
    if (saleStore.items.data.length === 0) {
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
      const sortedSales = [...saleStore.items.data].sort(
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

/**
 * Build data for the doughnut chart by summarizing sales by payment type.
 */
const fillDoughnutData = () => {
  const paymentSummary = {}
  saleStore.items.data.forEach((sale) => {
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

// ---------------------------------------------------------------------
// FILTERS SETUP
// ---------------------------------------------------------------------
const selectedPeriod = ref('all_day')

// For "All Day": choose a specific date and time range.
const allDayDate = ref(new Date().toISOString().split('T')[0]) // defaults to today
const allDayStartTime = ref('00:00')
const allDayEndTime = ref('23:59')

// For "Monthly": choose a specific year and month.
const monthlyYear = ref(new Date().getFullYear())
const monthlyMonth = ref(new Date().getMonth() + 1) // 1-indexed

// Build a list of years (current year down to 10 years ago).
const currentYearVal = new Date().getFullYear()
const yearsList = []
for (let y = currentYearVal; y >= currentYearVal - 10; y--) {
  yearsList.push(y)
}
const monthsList = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

// Additional (advanced) filters (hidden by default).
const selectedCashier = ref('')
const selectedBranch = ref('')
const selectedWarehouse = ref('')
const showAdvancedFilters = ref(false)

// Import additional stores.
const userStore = useUserStore()
const branchStore = useBranchStore()
const warehouseStore = useWarehouseStore()

// Helper: Format a Date object as YYYY-MM-DD.
const formatDate = (date) => {
  const d = new Date(date)
  const month = '' + (d.getMonth() + 1)
  const day = '' + d.getDate()
  const year = d.getFullYear()
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
}

// Helper: Get this week’s range (Monday to Sunday).
const getThisWeekRange = () => {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: formatDate(monday), end: formatDate(sunday) }
}

// Helper: Get last week’s range.
const getLastWeekRange = () => {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const lastSunday = new Date(now)
  lastSunday.setDate(now.getDate() - dayOfWeek)
  const lastMonday = new Date(lastSunday)
  lastMonday.setDate(lastSunday.getDate() - 6)
  return { start: formatDate(lastMonday), end: formatDate(lastSunday) }
}

/**
 * Applies all selected filters by computing the start/end date (or datetime)
 * and adding any additional filter options. Then fetches sales and updates charts.
 */
const applyFilters = async () => {
  let start_date, end_date
  const today = new Date()

  if (selectedPeriod.value === 'all_day') {
    start_date = `${allDayDate.value}T${allDayStartTime.value}:00`
    end_date = `${allDayDate.value}T${allDayEndTime.value}:00`
  } else if (selectedPeriod.value === 'monthly') {
    const year = parseInt(monthlyYear.value)
    const month = parseInt(monthlyMonth.value)
    const startMonth = new Date(year, month - 1, 1)
    const endMonth = new Date(year, month, 0)
    start_date = formatDate(startMonth)
    end_date = formatDate(endMonth)
  } else if (selectedPeriod.value === 'this_week') {
    const { start, end } = getThisWeekRange()
    start_date = start
    end_date = end
  } else if (selectedPeriod.value === 'last_week') {
    const { start, end } = getLastWeekRange()
    start_date = start
    end_date = end
  } else if (selectedPeriod.value === 'last_7_days') {
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - 6)
    start_date = formatDate(pastDate)
    end_date = formatDate(today)
  } else if (selectedPeriod.value === 'last_30_days') {
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - 29)
    start_date = formatDate(pastDate)
    end_date = formatDate(today)
  }

  // Build query parameters.
  let queryParams = { page: 1, limit: 10 }
  if (start_date || end_date) {
    queryParams.filters = {}
    if (start_date) queryParams.filters.start_date = start_date
    if (end_date) queryParams.filters.end_date = end_date
  }
  // Add additional filters if set.
  if (selectedCashier.value) {
    queryParams.filters = queryParams.filters || {}
    queryParams.filters.user_id = selectedCashier.value
  }
  if (selectedBranch.value) {
    queryParams.filters = queryParams.filters || {}
    queryParams.filters.branch_id = selectedBranch.value
  }
  if (selectedWarehouse.value) {
    queryParams.filters = queryParams.filters || {}
    queryParams.filters.warehouse_id = selectedWarehouse.value
  }

  // Reset summary paginations when filters change.
  summaryPage.value = 1
  categorySummaryPage.value = 1

  await saleStore.fetchItems(queryParams, true)
  fillChartData()
  fillDoughnutData()
}

// ---------------------------------------------------------------------
// SALES TABLE SETUP (View Only)
// ---------------------------------------------------------------------
const saleData = computed(() => ({
  total: saleStore.items.total || 0,
  totalPages: saleStore.items.totalPages || 1,
  currentPage: saleStore.items.currentPage || 1,
  pageSize: saleStore.items.pageSize || 10,
  data: saleStore.items.data || []
}))

const saleColumns = [
  {
    key: 'sale_date',
    label: 'Sale Date',
    sortable: true,
    formatter: (value, row) => (row.sale_date ? row.sale_date.substring(0, 10) : '')
  },
  {
    key: 'cashier',
    label: 'Cashier',
    formatter: (value, row) => (row.user ? row.user.first_name + ' ' + row.user.last_name : '')
  },
  {
    key: 'branch',
    label: 'Branch',
    formatter: (value, row) => (row.branch ? row.branch.name : '')
  },
  {
    key: 'warehouse',
    label: 'Warehouse',
    formatter: (value, row) => (row.warehouse ? row.warehouse.name : '')
  },
  { key: 'payment_type', label: 'Payment Type', sortable: true },
  { key: 'total_amount', label: 'Total Amount', sortable: true }
]

const handleSaleQueryChange = async (query) => {
  await saleStore.fetchItems(query, true)
  fillChartData()
  fillDoughnutData()
}

// ---------------------------------------------------------------------
// SALES REPORT SUMMARY TABLE SETUP (Paginated)
// ---------------------------------------------------------------------
const summaryPage = ref(1)
const summaryPageSize = ref(10)

/**
 * Compute summary data by grouping sales.
 * - If "All Day" is selected, groups by hour (formatted as "HH:00").
 * - Otherwise, groups by date (YYYY-MM-DD).
 * For each group, calculates:
 *   • Gross Sales: Sum of sale total amounts.
 *   • Item Cost: Sum over sale items (quantity × item cost).
 *   • Gross Profit: Gross Sales - Item Cost.
 *   • Discounts: Sum of sale discount_total.
 *   • Net Sales: Gross Sales - Discounts.
 */
const summaryGroups = computed(() => {
  const groups = {}
  saleStore.items.data.forEach((sale) => {
    let groupKey = ''
    if (selectedPeriod.value === 'all_day') {
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
  return {
    total,
    totalPages,
    currentPage,
    pageSize,
    data: paginatedData
  }
})

const summaryColumns = computed(() => [
  { key: 'time', label: selectedPeriod.value === 'all_day' ? 'Time' : 'Date' },
  {
    key: 'gross_sales',
    label: 'Gross Sales',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'item_cost',
    label: 'Item Cost',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'gross_profit',
    label: 'Gross Profit',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'discounts',
    label: 'Discounts',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'net_sales',
    label: 'Net Sales',
    sortable: true,
    formatter: (value) => Number(value).toFixed(2)
  }
])

const handleSummaryQueryChange = async (query) => {
  summaryPage.value = query.page
  summaryPageSize.value = query.limit
}

// ---------------------------------------------------------------------
// CATEGORY SALES SUMMARY TABLE SETUP (Paginated)
// ---------------------------------------------------------------------
const categorySummaryPage = ref(1)
const categorySummaryPageSize = ref(10)

/**
 * Computes Category Sales Summary data by grouping sale items by:
 * - Created At (date, using sale.created_at substring(0,10))
 * - Category and Subcategory (from saleItem.item)
 *
 * For each group, calculates:
 * - Sales Quantity: Sum of sale item quantities.
 * - Gross Sales: Sum of sale item totals.
 * - Item Discounts: Sum of sale item discounts.
 * - Net Sales: Gross Sales - Item Discounts.
 */
const categorySummaryGroups = computed(() => {
  const groups = {}
  saleStore.items.data.forEach((sale) => {
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
  // Sort by Created At, then Category, then Subcategory.
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
  return {
    total,
    totalPages,
    currentPage,
    pageSize,
    data: paginatedData
  }
})

const categorySummaryColumns = [
  { key: 'createdAt', label: 'Created At' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'SubCategory' },
  {
    key: 'sales_quantity',
    label: 'Sales Quantity',
    formatter: (value) => Number(value).toFixed(0)
  },
  {
    key: 'gross_sales',
    label: 'Gross Sales',
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'item_discounts',
    label: 'Item Discounts',
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'net_sales',
    label: 'Net Sales',
    formatter: (value) => Number(value).toFixed(2)
  }
]

const handleCategorySummaryQueryChange = async (query) => {
  categorySummaryPage.value = query.page
  categorySummaryPageSize.value = query.limit
}

// ---------------------------------------------------------------------
// ON MOUNT
// ---------------------------------------------------------------------
onMounted(async () => {
  // Load options for advanced filters.
  await userStore.fetchAll()
  await branchStore.fetchAll()
  await warehouseStore.fetchAll()
  await applyFilters()
})
</script>

<template>
  <LayoutAuthenticated>
    <!-- Top Section: Title and Export Button -->
    <SectionTitleLineWithButton :icon="mdiTableBorder" title="Sales Summary" main>
      <div class="flex items-center gap-2">
        <BaseButton :icon="mdiExport" color="warning" label="Export Summary" />
      </div>
    </SectionTitleLineWithButton>

    <!-- Filter Controls (Responsive, with Advanced Filters Toggle) -->
    <div class="mb-4 p-4 border rounded bg-gray-100 flex flex-wrap items-center gap-4">
      <!-- Period Selection -->
      <label class="font-medium">Select Period:</label>
      <select v-model="selectedPeriod" class="p-2 border rounded">
        <option value="all_day">All Day</option>
        <option value="this_week">This Week</option>
        <option value="last_week">Last Week</option>
        <option value="last_7_days">Last 7 Days</option>
        <option value="last_30_days">Last 30 Days</option>
        <option value="monthly">Monthly</option>
      </select>

      <!-- Inline controls for "All Day" -->
      <template v-if="selectedPeriod === 'all_day'">
        <label>Date:</label>
        <input type="date" v-model="allDayDate" class="p-2 border rounded" />
        <label>Start Time:</label>
        <input type="time" v-model="allDayStartTime" class="p-2 border rounded" />
        <label>End Time:</label>
        <input type="time" v-model="allDayEndTime" class="p-2 border rounded" />
      </template>

      <!-- Inline controls for "Monthly" -->
      <template v-if="selectedPeriod === 'monthly'">
        <label>Year:</label>
        <select v-model="monthlyYear" class="p-2 border rounded">
          <option v-for="year in yearsList" :key="year" :value="year">{{ year }}</option>
        </select>
        <label>Month:</label>
        <select v-model="monthlyMonth" class="p-2 border rounded">
          <option v-for="(monthName, index) in monthsList" :key="index" :value="index + 1">
            {{ monthName }}
          </option>
        </select>
      </template>

      <!-- Advanced Filters Toggle -->
      <button
        @click="showAdvancedFilters = !showAdvancedFilters"
        class="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        {{ showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters' }}
      </button>

      <!-- Additional Filters (Visible when Advanced Filters are toggled) -->
      <template v-if="showAdvancedFilters">
        <label>Cashier:</label>
        <select v-model="selectedCashier" class="p-2 border rounded">
          <option value="">All</option>
          <option v-for="user in userStore.users" :key="user.id" :value="user.id">
            {{ user.first_name }} {{ user.last_name }}
          </option>
        </select>

        <label>Branch:</label>
        <select v-model="selectedBranch" class="p-2 border rounded">
          <option value="">All</option>
          <option v-for="branch in branchStore.branches" :key="branch.id" :value="branch.id">
            {{ branch.name }}
          </option>
        </select>

        <label>Warehouse:</label>
        <select v-model="selectedWarehouse" class="p-2 border rounded">
          <option value="">All</option>
          <option
            v-for="warehouse in warehouseStore.warehouses"
            :key="warehouse.id"
            :value="warehouse.id"
          >
            {{ warehouse.name }}
          </option>
        </select>
      </template>

      <button @click="applyFilters" class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Apply Filters
      </button>
    </div>

    <!-- Charts Section: Responsive Layout -->
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Line Chart (2/3 width on medium and larger screens) -->
      <div class="w-full md:w-2/3">
        <CardBox class="mb-6">
          <!-- Pass loading prop to the chart component -->
          <line-chart :data="chartData" :loading="saleStore.isLoading" class="h-96" />
        </CardBox>
      </div>
      <!-- Doughnut Chart (1/3 width on medium and larger screens) -->
      <div class="w-full md:w-1/3">
        <CardBox class="mb-6">
          <!-- Pass loading prop to the chart component -->
          <doughnut-chart :data="doughnutData" :loading="saleStore.isLoading" class="h-96" />
        </CardBox>
      </div>
    </div>

    <!-- Sales Table Section (Read-Only) -->
    <h2 class="text-xl font-semibold mb-4">Sales Table</h2>
    <CardBox class="mb-6">
      <BaseTable
        :columns="saleColumns"
        :show-action="false"
        :data="saleData"
        :loading="saleStore.isLoading"
        @query-change="handleSaleQueryChange"
      />
    </CardBox>

    <!-- Sales Report Summary Table (Paginated) -->
    <h2 class="text-xl font-semibold mb-4">Sales Report Summary</h2>
    <CardBox class="mb-6">
      <BaseTable
        :columns="summaryColumns"
        :show-action="false"
        :data="paginatedSummaryData"
        :loading="saleStore.isLoading"
        @query-change="handleSummaryQueryChange"
      />
    </CardBox>

    <!-- Category Sales Summary Table (Paginated) -->
    <h2 class="text-xl font-semibold mb-4">Category Sales Summary</h2>
    <CardBox class="mb-6">
      <BaseTable
        :columns="categorySummaryColumns"
        :show-action="false"
        :data="paginatedCategorySummaryData"
        :loading="saleStore.isLoading"
        @query-change="handleCategorySummaryQueryChange"
      />
    </CardBox>
  </LayoutAuthenticated>
</template>
