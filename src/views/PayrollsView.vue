<script setup>
import { ref, computed, getCurrentInstance, onMounted, watch } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import {
  mdiPlus,
  mdiTableBorder,
  mdiDelete,
  mdiAlertCircle,
  mdiPencil,
  mdiEye,
  mdiReceiptTextCheck,
  mdiClipboardCheck
} from '@mdi/js'
import { usePayrollStore } from '../stores/hr/payrollStore'
import { useEmployeeStore } from '../stores/hr/employeeStore'

// Retrieve API_URL if needed
const { appContext } = getCurrentInstance()
const API_URL = appContext.config.globalProperties.API_URL || ''

// --- STORES ---
const payrollStore = usePayrollStore()
const employeeStore = useEmployeeStore()
const selectedPayrolls = ref([])

// Fetch employee list for dropdowns
employeeStore.fetchItems({ page: 1, limit: 100 }, true)

// --- FILTER STATE ---
// Set default date range to the start and end of the current month
const now = new Date()
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
const selectedDateRange = ref([startOfMonth, endOfMonth])

// --- HELPER FUNCTION ---
// Format date as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// --- STATE ---
// New and Edit Payroll modals (no payroll_date field; only a range for start and end)
const showNewPayrollModal = ref(false)
const showEditPayrollModal = ref(false)

// Instead of payroll_date, we'll use a range picker for start and end dates
const newPayrollForm = ref({
  employee_id: null,
  // We'll update these from the datepicker range
  start_date: '',
  end_date: '',
  is_active: true
})
const editPayrollForm = ref({
  id: null,
  employee_id: null,
  start_date: '',
  end_date: '',
  is_active: true
})

// Reactive variables for the date range in new and edit modals
const newPayrollRange = ref([
  new Date(now.getFullYear(), now.getMonth(), 1),
  new Date(now.getFullYear(), now.getMonth() + 1, 0)
])
const editPayrollRange = ref([
  new Date(now.getFullYear(), now.getMonth(), 1),
  new Date(now.getFullYear(), now.getMonth() + 1, 0)
])

// Mark as Paid modal state
const showMarkAsPaidModal = ref(false)
const markAsPaidForm = ref({
  payroll_id: null,
  payment_method: 'bank_transfer',
  remarks: ''
})

// Payroll Details modal state
const showPayrollDetailsModal = ref(false)
const payrollDetails = ref({})

// --- FETCH DATA ---
async function fetchPayrolls(queryParams = {}, forceRefresh = false) {
  await payrollStore.fetchItems(queryParams, forceRefresh)
}

// Fetch filtered payrolls using the selected date range
async function fetchFilteredPayrolls() {
  const startDate = formatDateTimeStart(selectedDateRange.value[0])
  const endDate = formatDateTimeEnd(selectedDateRange.value[1])
  await fetchPayrolls(
    {
      'filters[start_date]': startDate,
      'filters[end_date]': endDate,
      page: 1,
      limit: 10
    },
    true
  )
}

// Helper functions for filtering (with time parts)
function formatDateTimeStart(date) {
  // For filtering, we want start of day with time
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}T00:00:00`
}
function formatDateTimeEnd(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}T23:59:59`
}

// On mount, fetch payrolls with the default date filter
onMounted(() => {
  fetchFilteredPayrolls()
})

const payrollData = computed(() => ({
  total: payrollStore.items?.total || 0,
  totalPages: payrollStore.items?.totalPages || 1,
  currentPage: payrollStore.items?.currentPage || 1,
  pageSize: payrollStore.items?.pageSize || 10,
  data: (payrollStore.items?.data || []).map((item) => ({
    ...item,
    employee: item.employee
      ? `${item.employee.first_name} ${item.employee.last_name}`
      : `Employee ${item.employee_id}`
  }))
}))

