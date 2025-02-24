<script setup>
import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useAttendanceStore } from '../stores/hr/attendanceStore'

const { appContext } = getCurrentInstance()
const API_URL = appContext.config.globalProperties.API_URL || ''

// --- Attendance Store ---
const attendanceStore = useAttendanceStore()

// --- FILTER STATE ---
// Date range filter only.
const selectedDateRange = ref([new Date(), new Date()])

// --- Helper Functions ---
// Format a date as "YYYY-MM-DDT00:00:00" for the start of the day.
function formatDateTimeStart(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}T00:00:00`
}

// Format a date as "YYYY-MM-DDT23:59:59" for the end of the day.
function formatDateTimeEnd(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}T23:59:59`
}

// --- Fetch Attendance Data ---
// Fetch attendance records using filters in the query parameters.
const fetchAttendanceData = async (queryParams = {}) => {
  let startDate = ''
  let endDate = ''
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    startDate = formatDateTimeStart(selectedDateRange.value[0])
    endDate = formatDateTimeEnd(selectedDateRange.value[1])
  }
  await attendanceStore.fetchItems(
    {
      'filters[start_date]': startDate,
      'filters[end_date]': endDate,
      page: 1,
      limit: 100
    },
    true
  )
}

// --- Aggregate Total Hours ---
// Group attendance records by employee and sum the total_hours.
const aggregatedData = computed(() => {
  const aggregation = {}
  attendanceStore.items.data.forEach((record) => {
    const employeeName = record.employee
      ? `${record.employee.first_name} ${record.employee.last_name}`
      : `Employee ${record.employee_id}`
    const hours = parseFloat(record.total_hours) || 0
    if (aggregation[employeeName]) {
      aggregation[employeeName] += hours
    } else {
      aggregation[employeeName] = hours
    }
  })
  const dataArray = []
  for (const employee in aggregation) {
    dataArray.push({
      employee,
      total_hours: aggregation[employee].toFixed(2)
    })
  }
  return {
    total: dataArray.length,
    totalPages: 1,
    currentPage: 1,
    pageSize: dataArray.length,
    data: dataArray
  }
})

// --- Table Columns ---
const totalHoursColumns = [
  { key: 'employee', label: 'Employee', sortable: true },
  { key: 'total_hours', label: 'Total Hours', sortable: true }
]

// --- Apply Filters Handler ---
const applyFilters = () => {
  fetchAttendanceData()
}

// --- Initial Fetch ---
onMounted(() => {
  fetchAttendanceData()
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="attendanceStore.error" color="danger">
        {{ attendanceStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton title="Total Hours" main>
        <!-- Read-only view; no new/edit actions -->
      </SectionTitleLineWithButton>

      <!-- Filters -->
      <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Date Range Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Select Date Range</label>
            <Datepicker
              v-model="selectedDateRange"
              range
              multi-calendars
              format="yyyy-MM-dd"
              input-class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <BaseButton label="Filter" color="blue" class="px-4 py-2" @click="applyFilters" />
        </div>
      </div>

      <!-- Total Hours Table -->
      <CardBox class="mb-6">
        <BaseTable
          :columns="totalHoursColumns"
          :data="aggregatedData"
          :loading="attendanceStore.isLoading"
          :hide-actions="true"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
