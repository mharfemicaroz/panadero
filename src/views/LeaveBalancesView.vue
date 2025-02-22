<script setup>
import { ref, computed, onMounted } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import { useLeaveBalanceStore } from '../stores/hr/leaveBalanceStore'
import { useEmployeeStore } from '../stores/hr/employeeStore'
import { useLeaveTypeStore } from '../stores/hr/leaveTypeStore'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewLeaveBalanceModal = ref(false)
const showEditLeaveBalanceModal = ref(false)

const newLeaveBalanceForm = ref({
  employee_id: '',
  leave_type_id: '',
  total_days: 0,
  year: new Date().getFullYear()
})

const editLeaveBalanceForm = ref({
  id: null,
  employee_id: '',
  leave_type_id: '',
  total_days: 0,
  year: new Date().getFullYear()
})

// --- STORES ---
const leaveBalanceStore = useLeaveBalanceStore()
const employeeStore = useEmployeeStore()
const leaveTypeStore = useLeaveTypeStore()
const selectedLeaveBalances = ref([])

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

// --- LIFECYCLE ---
onMounted(async () => {
  await employeeStore.fetchItems({ page: 1, limit: 1000 })
  await leaveTypeStore.fetchItems({ page: 1, limit: 1000 })
})

// --- FETCH DATA ---
async function fetchLeaveBalances(queryParams = {}, forceRefresh = false) {
  await leaveBalanceStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchLeaveBalances({ page: 1, limit: 5 })

const leaveBalanceData = computed(() => ({
  total: leaveBalanceStore.items?.total || 0,
  totalPages: leaveBalanceStore.items?.totalPages || 1,
  currentPage: leaveBalanceStore.items?.currentPage || 1,
  pageSize: leaveBalanceStore.items?.pageSize || 5,
  data: leaveBalanceStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const leaveBalanceColumns = [
  {
    key: 'employee_id',
    label: 'Employees Full Name',
    sortable: true,
    formatter: (value, row) =>
      row.employee ? row.employee.first_name + ' ' + row.employee.last_name : ''
  },
  {
    key: 'leave_type_id',
    label: 'Leave Type',
    sortable: true,
    formatter: (value, row) => (row.leaveType ? row.leaveType.name : '')
  },
  { key: 'total_days', label: 'Total Days', sortable: true },
  { key: 'used_days', label: 'Used Days', sortable: true },
  { key: 'remaining_days', label: 'Remaining Days', sortable: true },
  { key: 'year', label: 'Year', sortable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchLeaveBalances(query, true)
}

const handleSelected = (selectedLeaveBalancesList) => {
  selectedLeaveBalances.value = selectedLeaveBalancesList
}

const handleEditLeaveBalance = (row) => {
  editLeaveBalanceForm.value = {
    id: row.id,
    employee_id: row.employee_id,
    leave_type_id: row.leave_type_id,
    total_days: row.total_days,
    year: row.year
  }
  showEditLeaveBalanceModal.value = true
}

// --- CREATE NEW LEAVE BALANCE ---
const handleShowNewLeaveBalanceModal = () => {
  newLeaveBalanceForm.value = {
    employee_id: '',
    leave_type_id: '',
    total_days: 0,
    year: new Date().getFullYear()
  }
  showNewLeaveBalanceModal.value = true
}

async function saveNewLeaveBalance() {
  await leaveBalanceStore.createItem({
    ...newLeaveBalanceForm.value,
    used_days: 0,
    remaining_days: newLeaveBalanceForm.value.total_days
  })
  if (!leaveBalanceStore.error) {
    showNewLeaveBalanceModal.value = false
    await fetchLeaveBalances({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE LEAVE BALANCE ---
async function updateLeaveBalance() {
  await leaveBalanceStore.updateItem(editLeaveBalanceForm.value.id, editLeaveBalanceForm.value)
  if (!leaveBalanceStore.error) {
    showEditLeaveBalanceModal.value = false
    await fetchLeaveBalances({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED LEAVE BALANCES ---
async function deleteSelectedLeaveBalances() {
  if (selectedLeaveBalances.value.length === 0) return

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
    for (const leaveBalanceId of selectedLeaveBalances.value) {
      await leaveBalanceStore.deleteItem(leaveBalanceId)
      if (leaveBalanceStore.error) break
    }

    if (!leaveBalanceStore.error) {
      selectedLeaveBalances.value = []
      await fetchLeaveBalances({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The leave balances have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewLeaveBalanceModal = () => {
  showNewLeaveBalanceModal.value = false
}

const closeEditLeaveBalanceModal = () => {
  showEditLeaveBalanceModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="leaveBalanceStore.error" :icon="mdiAlertCircle" color="danger">
        {{ leaveBalanceStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Leave Balances" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Leave Balance"
            @click="handleShowNewLeaveBalanceModal"
          />
          <BaseButton
            v-if="selectedLeaveBalances.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedLeaveBalances"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="leaveBalanceColumns"
          :data="leaveBalanceData"
          :loading="leaveBalanceStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditLeaveBalance"
        />
      </CardBox>
    </SectionMain>

    <!-- New Leave Balance Modal -->
    <div
      v-if="showNewLeaveBalanceModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Leave Balance</h2>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Employee</label>
            <select
              v-model="newLeaveBalanceForm.employee_id"
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
              v-model="newLeaveBalanceForm.leave_type_id"
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

          <div>
            <label class="block mb-1">Total Days</label>
            <input
              v-model="newLeaveBalanceForm.total_days"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Year</label>
            <input
              v-model="newLeaveBalanceForm.year"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewLeaveBalanceModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewLeaveBalance">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Leave Balance Modal -->
    <div
      v-if="showEditLeaveBalanceModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Leave Balance</h2>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Employee</label>
            <select
              v-model="editLeaveBalanceForm.employee_id"
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
              v-model="editLeaveBalanceForm.leave_type_id"
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

          <div>
            <label class="block mb-1">Total Days</label>
            <input
              v-model="editLeaveBalanceForm.total_days"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Year</label>
            <input
              v-model="editLeaveBalanceForm.year"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditLeaveBalanceModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateLeaveBalance">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
