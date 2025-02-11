<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { mdiTableBorder, mdiExport, mdiMagnify } from '@mdi/js'
import { useProductSaleStore } from '@/stores/product/sale'
import { useUserStore } from '@/stores/user'
import { useBranchStore } from '@/stores/branch'
import { useWarehouseStore } from '@/stores/warehouse'
import { useShiftStore } from '@/stores/product/shift'
import LineChart from '@/components/Charts/LineChart.vue'
import DoughnutChart from '@/components/Charts/DoughnutChart.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

// ---------------------------------------------------------------------
// CHART SETUP (unchanged)
// ---------------------------------------------------------------------
const chartData = ref(null)
const doughnutData = ref(null)
const saleStore = useProductSaleStore()

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
// FILTERS SETUP (unchanged)
// ---------------------------------------------------------------------
const selectedPeriod = ref('all_day')
// Use a date range (array of two dates) for the "All Day" option.
const allDayRange = ref([new Date(), new Date()])

const monthlyYear = ref(new Date().getFullYear())
const monthlyMonth = ref(new Date().getMonth() + 1) // 1-indexed

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

const selectedCashier = ref('')
const selectedBranch = ref('')
const selectedWarehouse = ref('')
const showAdvancedFilters = ref(false)

const userStore = useUserStore()
const branchStore = useBranchStore()
const warehouseStore = useWarehouseStore()

// ---------------------------------------------------------------------
// NEW: SHIFT STORE SETUP
// ---------------------------------------------------------------------
const shiftStore = useShiftStore()

// Helper to format a Date object as YYYY-MM-DD
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

// Helper function to format a date string as "February 11, 2025 at 4:02 AM"
const formatShiftDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const datePart = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
  return `${datePart} at ${timePart}`
}

/**
 * Applies all selected filters by computing the start/end date (or datetime)
 * and adding any additional filter options. Then fetches sales and updates charts.
 */
