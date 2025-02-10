<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
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
 * - Otherwise, x-axis is dates.
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
const allDayDate = ref(new Date().toISOString().split('T')[0]) // defaults to today
const allDayStartTime = ref('00:00')
const allDayEndTime = ref('23:59')
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
// CATEGORY SALES SUMMARY TABLE SETUP (Paginated)
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
// SALES INVENTORY REPORT TABLE SETUP (Paginated)
// ---------------------------------------------------------------------
const inventoryPage = ref(1)
const inventoryPageSize = ref(10)

/**
 * Computes Sales Inventory Report data by grouping sale items by:
 * - Date (using sale.sale_date or sale.created_at substring(0,10))
 * - Item Name, Warehouse, Category, Subcategory
 *
 * For each group, calculates:
 * - Total Qty (Sold): Sum of sale item quantities.
 * - Total Amount (Sold): Sum of sale item totals.
 * - Total Amount (Cost): Sum of (sale item quantity × item cost).
 * - Total Discount: Sum of sale item discounts.
 * - Total Qty (Current): Sum of current quantities from the item's inventories.
 * - Total Amount (Current): Sum of (current quantity × item cost).
 */
const salesInventoryGroups = computed(() => {
  const groups = {}
  saleStore.items.data.forEach((sale) => {
    const saleDate = sale.sale_date
      ? sale.sale_date.substring(0, 10)
      : sale.created_at.substring(0, 10)
    if (sale.saleItems && Array.isArray(sale.saleItems)) {
      sale.saleItems.forEach((saleItem) => {
        const itemName = saleItem.item ? saleItem.item.name : 'Unknown'
        // Use sale.warehouse if available; otherwise, fallback to saleItem.item.warehouse.
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
        // For current inventory, if available, sum the current_quantity from all inventories.
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
  // Sort by Date, then Item Name.
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
// EXPORT SUMMARY FUNCTION (Excel workbook with separate worksheets)
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

  // Write the workbook and trigger download.
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

    <!-- Filter Controls (Responsive, with Advanced Filters Toggle) -->
    <div class="mb-4 p-4 border rounded bg-gray-100 flex flex-wrap items-center gap-4">
      <label class="font-medium">Select Period:</label>
      <select v-model="selectedPeriod" class="p-2 border rounded">
        <option value="all_day">All Day</option>
        <option value="this_week">This Week</option>
        <option value="last_week">Last Week</option>
        <option value="last_7_days">Last 7 Days</option>
        <option value="last_30_days">Last 30 Days</option>
        <option value="monthly">Monthly</option>
      </select>
      <template v-if="selectedPeriod === 'all_day'">
        <label>Date:</label>
        <input type="date" v-model="allDayDate" class="p-2 border rounded" />
        <label>Start Time:</label>
        <input type="time" v-model="allDayStartTime" class="p-2 border rounded" />
        <label>End Time:</label>
        <input type="time" v-model="allDayEndTime" class="p-2 border rounded" />
      </template>
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
      <button
        @click="showAdvancedFilters = !showAdvancedFilters"
        class="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        {{ showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters' }}
      </button>
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
      <div class="w-full md:w-2/3">
        <CardBox class="mb-6">
          <line-chart :data="chartData" :loading="saleStore.isLoading" class="h-96" />
        </CardBox>
      </div>
      <div class="w-full md:w-1/3">
        <CardBox class="mb-6">
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

    <!-- Sales Inventory Report Table (Paginated) -->
    <h2 class="text-xl font-semibold mb-4">Sales Inventory Report</h2>
    <CardBox class="mb-6">
      <BaseTable
        :columns="inventoryColumns"
        :show-action="false"
        :data="paginatedInventoryData"
        :loading="saleStore.isLoading"
        @query-change="handleInventoryQueryChange"
      />
    </CardBox>
  </LayoutAuthenticated>
</template>