// --- TABLE COLUMNS ---
const payrollColumns = [
  { key: 'employee', label: 'Employee', sortable: true, filterable: true },
  { key: 'payroll_date', label: 'Payroll Date', sortable: true, filterable: true },
  { key: 'start_date', label: 'Start Date', sortable: true, filterable: true },
  { key: 'end_date', label: 'End Date', sortable: true, filterable: true },
  { key: 'basic_salary', label: 'Basic Salary', sortable: true, filterable: true },
  { key: 'status', label: 'Status', sortable: true, filterable: true },
  { key: 'payment_method', label: 'Payment Method', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchPayrolls(query, true)
}

const handleSelected = (selectedList) => {
  selectedPayrolls.value = selectedList
}

const handleEditPayroll = async (row) => {
  payrollStore.isLoading = true
  editPayrollForm.value = {
    id: row.id,
    employee_id: row.employee_id,
    start_date: row.start_date,
    end_date: row.end_date,
    is_active: row.is_active
  }
  // Pre-populate the edit range using the current values
  editPayrollRange.value = [new Date(row.start_date), new Date(row.end_date)]
  showEditPayrollModal.value = true
  payrollStore.isLoading = false
}

const handleShowNewPayrollModal = async () => {
  await employeeStore.fetchItems({ page: 1, limit: 100 }, true)
  newPayrollForm.value = {
    employee_id: null,
    start_date: '',
    end_date: '',
    is_active: true
  }
  // Set default new range to today for both start and end
  newPayrollRange.value = [
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
  ]
  showNewPayrollModal.value = true
}

// --- PAYROLL ACTIONS ---
// For new payroll, set start_date, end_date from newPayrollRange and set payroll_date to today automatically.
async function saveNewPayroll() {
  newPayrollForm.value.start_date = formatDate(newPayrollRange.value[0])
  newPayrollForm.value.end_date = formatDate(newPayrollRange.value[1])
  // Set payroll_date automatically to today
  const payroll_date = formatDate(new Date())
  const payload = { ...newPayrollForm.value, payroll_date }
  const response = await payrollStore.generatePayroll(payload)
  if (!payrollStore.error && response) {
    showNewPayrollModal.value = false
    await fetchFilteredPayrolls()
  }
}

// For editing, update start and end dates from editPayrollRange.
async function updatePayroll() {
  editPayrollForm.value.start_date = formatDate(editPayrollRange.value[0])
  editPayrollForm.value.end_date = formatDate(editPayrollRange.value[1])
  await payrollStore.updateItem(editPayrollForm.value.id, editPayrollForm.value)
  if (!payrollStore.error) {
    showEditPayrollModal.value = false
    await fetchFilteredPayrolls()
  }
}

async function deleteSelectedPayrolls() {
  if (selectedPayrolls.value.length === 0) return

  const confirmDelete = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete them!'
  })

  if (confirmDelete.isConfirmed) {
    for (const payrollId of selectedPayrolls.value) {
      await payrollStore.deleteItem(payrollId)
      if (payrollStore.error) break
    }
    if (!payrollStore.error) {
      selectedPayrolls.value = []
      await fetchFilteredPayrolls()
      Swal.fire('Deleted!', 'The payroll records have been deleted.', 'success')
    }
  }
}

// --- ROW ACTIONS ---
// Approve row action
async function approvePayroll(row) {
  const response = await payrollStore.approvePayroll(row.id)
  if (!payrollStore.error && response) {
    await fetchFilteredPayrolls()
    Swal.fire('Approved!', 'The payroll has been approved.', 'success')
  }
}

// Instead of directly marking as paid, open the Mark as Paid modal
function handleMarkAsPaid(row) {
  markAsPaidForm.value = {
    payroll_id: row.id,
    payment_method: 'bank_transfer',
    remarks: ''
  }
  showMarkAsPaidModal.value = true
}

// Confirm Mark as Paid action using the modal data
async function confirmMarkAsPaid() {
  const response = await payrollStore.markAsPaid(
    markAsPaidForm.value.payroll_id,
    markAsPaidForm.value
  )
  if (!payrollStore.error && response) {
    showMarkAsPaidModal.value = false
    await fetchFilteredPayrolls()
    Swal.fire('Paid!', 'The payroll has been marked as paid.', 'success')
  }
}

// View payroll details modal with organized layout
function viewPayrollDetails(row) {
  payrollDetails.value = row
  showPayrollDetailsModal.value = true
}
</script>

