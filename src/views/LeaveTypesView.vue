<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import { useLeaveTypeStore } from '../stores/hr/leaveTypeStore'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewLeaveTypeModal = ref(false)
const showEditLeaveTypeModal = ref(false)

const newLeaveTypeForm = ref({
  name: '',
  description: '',
  max_days: 0,
  carry_forward_limit: 0,
  is_paid: true
})

const editLeaveTypeForm = ref({
  id: null,
  name: '',
  description: '',
  max_days: 0,
  carry_forward_limit: 0,
  is_paid: true
})

// --- STORES ---
const leaveTypeStore = useLeaveTypeStore()
const selectedLeaveTypes = ref([])

// --- FETCH DATA ---
async function fetchLeaveTypes(queryParams = {}, forceRefresh = false) {
  await leaveTypeStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchLeaveTypes({ page: 1, limit: 5 })

const leaveTypeData = computed(() => ({
  total: leaveTypeStore.items?.total || 0,
  totalPages: leaveTypeStore.items?.totalPages || 1,
  currentPage: leaveTypeStore.items?.currentPage || 1,
  pageSize: leaveTypeStore.items?.pageSize || 5,
  data: leaveTypeStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const leaveTypeColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description', sortable: true },
  { key: 'max_days', label: 'Max Days', sortable: true },
  { key: 'carry_forward_limit', label: 'Carry Forward Limit', sortable: true },
  { key: 'is_paid', label: 'Paid Leave', sortable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchLeaveTypes(query, true)
}

const handleSelected = (selectedLeaveTypesList) => {
  selectedLeaveTypes.value = selectedLeaveTypesList
}

const handleEditLeaveType = (row) => {
  editLeaveTypeForm.value = {
    id: row.id,
    name: row.name,
    description: row.description,
    max_days: row.max_days,
    carry_forward_limit: row.carry_forward_limit,
    is_paid: row.is_paid
  }
  showEditLeaveTypeModal.value = true
}

// --- CREATE NEW LEAVE TYPE ---
const handleShowNewLeaveTypeModal = () => {
  newLeaveTypeForm.value = {
    name: '',
    description: '',
    max_days: 0,
    carry_forward_limit: 0,
    is_paid: true
  }
  showNewLeaveTypeModal.value = true
}

async function saveNewLeaveType() {
  await leaveTypeStore.createItem(newLeaveTypeForm.value)
  if (!leaveTypeStore.error) {
    showNewLeaveTypeModal.value = false
    await fetchLeaveTypes({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE LEAVE TYPE ---
async function updateLeaveType() {
  await leaveTypeStore.updateItem(editLeaveTypeForm.value.id, editLeaveTypeForm.value)
  if (!leaveTypeStore.error) {
    showEditLeaveTypeModal.value = false
    await fetchLeaveTypes({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED LEAVE TYPES ---
async function deleteSelectedLeaveTypes() {
  if (selectedLeaveTypes.value.length === 0) return

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
    for (const leaveTypeId of selectedLeaveTypes.value) {
      await leaveTypeStore.deleteItem(leaveTypeId)
      if (leaveTypeStore.error) break
    }

    if (!leaveTypeStore.error) {
      selectedLeaveTypes.value = []
      await fetchLeaveTypes({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The leave types have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewLeaveTypeModal = () => {
  showNewLeaveTypeModal.value = false
}

const closeEditLeaveTypeModal = () => {
  showEditLeaveTypeModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="leaveTypeStore.error" :icon="mdiAlertCircle" color="danger">
        {{ leaveTypeStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Leave Types" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Leave Type"
            @click="handleShowNewLeaveTypeModal"
          />
          <BaseButton
            v-if="selectedLeaveTypes.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedLeaveTypes"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="leaveTypeColumns"
          :data="leaveTypeData"
          :loading="leaveTypeStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditLeaveType"
        />
      </CardBox>
    </SectionMain>

    <!-- New Leave Type Modal -->
    <div
      v-if="showNewLeaveTypeModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Leave Type</h2>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Name</label>
            <input v-model="newLeaveTypeForm.name" type="text" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block mb-1">Description</label>
            <textarea
              v-model="newLeaveTypeForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>

          <div>
            <label class="block mb-1">Max Days</label>
            <input
              v-model="newLeaveTypeForm.max_days"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Carry Forward Limit</label>
            <input
              v-model="newLeaveTypeForm.carry_forward_limit"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Paid Leave</label>
            <select v-model="newLeaveTypeForm.is_paid" class="w-full border p-2 rounded">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewLeaveTypeModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewLeaveType">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Leave Type Modal -->
    <div
      v-if="showEditLeaveTypeModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Leave Type</h2>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Name</label>
            <input v-model="editLeaveTypeForm.name" type="text" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block mb-1">Description</label>
            <textarea
              v-model="editLeaveTypeForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>

          <div>
            <label class="block mb-1">Max Days</label>
            <input
              v-model="editLeaveTypeForm.max_days"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Carry Forward Limit</label>
            <input
              v-model="editLeaveTypeForm.carry_forward_limit"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Paid Leave</label>
            <select v-model="editLeaveTypeForm.is_paid" class="w-full border p-2 rounded">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditLeaveTypeModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateLeaveType">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
