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
import { useTimeLogStore } from '../stores/hr/timeLogStore'
import { useEmployeeStore } from '../stores/hr/employeeStore'

const { appContext } = getCurrentInstance()
const API_URL = appContext.config.globalProperties.API_URL || ''

// --- STATE FOR MODALS ---
const showNewTimeLogModal = ref(false)
const showEditTimeLogModal = ref(false)

// --- FORM DATA ---
const newTimeLogForm = ref({
  employee_id: null,
  type: 'time_in',
  log_time: '',
  remarks: ''
})

const editTimeLogForm = ref({
  id: null,
  employee_id: null,
  type: 'time_in',
  log_time: '',
  remarks: ''
})

// --- STORES ---
const timeLogStore = useTimeLogStore()
const employeeStore = useEmployeeStore()
const selectedTimeLogs = ref([])

// --- FETCH TIMELOG DATA ---
async function fetchTimeLogs(queryParams = {}, forceRefresh = false) {
  await timeLogStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch – using a page size of 10
fetchTimeLogs({ page: 1, limit: 10 })

// Map records to include computed employee name if available
const timeLogData = computed(() => ({
  total: timeLogStore.items?.total || 0,
  totalPages: timeLogStore.items?.totalPages || 1,
  currentPage: timeLogStore.items?.currentPage || 1,
  pageSize: timeLogStore.items?.pageSize || 10,
  data: (timeLogStore.items?.data || []).map((record) => ({
    ...record,
    employee_name: record.employee
      ? `${record.employee.first_name} ${record.employee.last_name}`
      : record.employee_id
  }))
}))

const editLogTime = computed({
  get() {
    if (!editTimeLogForm.value.log_time) return ''
    const date = new Date(editTimeLogForm.value.log_time)
    const pad = (num) => num.toString().padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())
    // Return a string like "2025-02-23T23:02:24"
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  },
  set(val) {
    // Convert the local input value back to a full ISO string
    const d = new Date(val)
    editTimeLogForm.value.log_time = d.toISOString() // e.g., "2025-02-23T23:02:24.000Z"
  }
})
// --- TABLE COLUMNS ---
const timeLogColumns = [
  { key: 'employee_name', label: 'Employee', sortable: false, filterable: false },
  { key: 'type', label: 'Type', sortable: true, filterable: true },
  { key: 'log_time', label: 'Log Time', sortable: true, filterable: true },
  { key: 'remarks', label: 'Remarks', sortable: false, filterable: false }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchTimeLogs(query, true)
}

const handleSelected = (selectedList) => {
  selectedTimeLogs.value = selectedList
}

const handleEditTimeLog = async (row) => {
  timeLogStore.isLoading = true
  await employeeStore.fetchItems({ page: 1, limit: 100 }, true)
  editTimeLogForm.value = {
    id: row.id,
    employee_id: row.employee_id,
    type: row.type,
    log_time: row.log_time,
    remarks: row.remarks
  }

  showEditTimeLogModal.value = true
  timeLogStore.isLoading = false
}

const handleShowNewTimeLogModal = async () => {
  timeLogStore.isLoading = true

  // Fetch employees to populate the dropdown
  await employeeStore.fetchItems({ page: 1, limit: 100 }, true)
  newTimeLogForm.value = {
    employee_id: null,
    type: 'time_in',
    log_time: '',
    remarks: ''
  }

  showNewTimeLogModal.value = true
  timeLogStore.isLoading = false
}

async function saveNewTimeLog() {
  await timeLogStore.createItem(newTimeLogForm.value)
  if (!timeLogStore.error) {
    showNewTimeLogModal.value = false
    await fetchTimeLogs({ page: 1, limit: 10 }, true)
  }
}

async function updateTimeLog() {
  await timeLogStore.updateItem(editTimeLogForm.value.id, editTimeLogForm.value)
  if (!timeLogStore.error) {
    showEditTimeLogModal.value = false
    await fetchTimeLogs({ page: 1, limit: 10 }, true)
  }
}

async function deleteSelectedTimeLogs() {
  if (selectedTimeLogs.value.length === 0) return

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
    for (const timeLogId of selectedTimeLogs.value) {
      await timeLogStore.deleteItem(timeLogId)
      if (timeLogStore.error) break
    }

    if (!timeLogStore.error) {
      selectedTimeLogs.value = []
      await fetchTimeLogs({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The time logs have been deleted.', 'success')
    }
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="timeLogStore.error" :icon="mdiAlertCircle" color="danger">
        {{ timeLogStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Time Logs" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Time Log"
            @click="handleShowNewTimeLogModal"
          />
          <BaseButton
            v-if="selectedTimeLogs.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedTimeLogs"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="timeLogColumns"
          :data="timeLogData"
          :loading="timeLogStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditTimeLog"
        />
      </CardBox>
    </SectionMain>

    <!-- New Time Log Modal -->
    <div
      v-if="showNewTimeLogModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Time Log</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1">Employee</label>
            <select v-model="newTimeLogForm.employee_id" class="w-full border p-2 rounded">
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
          <div>
            <label class="block mb-1">Type</label>
            <select v-model="newTimeLogForm.type" class="w-full border p-2 rounded">
              <option value="time_in">Time In</option>
              <option value="time_out">Time Out</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Log Time</label>
            <input
              v-model="newTimeLogForm.log_time"
              type="datetime-local"
              class="w-full border p-2 rounded"
            />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Remarks</label>
            <textarea v-model="newTimeLogForm.remarks" class="w-full border p-2 rounded"></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showNewTimeLogModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewTimeLog">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Time Log Modal -->
    <div
      v-if="showEditTimeLogModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Time Log</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1">Employee</label>
            <select v-model="editTimeLogForm.employee_id" class="w-full border p-2 rounded">
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
          <div>
            <label class="block mb-1">Type</label>
            <select v-model="editTimeLogForm.type" class="w-full border p-2 rounded">
              <option value="time_in">Time In</option>
              <option value="time_out">Time Out</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Log Time</label>
            <input v-model="editLogTime" type="datetime-local" class="w-full border p-2 rounded" />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Remarks</label>
            <textarea
              v-model="editTimeLogForm.remarks"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showEditTimeLogModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateTimeLog">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
