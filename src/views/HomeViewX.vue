<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { mdiTableBorder, mdiExport } from '@mdi/js'
import { useProductSaleStore } from '@/stores/product/sale'
import { useUserStore } from '@/stores/user'
import { useBranchStore } from '@/stores/branch'
import { useWarehouseStore } from '@/stores/warehouse'
import { useShiftStore } from '@/stores/product/shift'
import { useCashRegisterStore } from '@/stores/product/cashRegister'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import SalesFilters from '@/components/sales/SalesFilters.vue'
import SalesCharts from '@/components/sales/SalesCharts.vue'
import SalesReportSummary from '@/components/sales/SalesReportSummary.vue'
import CategorySalesSummary from '@/components/sales/CategorySalesSummary.vue'
import SalesInventoryReport from '@/components/sales/SalesInventoryReport.vue'
import BreakdownPaymentSummary from '@/components/sales/BreakdownPaymentSummary.vue'
import ShiftsSummary from '@/components/sales/ShiftsSummary.vue'
import SalesInitializer from '@/components/sales/SalesInitializer.vue'

// Store instantiation
const saleStore = useProductSaleStore()
const userStore = useUserStore()
const branchStore = useBranchStore()
const warehouseStore = useWarehouseStore()
const shiftStore = useShiftStore()
const cashRegisterStore = useCashRegisterStore()

// Selected period state for charts
const selectedPeriod = ref('all_day')

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
  await shiftStore.fetchItems(
    { ...queryParams, filters: { ...queryParams.filters, status: 'closed' } },
    true
  )
}

// Get data from child components via refs
const salesChartsRef = ref(null)
const salesReportRef = ref(null)
const categorySalesRef = ref(null)
const salesInventoryRef = ref(null)
const breakdownPaymentRef = ref(null)
const shiftsRef = ref(null)

const exportSummary = () => {
  const wb = XLSX.utils.book_new()
  // 1. Line Chart Worksheet
  const lineWorksheetData = []
  if (
    salesChartsRef.value?.chartData?.labels &&
    salesChartsRef.value?.chartData?.datasets &&
    salesChartsRef.value?.chartData?.datasets.length > 0
  ) {
    salesChartsRef.value.chartData.labels.forEach((label, index) => {
      lineWorksheetData.push([label, salesChartsRef.value.chartData.datasets[0].data[index]])
    })
  }
  const wsLine = XLSX.utils.aoa_to_sheet(lineWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsLine, 'Line Chart')

  // 2. Doughnut Chart Worksheet
  const doughnutWorksheetData = []
  doughnutWorksheetData.push(['Payment Type', 'Total Amount'])
  if (
    salesChartsRef.value?.doughnutData?.labels &&
    salesChartsRef.value?.doughnutData?.datasets &&
    salesChartsRef.value?.doughnutData?.datasets.length > 0
  ) {
    salesChartsRef.value.doughnutData.labels.forEach((label, index) => {
      doughnutWorksheetData.push([label, salesChartsRef.value.doughnutData.datasets[0].data[index]])
    })
  }
  const wsDoughnut = XLSX.utils.aoa_to_sheet(doughnutWorksheetData)
  XLSX.utils.book_append_sheet(wb, wsDoughnut, 'Doughnut Chart')

  // 3. Sales Table Worksheet
  const salesTableWorksheetData = []
  salesTableWorksheetData.push([
    'Sale Date',
    'Cashier',
    'Branch',
    'Warehouse',
    'Payment Type',
    'Total Amount'
  ])
  if (saleStore.items) {
    saleStore.items.data.forEach((sale) => {
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

  // 4. Sales Report Summary Worksheet
  const summaryWorksheetData = []
  summaryWorksheetData.push([
    'Time/Date',
    'Gross Sales',
    'Item Cost',
    'Gross Profit',
    'Discounts',
    'Net Sales'
  ])

  if (salesReportRef.value?.summaryGroups) {
    salesReportRef.value.summaryGroups.forEach((row) => {
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

  // 5. Category Sales Summary Worksheet
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
  if (categorySalesRef.value?.categorySummaryGroups) {
    categorySalesRef.value.categorySummaryGroups.forEach((row) => {
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

  // 6. Sales Inventory Report Worksheet
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
  if (salesInventoryRef.value?.salesInventoryGroups) {
    salesInventoryRef.value.salesInventoryGroups.forEach((row) => {
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

  // 7. Breakdown Payment Summary Worksheet
  const breakdownWorksheetData = []
  breakdownWorksheetData.push(['Date', 'Payment Type', 'Branch', 'Quantity', 'Total Sales'])
  if (breakdownPaymentRef.value?.breakdownPaymentSummaryGroups) {
    breakdownPaymentRef.value.breakdownPaymentSummaryGroups.forEach((row) => {
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

  // 8. Shifts Summary Worksheet
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
  if (shiftsRef.value?.shiftSummaryGroups) {
    shiftsRef.value.shiftSummaryGroups.forEach((row) => {
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

  // Trigger file download
  XLSX.writeFile(wb, 'Sales_Summary.xlsx')
}

// Initialize store data
onMounted(async () => {
  await userStore.fetchAll()
  await branchStore.fetchAll()
  await warehouseStore.fetchAll()
})
</script>

<template>
  <LayoutAuthenticated>
    <!-- Initialize data and apply initial filter -->
    <SalesInitializer :on-initialize="handleFilter" />

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

    <!-- Filters -->
    <SalesFilters
      :user-store="userStore"
      :branch-store="branchStore"
      :warehouse-store="warehouseStore"
      @filter="handleFilter"
    />

    <!-- Charts -->
    <SalesCharts ref="salesChartsRef" :sale-store="saleStore" :selected-period="selectedPeriod" />

    <!-- Sales Report Summary -->
    <SalesReportSummary
      ref="salesReportRef"
      :sale-store="saleStore"
      :selected-period="selectedPeriod"
    />

    <!-- Category Sales Summary -->
    <CategorySalesSummary ref="categorySalesRef" :sale-store="saleStore" />

    <!-- Sales Inventory Report -->
    <SalesInventoryReport ref="salesInventoryRef" :sale-store="saleStore" />

    <!-- Breakdown Payment Summary -->
    <BreakdownPaymentSummary ref="breakdownPaymentRef" :sale-store="saleStore" />

    <!-- Shifts Summary -->
    <ShiftsSummary
      ref="shiftsRef"
      :sale-store="saleStore"
      :shift-store="shiftStore"
      :user-store="userStore"
      :branch-store="branchStore"
      :cash-register-store="cashRegisterStore"
    />
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
  height: 2.6em !important;
}
</style>
