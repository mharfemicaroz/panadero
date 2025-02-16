<script setup>
import { ref, onMounted } from 'vue'
import BaseButton from '../BaseButton.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  userStore: Object,
  branchStore: Object,
  warehouseStore: Object
})

const emit = defineEmits(['filter'])

const selectedPeriod = ref('all_day')
const today = new Date()
const allDayRange = ref([today, today])

// Emit initial filter on component mount
onMounted(() => {
  applyFilters()
})
const monthlyYear = ref(new Date().getFullYear())
const monthlyMonth = ref(new Date().getMonth() + 1)
const selectedCashier = ref('')
const selectedBranch = ref('')
const selectedWarehouse = ref('')
const showAdvancedFilters = ref(false)

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

const applyFilters = () => {
  emit('filter', {
    selectedPeriod: selectedPeriod.value,
    allDayRange: allDayRange.value,
    monthlyYear: monthlyYear.value,
    monthlyMonth: monthlyMonth.value,
    selectedCashier: selectedCashier.value,
    selectedBranch: selectedBranch.value,
    selectedWarehouse: selectedWarehouse.value
  })
}
</script>

<template>
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

      <template v-if="selectedPeriod === 'monthly'">
        <div>
          <label class="block text-sm font-medium text-gray-700">Year</label>
          <select v-model="monthlyYear" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
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

    <div class="mt-4">
      <button
        @click="showAdvancedFilters = !showAdvancedFilters"
        class="inline-flex items-center px-3 py-1 border border-gray-300 rounded shadow-sm text-sm text-gray-700 hover:bg-gray-100"
      >
        {{ showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters' }}
      </button>
    </div>

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
          <option
            v-for="user in userStore.users.data.filter(
              (user) => user.role === 'cashier' || user.role === 'admin'
            )"
            :key="user.id"
            :value="user.id"
          >
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

    <div class="mt-4 flex justify-end">
      <BaseButton label="Filter" color="blue" class="px-4 py-2" @click="applyFilters" />
    </div>
  </div>
</template>