const applyFilters = async () => {
  let start_date, end_date
  const today = new Date()

  if (selectedPeriod.value === 'all_day') {
    if (allDayRange.value && allDayRange.value.length === 2) {
      start_date = formatDate(allDayRange.value[0]) + 'T00:00:00'
      end_date = formatDate(allDayRange.value[1]) + 'T23:59:59'
    }
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

  let queryParams = { page: 1, limit: 10 }
  if (start_date || end_date) {
    queryParams.filters = {}
    if (start_date) queryParams.filters.start_date = start_date
    if (end_date) queryParams.filters.end_date = end_date
  }
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

  // Reset paginations when filters change.
  summaryPage.value = 1
  categorySummaryPage.value = 1
  inventoryPage.value = 1
  breakdownPaymentPage.value = 1

  await saleStore.fetchItems(queryParams, true)
  fillChartData()
  fillDoughnutData()
}

// ---------------------------------------------------------------------
// SALES TABLE SETUP (unchanged data logic)
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
// SALES REPORT SUMMARY TABLE SETUP (unchanged grouping logic)
// ---------------------------------------------------------------------
const summaryPage = ref(1)
const summaryPageSize = ref(10)
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
  return { total, totalPages, currentPage, pageSize, data: paginatedData }
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
// CATEGORY SALES SUMMARY TABLE SETUP (unchanged grouping logic)
// ---------------------------------------------------------------------
const categorySummaryPage = ref(1)
const categorySummaryPageSize = ref(10)
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
// SALES INVENTORY REPORT TABLE SETUP (unchanged grouping logic)
// ---------------------------------------------------------------------
const inventoryPage = ref(1)
const inventoryPageSize = ref(10)

const salesInventoryGroups = computed(() => {
  const groups = {}
  saleStore.items.data.forEach((sale) => {
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
    formatter: (value) => Number(value).toFixed(0)
  },
  {
    key: 'total_amount_sold',
    label: 'Total Amount (Sold)',
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'total_amount_cost',
    label: 'Total Amount (Cost)',
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'total_qty_current',
    label: 'Total Qty (Current)',
    formatter: (value) => Number(value).toFixed(0)
  },
  {
    key: 'total_amount_current',
    label: 'Total Amount (Current)',
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'total_discount',
    label: 'Total Discount',
    formatter: (value) => Number(value).toFixed(2)
  }
]

const handleInventoryQueryChange = async (query) => {
  inventoryPage.value = query.page
  inventoryPageSize.value = query.limit
}

// ---------------------------------------------------------------------
// BREAKDOWN PAYMENT SUMMARY TABLE SETUP (unchanged grouping logic)
// ---------------------------------------------------------------------
const breakdownPaymentPage = ref(1)
const breakdownPaymentPageSize = ref(10)

const breakdownPaymentSummaryGroups = computed(() => {
  const groups = {}
  saleStore.items.data.forEach((sale) => {
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
  { key: 'quantity', label: 'Quantity', formatter: (value) => Number(value).toFixed(0) },
  { key: 'total_sales', label: 'Total Sales', formatter: (value) => Number(value).toFixed(2) }
]

const handleBreakdownPaymentQueryChange = async (query) => {
  breakdownPaymentPage.value = query.page
  breakdownPaymentPageSize.value = query.limit
}

// ---------------------------------------------------------------------
// NEW: SHIFTS SUMMARY TABLE SETUP
// ---------------------------------------------------------------------
const shiftSummaryPage = ref(1)
const shiftSummaryPageSize = ref(10)
const shiftSummaryGroups = computed(() => {
  // Filter the shift store data: only include shifts with status 'closed' and non-null end_time.
  const closedShifts = shiftStore.items.data.filter(
    (shift) => shift.status === 'closed' && shift.end_time
  )
  return closedShifts.map((shift) => {
    // Look up the cashier name from userStore.
    const cashier = userStore.users.find((user) => user.id === shift.userId)
    const cashierName = cashier ? `${cashier.first_name} ${cashier.last_name}` : 'Unknown'

    // Look up the branch name from branchStore.
    const branch = branchStore.branches.data.find((b) => b.id === shift.branchId)
    const branchName = branch ? branch.name : 'Unknown'

    // Filter sales from saleStore that have the same shift id.
    const salesForShift = saleStore.items.data.filter((sale) => sale.shift_id === shift.id)

    // Expected Cash: Sum (price × quantity) from each saleItem across all sales for this shift.
    const expectedCash = salesForShift.reduce((sum, sale) => {
      let saleExpected = 0
      if (sale.saleItems && Array.isArray(sale.saleItems)) {
        sale.saleItems.forEach((saleItem) => {
          saleExpected += Number(saleItem.price) * Number(saleItem.quantity)
        })
      }
      return sum + saleExpected
    }, 0)

    // Actual Cash: Sum of sale.total_amount for each sale (this value already has discounts applied).
    const actualCash = salesForShift.reduce((sum, sale) => {
      return sum + Number(sale.total_amount)
    }, 0)

    // Difference Amount: Expected Cash - Actual Cash.
    const difference = actualCash - expectedCash

    return {
      cashier: cashierName,
      branch: branchName,
      start_shift: shift.start_time,
      end_shift: shift.end_time,
      expected_cash: expectedCash,
      actual_cash: actualCash,
      difference: difference
    }
  })
})

const paginatedShiftSummaryData = computed(() => {
  const allData = shiftSummaryGroups.value
  const total = allData.length
  const pageSize = shiftSummaryPageSize.value
  const totalPages = Math.ceil(total / pageSize) || 1
  const currentPage = shiftSummaryPage.value
  const start = (currentPage - 1) * pageSize
  const paginatedData = allData.slice(start, start + pageSize)
  return { total, totalPages, currentPage, pageSize, data: paginatedData }
})

const shiftSummaryColumns = [
  { key: 'cashier', label: 'User/Cashier' },
  { key: 'branch', label: 'Branch' },
  {
    key: 'start_shift',
    label: 'Start Shift',
    formatter: (value) => (value ? formatShiftDate(value) : '')
  },
  {
    key: 'end_shift',
    label: 'End Shift',
    formatter: (value) => (value ? formatShiftDate(value) : '')
  },
  {
    key: 'expected_cash',
    label: 'Expected Cash Amount',
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'actual_cash',
    label: 'Actual Cash Amount',
    formatter: (value) => Number(value).toFixed(2)
  },
  {
    key: 'difference',
    label: 'Difference Amount',
    formatter: (value) => Number(value).toFixed(2)
  }
]

const handleShiftSummaryQueryChange = async (query) => {
  shiftSummaryPage.value = query.page
  shiftSummaryPageSize.value = query.limit
}

// ---------------------------------------------------------------------
// EXPORT SUMMARY FUNCTION (unchanged)
// ---------------------------------------------------------------------
const exportSummary = () => {
  const wb = XLSX.utils.book_new()

  // 1. Line Chart Worksheet.
  const lineWorksheetData = []
  lineWorksheetData.push(['Time/Date', 'Total Amount'])
  if (
    chartData.value &&
    chartData.value.labels &&
    chartData.value.datasets &&
    chartData.value.datasets.length > 0
  ) {
    chartData.value.labels.forEach((label, index) => {
      lineWorksheetData.push([label, chartData.value.datasets[0].data[index]])
    })
  }
  const wsLine = XLSX.utils.aoa_to_sheet(lineWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsLine, 'Line Chart')

  // 2. Doughnut Chart Worksheet.
  const doughnutWorksheetData = []
  doughnutWorksheetData.push(['Payment Type', 'Total Amount'])
  if (
    doughnutData.value &&
    doughnutData.value.labels &&
    doughnutData.value.datasets &&
    doughnutData.value.datasets.length > 0
  ) {
    doughnutData.value.labels.forEach((label, index) => {
      doughnutWorksheetData.push([label, doughnutData.value.datasets[0].data[index]])
    })
  }
  const wsDoughnut = XLSX.utils.aoa_to_sheet(doughnutWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsDoughnut, 'Doughnut Chart')

  // 3. Sales Table Worksheet.
  const salesTableWorksheetData = []
  salesTableWorksheetData.push([
    'Sale Date',
    'Cashier',
    'Branch',
    'Warehouse',
    'Payment Type',
    'Total Amount'
  ])
  if (saleData.value && saleData.value.data) {
    saleData.value.data.forEach((sale) => {
      const saleDate = sale.sale_date ? sale.sale_date.substring(0, 10) : ''
      const cashier = sale.user ? sale.user.first_name + ' ' + sale.user.last_name : ''
      const branch = sale.branch ? sale.branch.name : ''
      const warehouse = sale.warehouse ? sale.warehouse.name : ''
      const payment_type = sale.payment_type || ''
      const total_amount = sale.total_amount || ''
      salesTableWorksheetData.push([
        saleDate,
        cashier,
        branch,
        warehouse,
        payment_type,
        total_amount
      ])
    })
  }
  const wsSalesTable = XLSX.utils.aoa_to_sheet(salesTableWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsSalesTable, 'Sales Table')

  // 4. Sales Report Summary Worksheet.
  const summaryWorksheetData = []
  summaryWorksheetData.push([
    'Time/Date',
    'Gross Sales',
    'Item Cost',
    'Gross Profit',
    'Discounts',
    'Net Sales'
  ])
  if (summaryGroups.value) {
    summaryGroups.value.forEach((row) => {
      summaryWorksheetData.push([
        row.time,
        row.gross_sales,
        row.item_cost,
        row.gross_profit,
        row.discounts,
        row.net_sales
      ])
    })
  }
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Sales Report Summary')

  // 5. Category Sales Summary Worksheet.
  const categoryWorksheetData = []
  categoryWorksheetData.push([
    'Created At',
    'Category',
    'SubCategory',
    'Sales Quantity',
    'Gross Sales',
    'Item Discounts',
    'Net Sales'
  ])
  if (categorySummaryGroups.value) {
    categorySummaryGroups.value.forEach((row) => {
      categoryWorksheetData.push([
        row.createdAt,
        row.category,
        row.subcategory,
        row.sales_quantity,
        row.gross_sales,
        row.item_discounts,
        row.net_sales
      ])
    })
  }
  const wsCategory = XLSX.utils.aoa_to_sheet(categoryWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Sales Summary')

  // 6. Sales Inventory Report Worksheet.
  const inventoryWorksheetData = []
  inventoryWorksheetData.push([
    'Date',
    'Item Name',
    'Warehouse',
    'Category',
    'Subcategory',
    'Total Qty (Sold)',
    'Total Amount (Sold)',
    'Total Amount (Cost)',
    'Total Qty (Current)',
    'Total Amount (Current)',
    'Total Discount'
  ])
  if (salesInventoryGroups.value) {
    salesInventoryGroups.value.forEach((row) => {
      inventoryWorksheetData.push([
        row.date,
        row.item_name,
        row.warehouse,
        row.category,
        row.subcategory,
        row.total_qty_sold,
        row.total_amount_sold,
        row.total_amount_cost,
        row.total_qty_current,
        row.total_amount_current,
        row.total_discount
      ])
    })
  }
  const wsInventory = XLSX.utils.aoa_to_sheet(inventoryWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Sales Inventory Report')

  // 7. Breakdown Payment Summary Worksheet.
  const breakdownWorksheetData = []
  breakdownWorksheetData.push(['Date', 'Payment Type', 'Branch', 'Quantity', 'Total Sales'])
  if (breakdownPaymentSummaryGroups.value) {
    breakdownPaymentSummaryGroups.value.forEach((row) => {
      breakdownWorksheetData.push([
        row.date,
        row.payment_type,
        row.branch,
        row.quantity,
        row.total_sales
      ])
    })
  }
  const wsBreakdown = XLSX.utils.aoa_to_sheet(breakdownWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsBreakdown, 'Breakdown Payment Summary')

  // 8. Shifts Summary Worksheet.
  const shiftWorksheetData = []
  shiftWorksheetData.push([
    'User/Cashier',
    'Branch',
    'Start Shift',
    'End Shift',
    'Expected Cash Amount',
    'Actual Cash Amount',
    'Difference Amount'
  ])
  if (shiftSummaryGroups.value) {
    shiftSummaryGroups.value.forEach((row) => {
      shiftWorksheetData.push([
        row.cashier,
        row.branch,
        row.start_shift,
        row.end_shift,
        row.expected_cash,
        row.actual_cash,
        row.difference
      ])
    })
  }
  const wsShift = XLSX.utils.aoa_to_sheet(shiftWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsShift, 'Shifts Summary')

  // Trigger file download.
  XLSX.writeFile(wb, 'Sales_Summary.xlsx')
}

// ---------------------------------------------------------------------
// ON MOUNT
// ---------------------------------------------------------------------
onMounted(async () => {
  await userStore.fetchAll()
  await branchStore.fetchAll()
  await warehouseStore.fetchAll()
  await applyFilters()
  // Fetch shift data (you may adjust query params as needed)
  await shiftStore.fetchItems({ filters: { status: 'closed' } }, true)
})
</script>

<template>
  <LayoutAuthenticated>
    <!-- Top Section: Title and Export Button -->
    <SectionTitleLineWithButton :icon="mdiTableBorder" title="Sales Summary" main>
      <div class="flex items-center gap-2">
        <BaseButton
          :icon="mdiExport"
          color="warning"
          label="Export Summary"
          @click="exportSummary"
        />
      </div>
    </SectionTitleLineWithButton>

    <!-- Filter Controls -->
    <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Period</label>
          <select
            v-model="selectedPeriod"
            class="mt-1 block w-full rounded border-gray-300 shadow-sm"
          >
            <option value="all_day">All Day</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <!-- For All Day, show the date range picker -->
        <div v-if="selectedPeriod === 'all_day'" class="md:col-span-2 lg:col-span-3">
          <label class="block text-sm font-medium text-gray-700">Select Date Range</label>
          <Datepicker
            v-model="allDayRange"
            range
            multi-calendars
            format="yyyy-MM-dd"
            input-class="mt-1 block w-full rounded border-gray-300 shadow-sm"
          />
        </div>
        <!-- For Monthly, show Year and Month selectors -->
        <template v-if="selectedPeriod === 'monthly'">
          <div>
            <label class="block text-sm font-medium text-gray-700">Year</label>
            <select
              v-model="monthlyYear"
              class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              <option v-for="year in yearsList" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Month</label>
            <select
              v-model="monthlyMonth"
              class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              <option v-for="(monthName, index) in monthsList" :key="index" :value="index + 1">
                {{ monthName }}
              </option>
            </select>
          </div>
        </template>
      </div>

      <!-- Advanced Filters Toggle -->
      <div class="mt-4">
        <button
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="inline-flex items-center px-3 py-1 border border-gray-300 rounded shadow-sm text-sm text-gray-700 hover:bg-gray-100"
        >
          {{ showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters' }}
        </button>
      </div>

      <!-- Advanced Filters -->
      <div
        v-if="showAdvancedFilters"
        class="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700">Cashier</label>
          <select
            v-model="selectedCashier"
            class="mt-1 block w-full rounded border-gray-300 shadow-sm"
          >
            <option value="">All</option>
            <option v-for="user in userStore.users" :key="user.id" :value="user.id">
              {{ user.first_name }} {{ user.last_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Branch</label>
          <select
            v-model="selectedBranch"
            class="mt-1 block w-full rounded border-gray-300 shadow-sm"
          >
            <option value="">All</option>
            <option v-for="branch in branchStore.branches.data" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Warehouse</label>
          <select
            v-model="selectedWarehouse"
            class="mt-1 block w-full rounded border-gray-300 shadow-sm"
          >
            <option value="">All</option>
            <option
              v-for="warehouse in warehouseStore.warehouses"
              :key="warehouse.id"
              :value="warehouse.id"
            >
              {{ warehouse.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filter Action Button -->
      <div class="mt-4 flex justify-end">
        <BaseButton label="Filter" color="blue" class="px-4 py-2" @click="applyFilters" />
      </div>
    </div>

    <!-- Charts Section -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="w-full md:w-2/3">
        <CardBox class="p-4 shadow-lg">
          <line-chart :data="chartData" :loading="saleStore.isLoading" class="h-96" />
        </CardBox>
      </div>
      <div class="w-full md:w-1/3">
        <CardBox class="p-4 shadow-lg">
          <doughnut-chart :data="doughnutData" :loading="saleStore.isLoading" class="h-96" />
        </CardBox>
      </div>
    </div>

    <!-- Sales Report Summary Table -->
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

    <!-- Category Sales Summary Table -->
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

    <!-- Sales Inventory Report Table -->
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

    <!-- Breakdown Payment Summary Table -->
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

    <!-- Shifts Summary Table -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Shifts Summary</h2>
      <CardBox class="shadow-lg">
        <BaseTable
          :columns="shiftSummaryColumns"
          :data="paginatedShiftSummaryData"
          :loading="shiftStore.isLoading"
          :show-action="false"
          @query-change="handleShiftSummaryQueryChange"
          table-class="min-w-full divide-y divide-gray-200"
        />
      </CardBox>
    </section>
  </LayoutAuthenticated>
</template>

<style>
/* Optional additional styling for sticky table headers and hover effects */
table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  position: sticky;
  top: 0;
  background-color: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:nth-child(odd) {
  background-color: #fff;
}

tbody tr:nth-child(even) {
  background-color: #f3f4f6;
}

tbody tr:hover {
  background-color: #e5e7eb;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

/* Adjust the Datepicker input styling if needed */
.dp__input {
  margin-top: 4px;
  height: 2.5em !important;
}
</style>
