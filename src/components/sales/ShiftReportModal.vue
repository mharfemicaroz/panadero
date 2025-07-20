<script setup>
import { computed } from 'vue'
import BaseButton from '../BaseButton.vue'

const props = defineProps({
  shift: Object,
  saleStore: Object,
  cashRegisterStore: Object
})

const emit = defineEmits(['close'])

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

const shiftReportDetails = computed(() => {
  if (!props.shift) return null

  const salesForShift = props.saleStore.items.data.filter(
    (sale) => sale.status.toLowerCase().includes('completed') && sale.shift_id === props.shift.id
  )
  const totalTransactions = salesForShift.length
  const totalTendered = salesForShift.reduce((sum, sale) => sum + Number(sale.total_amount), 0)

  const expectedCash = parseFloat(props.shift.expected_cash)
  const actualCash = parseFloat(props.shift.actual_cash)
  const difference = actualCash - expectedCash
  const discounts = salesForShift.reduce((sum, sale) => sum + Number(sale.discount_total), 0)
  const grossSales = totalTendered
  const netSales = grossSales - discounts

  props.cashRegisterStore.fetchItems({ filters: { shift_id: props.shift.id } }, true)

  const paidIn = props.cashRegisterStore.items.data
    .filter((register) => register.type === 'in' && register.remarks.includes('manually'))
    .reduce((sum, register) => sum + Number(register.cash), 0)

  const paidOut = props.cashRegisterStore.items.data
    .filter((register) => register.type === 'out' && register.remarks.includes('manually'))
    .reduce((sum, register) => sum + Number(register.cash), 0)

  // Payment breakdown
  const paymentBreakdown = {}
  salesForShift.forEach((sale) => {
    const type = sale.payment_type || 'Unknown'
    if (!paymentBreakdown[type]) paymentBreakdown[type] = 0
    paymentBreakdown[type] += Number(sale.total_amount)
  })

  return {
    totalTransactions,
    totalTendered,
    expectedCash,
    actualCash,
    difference,
    openingCash: props.shift.opening_cash_amount,
    closingCash: props.shift.closing_cash_amount,
    analytics: {
      grossSales,
      discounts,
      netSales
    },
    paidIn,
    paidOut,
    paymentBreakdown
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-end">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black opacity-50" @click="emit('close')"></div>
    <!-- Modal Content -->
    <div
      class="relative bg-white w-full max-w-md h-full sm:h-auto sm:rounded-l-none sm:rounded-r-lg overflow-y-auto p-6 shadow-2xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">Shift Report</h2>
        <button @click="emit('close')" class="text-gray-600 hover:text-gray-800 focus:outline-none" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div v-if="shiftReportDetails" class="mt-4 space-y-4">
        <!-- Basic Info -->
        <div class="border-b pb-4">
          <p class="text-gray-700">
            <span class="font-semibold">Branch:</span>
            {{ shift.branch }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Cashier:</span>
            {{ shift.cashier }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Start Shift:</span>
            {{ formatShiftDate(shift.start_shift) }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">End Shift:</span>
            {{ formatShiftDate(shift.end_shift) }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Total Transactions:</span>
            {{ shiftReportDetails.totalTransactions }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Total Tendered:</span>
            {{ shiftReportDetails.totalTendered.toFixed(2) }}
          </p>
        </div>

        <!-- Cash Drawer -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Cash Drawer</h3>
          <p class="text-gray-700">
            <span class="font-semibold">Opening Amount:</span>
            {{ shift.opening_cash_amount }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Expected Cash Amount:</span>
            {{ shiftReportDetails.expectedCash.toFixed(2) }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Actual Cash Amount:</span>
            {{ shiftReportDetails.actualCash.toFixed(2) }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Difference Amount:</span>
            {{ shiftReportDetails.difference.toFixed(2) }}
          </p>
        </div>

        <!-- Analytics Summary -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Analytics Summary</h3>
          <p class="text-gray-700">
            <span class="font-semibold">Gross Sales:</span>
            {{ shiftReportDetails.analytics.grossSales.toFixed(2) }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Discounts:</span>
            {{ shiftReportDetails.analytics.discounts.toFixed(2) }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Net Sales:</span>
            {{ shiftReportDetails.analytics.netSales.toFixed(2) }}
          </p>
        </div>

        <!-- Sales Summary -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Sales Summary</h3>
          <div v-for="(amount, paymentType) in shiftReportDetails.paymentBreakdown" :key="paymentType"
            class="text-gray-700">
            <p>
              <span class="font-semibold">{{ paymentType }}:</span>
              {{ amount.toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Register Summary -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Register Summary</h3>
          <p class="text-gray-700">
            <span class="font-semibold">Paid in:</span>
            {{ shiftReportDetails.paidIn }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Paid out:</span>
            {{ shiftReportDetails.paidOut }}
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="mt-6 flex justify-end">
        <BaseButton label="Close" color="red" @click="emit('close')" />
      </div>
    </div>
  </div>
</template>
