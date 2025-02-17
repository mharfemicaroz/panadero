<script setup>
import { ref, computed, defineExpose } from 'vue'
import { mdiEye } from '@mdi/js'
import BaseTable from '../BaseTable.vue'
import CardBox from '../CardBox.vue'
import ShiftReportModal from './ShiftReportModal.vue'

const props = defineProps({
  saleStore: Object,
  shiftStore: Object,
  userStore: Object,
  branchStore: Object,
  cashRegisterStore: Object
})

const shiftSummaryPage = ref(1)
const shiftSummaryPageSize = ref(10)
const showShiftModal = ref(false)
const selectedShift = ref(null)

// Helper function to format a date string
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

const shiftSummaryGroups = computed(() => {
  try {
    // Filter the shift store data: only include shifts with status 'closed' and non-null end_time
    const closedShifts = props.shiftStore.items.data.filter(
      (shift) => shift.status === 'closed' && shift.end_time
    )
    return closedShifts.map((shift) => {
      // Look up the cashier name from userStore
      const cashier = props.userStore.users.data.find((user) => user.id === shift.userId)
      const cashierName = cashier ? `${cashier.first_name} ${cashier.last_name}` : 'Unknown'

      // Look up the branch name from branchStore
      const branch = props.branchStore.branches.data.find((b) => b.id === shift.branchId)
      const branchName = branch ? branch.name : 'Unknown'

      // Filter sales from saleStore that have the same shift id
      const salesForShift = props.saleStore.items.data.filter(
        (sale) => sale.status.toLowerCase().includes('completed') && sale.shift_id === shift.id
      )

      // Expected Cash: Sum (price × quantity) from each saleItem across all sales for this shift
      const expectedCash =
        salesForShift
          .filter((sale) => String(sale.payment_type).toLowerCase() === 'cash')
          .reduce((sum, sale) => {
            let saleExpected = 0
            if (sale.saleItems && Array.isArray(sale.saleItems)) {
              sale.saleItems.forEach((saleItem) => {
                saleExpected += Number(saleItem.price) * Number(saleItem.quantity)
              })
            }
            return sum + saleExpected
          }, 0) + Number(shift.opening_cash_amount)

      // Actual Cash: closing cash amount
      const actualCash = shift.closing_cash_amount

      // Difference Amount: Actual Cash - Expected Cash
      const difference = actualCash - expectedCash

      return {
        id: shift.id,
        cashier: cashierName,
        branch: branchName,
        opening_cash_amount: shift.opening_cash_amount,
        start_shift: shift.start_time,
        end_shift: shift.end_time,
        expected_cash: expectedCash,
        actual_cash: actualCash,
        difference: difference
      }
    })
  } catch (error) {
    return []
  }
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
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'actual_cash',
    label: 'Actual Cash Amount',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  },
  {
    key: 'difference',
    label: 'Difference Amount',
    formatter: (value) => Number(value).toFixed(2),
    aggregate: true
  }
]

const handleShiftSummaryQueryChange = (query) => {
  shiftSummaryPage.value = query.page
  shiftSummaryPageSize.value = query.limit
}

const viewShiftReport = (row) => {
  selectedShift.value = row
  showShiftModal.value = true
}

defineExpose({ shiftSummaryGroups })
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Shifts Summary</h2>
    <CardBox class="shadow-lg">
      <BaseTable
        :columns="shiftSummaryColumns"
        :data="paginatedShiftSummaryData"
        :loading="shiftStore.isLoading"
        :show-action="true"
        @query-change="handleShiftSummaryQueryChange"
        table-class="min-w-full divide-y divide-gray-200"
      >
        <template #cell-actions="{ row }">
          <button
            class="text-blue-600 underline"
            @click="viewShiftReport(row)"
            title="View Shift Report"
          >
            <svg style="width: 18px; height: 18px" viewBox="0 0 24 24">
              <path :d="mdiEye" />
            </svg>
          </button>
        </template>
      </BaseTable>
    </CardBox>

    <ShiftReportModal
      v-if="showShiftModal"
      :shift="selectedShift"
      :sale-store="saleStore"
      :cash-register-store="cashRegisterStore"
      @close="showShiftModal = false"
    />
  </section>
</template>
