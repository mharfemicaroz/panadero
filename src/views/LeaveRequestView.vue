<script setup>
import { ref, computed, onMounted } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import { useLeaveRequestStore } from '../stores/hr/leaveRequestStore'
import { useEmployeeStore } from '../stores/hr/employeeStore'
import { useLeaveTypeStore } from '../stores/hr/leaveTypeStore'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import {
  mdiPlus,
  mdiTableBorder,
  mdiDelete,
  mdiAlertCircle,
  mdiCheck,
  mdiClose,
  mdiArrowUp,
  mdiEye
} from '@mdi/js'

// --- Datepicker Imports ---
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

// --- STATE ---
const showNewLeaveRequestModal = ref(false)
const showEditLeaveRequestModal = ref(false)
const showRejectModal = ref(false)
const showViewDetailsModal = ref(false)
const showEscalateModal = ref(false)
const leaveRequestDetails = ref({})

// The leave request forms now omit start_date/end_date because those are managed separately
const newLeaveRequestForm = ref({
  employee_id: '',
  leave_type_id: '',
  remarks: '',
  emergency_contact: '',
  attachment: ''
})

const editLeaveRequestForm = ref({
  id: null,
  employee_id: '',
  leave_type_id: '',
  remarks: '',
  emergency_contact: '',
  attachment: ''
})

const rejectForm = ref({
  id: null,
  reason: ''
})

const escalateForm = ref({
  id: null,
  approver_id: ''
})

// --- STORES ---
const leaveRequestStore = useLeaveRequestStore()
const employeeStore = useEmployeeStore()
const leaveTypeStore = useLeaveTypeStore()
const selectedLeaveRequests = ref([])

// --- DATE RANGE VARIABLES ---
// Use today's date as default. These reactive variables hold [start_date, end_date]
const today = new Date()
const newLeaveRequestDateRange = ref([today, today])
const editLeaveRequestDateRange = ref([today, today])

// --- COMPUTED ---
const employeeOptions = computed(() => {
  return employeeStore.items.data.map((employee) => ({
    value: employee.id,
    label: `${employee.first_name} ${employee.last_name}`
  }))
})

const leaveTypeOptions = computed(() => {
  return leaveTypeStore.items.data.map((leaveType) => ({
    value: leaveType.id,
    label: leaveType.name
  }))
})

const approverOptions = computed(() => {
  return employeeStore.items.data
    .filter((e) => e.is_manager)
    .map((employee) => ({
      value: employee.id,
      label: `${employee.first_name} ${employee.last_name}`
    }))
})

onMounted(async () => {
  await employeeStore.fetchItems({ page: 1, limit: 1000 })
  await leaveTypeStore.fetchItems({ page: 1, limit: 1000 })
  await fetchLeaveRequests({ page: 1, limit: 5 })
})

// --- FETCH DATA ---
async function fetchLeaveRequests(queryParams = {}, forceRefresh = false) {
  await leaveRequestStore.fetchItems(queryParams, forceRefresh)
}