<template>
  <LayoutAuthenticated>
    <NotificationBar v-if="payrollStore.error" :icon="mdiAlertCircle" color="danger">
      {{ payrollStore.error }}
    </NotificationBar>

    <SectionTitleLineWithButton :icon="mdiTableBorder" title="Payroll" main>
      <div class="flex items-center gap-2">
        <BaseButton
          :icon="mdiPlus"
          color="primary"
          label="Generate Payroll"
          @click="handleShowNewPayrollModal"
        />
        <BaseButton
          v-if="selectedPayrolls.length"
          :icon="mdiDelete"
          color="danger"
          label="Delete"
          @click="deleteSelectedPayrolls"
        />
      </div>
    </SectionTitleLineWithButton>

    <!-- Date Filter Section -->
    <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Select Payroll Date Range</label>
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

    <CardBox class="mb-6">
      <BaseTable
        :columns="payrollColumns"
        :data="payrollData"
        :loading="payrollStore.isLoading"
        checkable
        @query-change="handleQueryChange"
        @selected="handleSelected"
        @edit="handleEditPayroll"
      >
        <!-- Custom Row Actions Slot -->
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <!-- Approve if status is 'draft' -->

            <BaseButton
              v-if="row.status === 'draft'"
              :icon="mdiPencil"
              color="light"
              size="small"
              @click="handleEditPayroll(row)"
            />

            <!-- View Details -->
            <BaseButton
              :icon="mdiEye"
              color="light"
              size="small"
              @click="viewPayrollDetails(row)"
            />

            <BaseButton
              v-if="row.status === 'draft'"
              :icon="mdiClipboardCheck"
              color="success"
              size="small"
              @click="approvePayroll(row)"
            />

            <!-- Mark as Paid if status is 'approved' -->
            <BaseButton
              v-if="row.status === 'approved'"
              :icon="mdiReceiptTextCheck"
              color="danger"
              size="small"
              @click="handleMarkAsPaid(row)"
            />
          </div>
        </template>
      </BaseTable>
    </CardBox>

    <!-- New Payroll Modal -->
    <div
      v-if="showNewPayrollModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Generate Payroll</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- Employee Selection -->
          <div class="col-span-2">
            <label class="block mb-1">Employee</label>
            <select v-model.number="newPayrollForm.employee_id" class="w-full border p-2 rounded">
              <option value="" disabled>Select Employee</option>
              <option
                v-for="employee in employeeStore.items.data"
                :key="employee.id"
                :value="employee.id"
              >
                {{ employee.first_name }} {{ employee.last_name }}
              </option>
            </select>
          </div>
          <!-- Use Datepicker to select Start and End Dates -->
          <div class="col-span-2">
            <label class="block mb-1">Select Date Range</label>
            <Datepicker
              v-model="newPayrollRange"
              range
              multi-calendars
              format="yyyy-MM-dd"
              input-class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showNewPayrollModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewPayroll">
            Generate
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Payroll Modal -->
    <div
      v-if="showEditPayrollModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Payroll</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- Employee Selection -->
          <div class="col-span-2">
            <label class="block mb-1">Employee</label>
            <select v-model.number="editPayrollForm.employee_id" class="w-full border p-2 rounded">
              <option value="" disabled>Select Employee</option>
              <option
                v-for="employee in employeeStore.items.data"
                :key="employee.id"
                :value="employee.id"
              >
                {{ employee.first_name }} {{ employee.last_name }}
              </option>
            </select>
          </div>
          <!-- Use Datepicker to select Start and End Dates -->
          <div class="col-span-2">
            <label class="block mb-1">Select Date Range</label>
            <Datepicker
              v-model="editPayrollRange"
              range
              multi-calendars
              format="yyyy-MM-dd"
              input-class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showEditPayrollModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updatePayroll">
            Update
          </button>
        </div>
      </div>
    </div>

    <!-- Mark as Paid Modal -->
    <div
      v-if="showMarkAsPaidModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[400px]">
        <h2 class="text-xl mb-4">Mark as Paid</h2>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Payment Method</label>
            <select v-model="markAsPaidForm.payment_method" class="w-full border p-2 rounded">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Remarks</label>
            <textarea v-model="markAsPaidForm.remarks" class="w-full border p-2 rounded"></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showMarkAsPaidModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="confirmMarkAsPaid">
            Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- Payroll Details Modal -->
    <div
      v-if="showPayrollDetailsModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px] max-h-full overflow-auto">
        <h2 class="text-xl font-semibold mb-4">Payroll Details</h2>
        <!-- Header Section -->
        <div class="grid grid-cols-2 gap-4 border-b pb-4">
          <div class="flex justify-between">
            <span class="font-medium">Employee:</span>
            <span>{{ payrollDetails.employee || 'N/A' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Payroll Date:</span>
            <span>{{ payrollDetails.payroll_date }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Start Date:</span>
            <span>{{ payrollDetails.start_date }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">End Date:</span>
            <span>{{ payrollDetails.end_date }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Status:</span>
            <span>{{ payrollDetails.status }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Active:</span>
            <span>{{ payrollDetails.is_active ? 'Yes' : 'No' }}</span>
          </div>
        </div>
        <!-- Salary Details Section -->
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between">
              <span class="font-medium">Basic Salary:</span>
              <span>{{ payrollDetails.basic_salary }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Gross Salary:</span>
              <span>{{ payrollDetails.gross_salary }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Net Salary:</span>
              <span>{{ payrollDetails.net_salary }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex justify-between">
              <span class="font-medium">Payment Method:</span>
              <span>{{ payrollDetails.payment_method }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Remarks:</span>
              <span>{{ payrollDetails.remarks || 'N/A' }}</span>
            </div>
          </div>
        </div>
        <!-- Work & Pay Metrics Section -->
        <div class="mt-4">
          <h3 class="text-lg font-medium mb-2">Work & Pay Metrics</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <div class="flex justify-between">
                <span class="font-medium">Total Days Worked:</span>
                <span>{{ payrollDetails.total_days_worked }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Total Hours Worked:</span>
                <span>{{ payrollDetails.total_hours_worked }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Overtime Hours:</span>
                <span>{{ payrollDetails.overtime_hours }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Overtime Pay:</span>
                <span>{{ payrollDetails.overtime_pay }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex justify-between">
                <span class="font-medium">Night Differential Hours:</span>
                <span>{{ payrollDetails.night_differential_hours }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Night Differential Pay:</span>
                <span>{{ payrollDetails.night_differential_pay }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Holiday Hours:</span>
                <span>{{ payrollDetails.holiday_hours }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Holiday Pay:</span>
                <span>{{ payrollDetails.holiday_pay }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Allowances & Deductions Section -->
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="flex justify-between">
            <span class="font-medium">Allowances:</span>
            <span>{{ payrollDetails.allowances }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Deductions:</span>
            <span>{{ payrollDetails.deductions }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Tax Deduction:</span>
            <span>{{ payrollDetails.tax_deduction }}</span>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showPayrollDetailsModal = false">
            Close
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
