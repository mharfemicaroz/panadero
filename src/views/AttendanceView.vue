<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'
import { useAttendanceStore } from '../stores/hr/attendanceStore'
import { useEmployeeStore } from '../stores/hr/employeeStore'

const { appContext } = getCurrentInstance()
const API_URL = appContext.config.globalProperties.API_URL || ''

// --- STATE FOR MODALS ---
const showNewAttendanceModal = ref(false)
const showEditAttendanceModal = ref(false)

// --- FORM DATA ---
const newAttendanceForm = ref({
  employee_id: null,
  date: '',
  status: 'present',
  total_hours: 0,
  overtime_hours: 0,
  remarks: ''
})

const editAttendanceForm = ref({
  id: null,
  employee_id: null,
  date: '',
  status: 'present',
  total_hours: 0,
  overtime_hours: 0,
  remarks: ''
})

// --- STORES ---
const attendanceStore = useAttendanceStore()
const employeeStore = useEmployeeStore()
const selectedAttendances = ref([])

// --- FETCH ATTENDANCE DATA ---
async function fetchAttendances(queryParams = {}, forceRefresh = false) {
  await attendanceStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch – note we use a page size of 10 here.
fetchAttendances({ page: 1, limit: 10 })

// Transform attendance records to include a computed employee name
const attendanceData = computed(() => ({
  total: attendanceStore.items?.total || 0,
  totalPages: attendanceStore.items?.totalPages || 1,
  currentPage: attendanceStore.items?.currentPage || 1,
  pageSize: attendanceStore.items?.pageSize || 10,
  data: (attendanceStore.items?.data || []).map((record) => ({
    ...record,
    employee_name: record.employee
      ? `${record.employee.first_name} ${record.employee.last_name}`
      : record.employee_id
  }))
}))

// --- TABLE COLUMNS ---
const attendanceColumns = [
  { key: 'employee_name', label: 'Employee', sortable: false, filterable: false },
  { key: 'date', label: 'Date', sortable: true, filterable: true },
  { key: 'status', label: 'Status', sortable: true, filterable: true },
  { key: 'total_hours', label: 'Total Hours', sortable: true, filterable: true },
  { key: 'overtime_hours', label: 'Overtime Hours', sortable: true, filterable: true },
  { key: 'remarks', label: 'Remarks', sortable: false, filterable: false }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchAttendances(query, true)
}

const handleSelected = (selectedList) => {
  selectedAttendances.value = selectedList
}

const handleEditAttendance = async (row) => {
  attendanceStore.isLoading = true
  await employeeStore.fetchItems({ page: 1, limit: 100 }, true)
  editAttendanceForm.value = {
    id: row.id,
    employee_id: row.employee_id,
    date: row.date,
    status: row.status,
    total_hours: row.total_hours,
    overtime_hours: row.overtime_hours,
    remarks: row.remarks
  }

  showEditAttendanceModal.value = true
  attendanceStore.isLoading = false
}

const handleShowNewAttendanceModal = async () => {
  attendanceStore.isLoading = true

  // Fetch employees to populate the employee select
  await employeeStore.fetchItems({ page: 1, limit: 100 }, true)
  newAttendanceForm.value = {
    employee_id: null,
    date: '',
    status: 'present',
    total_hours: 0,
    overtime_hours: 0,
    remarks: ''
  }

  showNewAttendanceModal.value = true
  attendanceStore.isLoading = false
}

async function saveNewAttendance() {
  await attendanceStore.createItem(newAttendanceForm.value)
  if (!attendanceStore.error) {
    showNewAttendanceModal.value = false
    await fetchAttendances({ page: 1, limit: 10 }, true)
  }
}

async function updateAttendance() {
  await attendanceStore.updateItem(editAttendanceForm.value.id, editAttendanceForm.value)
  if (!attendanceStore.error) {
    showEditAttendanceModal.value = false
    await fetchAttendances({ page: 1, limit: 10 }, true)
  }
}

async function deleteSelectedAttendances() {
  if (selectedAttendances.value.length === 0) return

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
    for (const attendanceId of selectedAttendances.value) {
      await attendanceStore.deleteItem(attendanceId)
      if (attendanceStore.error) break
    }

    if (!attendanceStore.error) {
      selectedAttendances.value = []
      await fetchAttendances({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The attendance records have been deleted.', 'success')
    }
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="attendanceStore.error" :icon="mdiAlertCircle" color="danger">
        {{ attendanceStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Attendance Records" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Attendance"
            @click="handleShowNewAttendanceModal"
          />
          <BaseButton
            v-if="selectedAttendances.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedAttendances"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="attendanceColumns"
          :data="attendanceData"
          :loading="attendanceStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditAttendance"
        />
      </CardBox>
    </SectionMain>

    <!-- New Attendance Modal -->
    <div
      v-if="showNewAttendanceModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Attendance Record</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1">Employee</label>
            <select v-model="newAttendanceForm.employee_id" class="w-full border p-2 rounded">
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
          <div class="col-span-2">
            <label class="block mb-1">Date</label>
            <input v-model="newAttendanceForm.date" type="date" class="w-full border p-2 rounded" />
          </div>
          <div>
            <label class="block mb-1">Status</label>
            <select v-model="newAttendanceForm.status" class="w-full border p-2 rounded">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Total Hours</label>
            <input
              v-model.number="newAttendanceForm.total_hours"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Overtime Hours</label>
            <input
              v-model.number="newAttendanceForm.overtime_hours"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Remarks</label>
            <textarea
              v-model="newAttendanceForm.remarks"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showNewAttendanceModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewAttendance">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Attendance Modal -->
    <div
      v-if="showEditAttendanceModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Attendance Record</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1">Employee</label>
            <select v-model="editAttendanceForm.employee_id" class="w-full border p-2 rounded">
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
          <div class="col-span-2">
            <label class="block mb-1">Date</label>
            <input
              v-model="editAttendanceForm.date"
              type="date"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Status</label>
            <select v-model="editAttendanceForm.status" class="w-full border p-2 rounded">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Total Hours</label>
            <input
              v-model.number="editAttendanceForm.total_hours"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Overtime Hours</label>
            <input
              v-model.number="editAttendanceForm.overtime_hours"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Remarks</label>
            <textarea
              v-model="editAttendanceForm.remarks"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showEditAttendanceModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateAttendance">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