const leaveRequestData = computed(() => ({
  total: leaveRequestStore.items?.total || 0,
  totalPages: leaveRequestStore.items?.totalPages || 1,
  currentPage: leaveRequestStore.items?.currentPage || 1,
  pageSize: leaveRequestStore.items?.pageSize || 5,
  data: leaveRequestStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const leaveRequestColumns = [
  {
    key: 'employee_id',
    label: 'Employee',
    sortable: true,
    formatter: (value, row) =>
      row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : ''
  },
  {
    key: 'leave_type_id',
    label: 'Leave Type',
    sortable: true,
    formatter: (value, row) => (row.leaveType ? row.leaveType.name : '')
  },
  { key: 'start_date', label: 'Start Date', sortable: true },
  { key: 'end_date', label: 'End Date', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    formatter: (value) => {
      const statusMap = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected'
      }
      return statusMap[value] || value
    }
  },
  { key: 'remarks', label: 'Remarks', sortable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchLeaveRequests(query, true)
}

const handleSelected = (selectedLeaveRequestsList) => {
  selectedLeaveRequests.value = selectedLeaveRequestsList
}

const handleEditLeaveRequest = (row) => {
  // Set form fields and update date range for editing.
  editLeaveRequestForm.value = {
    id: row.id,
    employee_id: row.employee_id,
    leave_type_id: row.leave_type_id,
    remarks: row.remarks,
    emergency_contact: row.emergency_contact,
    attachment: row.attachment
  }
  // Convert string dates to Date objects (assuming the dates are in a compatible format)
  editLeaveRequestDateRange.value = [new Date(row.start_date), new Date(row.end_date)]
  showEditLeaveRequestModal.value = true
}

// --- VIEW LEAVE REQUEST DETAILS ---
const viewLeaveRequestDetails = (id) => {
  const foundRequest = leaveRequestData.value.data.find((request) => request.id === id)
  if (foundRequest) {
    leaveRequestDetails.value = foundRequest
    showViewDetailsModal.value = true
  }
}

const closeViewDetailsModal = () => {
  showViewDetailsModal.value = false
}

// --- CREATE NEW LEAVE REQUEST ---
const handleShowNewLeaveRequestModal = () => {
  newLeaveRequestForm.value = {
    employee_id: '',
    leave_type_id: '',
    remarks: '',
    emergency_contact: '',
    attachment: ''
  }
  newLeaveRequestDateRange.value = [today, today]
  showNewLeaveRequestModal.value = true
}

async function saveNewLeaveRequest() {
  // Assign the selected date range to the form before saving.
  const [start, end] = newLeaveRequestDateRange.value
  const payload = {
    ...newLeaveRequestForm.value,
    start_date: start,
    end_date: end
  }
  await leaveRequestStore.createItem(payload)
  if (!leaveRequestStore.error) {
    showNewLeaveRequestModal.value = false
    await fetchLeaveRequests({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE LEAVE REQUEST ---
async function updateLeaveRequest() {
  // Assign the updated date range to the form before updating.
  const [start, end] = editLeaveRequestDateRange.value
  const payload = {
    ...editLeaveRequestForm.value,
    start_date: start,
    end_date: end
  }
  await leaveRequestStore.updateItem(editLeaveRequestForm.value.id, payload)
  if (!leaveRequestStore.error) {
    showEditLeaveRequestModal.value = false
    await fetchLeaveRequests({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED LEAVE REQUESTS ---
async function deleteSelectedLeaveRequests() {
  if (selectedLeaveRequests.value.length === 0) return

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
    for (const leaveRequestId of selectedLeaveRequests.value) {
      await leaveRequestStore.deleteItem(leaveRequestId)
      if (leaveRequestStore.error) break
    }

    if (!leaveRequestStore.error) {
      selectedLeaveRequests.value = []
      await fetchLeaveRequests({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The leave requests have been deleted.', 'success')
    }
  }
}

// --- APPROVE LEAVE REQUEST ---
async function approveLeaveRequest(id) {
  const confirmApprove = await Swal.fire({
    title: 'Approve Leave Request?',
    text: 'Are you sure you want to approve this leave request?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, approve it!'
  })

  if (confirmApprove.isConfirmed) {
    await leaveRequestStore.updateItem(id, { status: 'approved' })
    if (!leaveRequestStore.error) {
      await fetchLeaveRequests({ page: 1, limit: 5 }, true)
      Swal.fire('Approved!', 'The leave request has been approved.', 'success')
    }
  }
}

// --- REJECT LEAVE REQUEST ---
const handleRejectLeaveRequest = (id) => {
  rejectForm.value.id = id
  showRejectModal.value = true
}

async function submitReject() {
  await leaveRequestStore.rejectItem(rejectForm.value.id, rejectForm.value.reason)
  if (!leaveRequestStore.error) {
    showRejectModal.value = false
    await fetchLeaveRequests({ page: 1, limit: 5 }, true)
    Swal.fire('Rejected!', 'The leave request has been rejected.', 'success')
  }
}

// --- ESCALATE LEAVE REQUEST ---
const handleEscalateLeaveRequest = (id) => {
  escalateForm.value.id = id
  showEscalateModal.value = true
}

async function submitEscalate() {
  await leaveRequestStore.escalateItem(escalateForm.value.id, escalateForm.value.approver_id)
  if (!leaveRequestStore.error) {
    showEscalateModal.value = false
    await fetchLeaveRequests({ page: 1, limit: 5 }, true)
    Swal.fire('Escalated!', 'The leave request has been escalated.', 'success')
  }
}

// --- CLOSE MODALS ---
const closeNewLeaveRequestModal = () => {
  showNewLeaveRequestModal.value = false
}

const closeEditLeaveRequestModal = () => {
  showEditLeaveRequestModal.value = false
}

const closeRejectModal = () => {
  showRejectModal.value = false
}

const closeEscalateModal = () => {
  showEscalateModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="leaveRequestStore.error" :icon="mdiAlertCircle" color="danger">
        {{ leaveRequestStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Leave Requests" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Leave Request"
            @click="handleShowNewLeaveRequestModal"
          />
          <BaseButton
            v-if="selectedLeaveRequests.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedLeaveRequests"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="leaveRequestColumns"
          :data="leaveRequestData"
          :loading="leaveRequestStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditLeaveRequest"
        >
          <template #cell-actions="{ row }">
            <div class="flex gap-2">
              <BaseButton
                v-if="row.status === 'pending'"
                :icon="mdiCheck"
                color="success"
                small
                @click="approveLeaveRequest(row.id)"
              />
              <BaseButton
                v-if="row.status === 'pending'"
                :icon="mdiClose"
                color="danger"
                small
                @click="handleRejectLeaveRequest(row.id)"
              />
              <BaseButton
                v-if="row.status === 'pending' || row.status === 'rejected'"
                :icon="mdiArrowUp"
                color="warning"
                small
                @click="handleEscalateLeaveRequest(row.id)"
              />
              <BaseButton
                :icon="mdiEye"
                color="info"
                small
                @click="viewLeaveRequestDetails(row.id)"
              />
            </div>
          </template>
        </BaseTable>
      </CardBox>
    </SectionMain>

    <!-- New Leave Request Modal -->
    <div
      v-if="showNewLeaveRequestModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Leave Request</h2>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Employee</label>
            <select
              v-model="newLeaveRequestForm.employee_id"
              class="w-full border p-2 rounded"
              :disabled="employeeStore.isLoading"
            >
              <option value="">Select Employee</option>
              <option
                v-for="employee in employeeOptions"
                :key="employee.value"
                :value="employee.value"
              >
                {{ employee.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block mb-1">Leave Type</label>
            <select
              v-model="newLeaveRequestForm.leave_type_id"
              class="w-full border p-2 rounded"
              :disabled="leaveTypeStore.isLoading"
            >
              <option value="">Select Leave Type</option>
              <option
                v-for="leaveType in leaveTypeOptions"
                :key="leaveType.value"
                :value="leaveType.value"
              >
                {{ leaveType.label }}
              </option>
            </select>
          </div>

          <!-- Date Range Picker for Start and End Date -->
          <div>
            <label class="block mb-1">Select Date Range</label>
            <Datepicker
              v-model="newLeaveRequestDateRange"
              range
              multi-calendars
              format="yyyy-MM-dd"
              input-class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label class="block mb-1">Remarks</label>
            <textarea v-model="newLeaveRequestForm.remarks" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block mb-1">Emergency Contact</label>
            <input
              v-model="newLeaveRequestForm.emergency_contact"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Attachment</label>
            <input
              v-model="newLeaveRequestForm.attachment"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewLeaveRequestModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewLeaveRequest">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Leave Request Modal -->
    <div
      v-if="showEditLeaveRequestModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Leave Request</h2>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Employee</label>
            <select
              v-model="editLeaveRequestForm.employee_id"
              class="w-full border p-2 rounded"
              :disabled="employeeStore.isLoading"
            >
              <option value="">Select Employee</option>
              <option
                v-for="employee in employeeOptions"
                :key="employee.value"
                :value="employee.value"
              >
                {{ employee.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block mb-1">Leave Type</label>
            <select
              v-model="editLeaveRequestForm.leave_type_id"
              class="w-full border p-2 rounded"
              :disabled="leaveTypeStore.isLoading"
            >
              <option value="">Select Leave Type</option>
              <option
                v-for="leaveType in leaveTypeOptions"
                :key="leaveType.value"
                :value="leaveType.value"
              >
                {{ leaveType.label }}
              </option>
            </select>
          </div>

          <!-- Date Range Picker for Start and End Date -->
          <div>
            <label class="block mb-1">Select Date Range</label>
            <Datepicker
              v-model="editLeaveRequestDateRange"
              range
              multi-calendars
              format="yyyy-MM-dd"
              input-class="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label class="block mb-1">Remarks</label>
            <textarea v-model="editLeaveRequestForm.remarks" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block mb-1">Emergency Contact</label>
            <input
              v-model="editLeaveRequestForm.emergency_contact"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Attachment</label>
            <input
              v-model="editLeaveRequestForm.attachment"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditLeaveRequestModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateLeaveRequest">
            Update
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Reject Leave Request</h2>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Reason</label>
            <textarea
              v-model="rejectForm.reason"
              class="w-full border p-2 rounded"
              placeholder="Enter rejection reason"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeRejectModal">Cancel</button>
          <button class="px-4 py-2 bg-red-600 text-white rounded" @click="submitReject">
            Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Escalate Modal -->
    <div
      v-if="showEscalateModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Escalate Leave Request</h2>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Approver</label>
            <select v-model="escalateForm.approver_id" class="w-full border p-2 rounded">
              <option value="">Select Approver</option>
              <option
                v-for="approver in approverOptions"
                :key="approver.value"
                :value="approver.value"
              >
                {{ approver.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEscalateModal">Cancel</button>
          <button class="px-4 py-2 bg-yellow-600 text-white rounded" @click="submitEscalate">
            Escalate
          </button>
        </div>
      </div>
    </div>

    <!-- View Leave Request Details Modal -->
    <div
      v-if="showViewDetailsModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Leave Request Details</h2>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <strong>Employee:</strong>
            {{
              leaveRequestDetails.employee
                ? `${leaveRequestDetails.employee.first_name} ${leaveRequestDetails.employee.last_name}`
                : 'N/A'
            }}
          </div>
          <div>
            <strong>Leave Type:</strong>
            {{ leaveRequestDetails.leaveType ? leaveRequestDetails.leaveType.name : 'N/A' }}
          </div>
          <div>
            <strong>Start Date:</strong>
            {{ leaveRequestDetails.start_date }}
          </div>
          <div>
            <strong>End Date:</strong>
            {{ leaveRequestDetails.end_date }}
          </div>
          <div>
            <strong>Status:</strong>
            {{ leaveRequestDetails.status }}
          </div>
          <div>
            <strong>Remarks:</strong>
            {{ leaveRequestDetails.remarks }}
          </div>
          <div>
            <strong>Emergency Contact:</strong>
            {{ leaveRequestDetails.emergency_contact }}
          </div>
          <div>
            <strong>Attachment:</strong>
            {{ leaveRequestDetails.attachment }}
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeViewDetailsModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
