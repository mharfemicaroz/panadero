<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import { useDepartmentStore } from '../stores/hr/departmentStore'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewDepartmentModal = ref(false)
const showEditDepartmentModal = ref(false)

const newDepartmentForm = ref({
  name: '',
  description: ''
})

const editDepartmentForm = ref({
  id: null,
  name: '',
  description: ''
})

// --- STORES ---
const departmentStore = useDepartmentStore()
const selectedDepartments = ref([])

// --- FETCH DATA ---
async function fetchDepartments(queryParams = {}, forceRefresh = false) {
  await departmentStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchDepartments({ page: 1, limit: 5 })

const departmentData = computed(() => ({
  total: departmentStore.items?.total || 0,
  totalPages: departmentStore.items?.totalPages || 1,
  currentPage: departmentStore.items?.currentPage || 1,
  pageSize: departmentStore.items?.pageSize || 5,
  data: departmentStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const departmentColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'description', label: 'Description', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchDepartments(query, true)
}

const handleSelected = (selectedDepartmentsList) => {
  selectedDepartments.value = selectedDepartmentsList
}

const handleEditDepartment = (row) => {
  editDepartmentForm.value = {
    id: row.id,
    name: row.name,
    description: row.description
  }
  showEditDepartmentModal.value = true
}

// --- CREATE NEW DEPARTMENT ---
const handleShowNewDepartmentModal = () => {
  newDepartmentForm.value = {
    name: '',
    description: ''
  }
  showNewDepartmentModal.value = true
}

async function saveNewDepartment() {
  await departmentStore.createItem(newDepartmentForm.value)
  if (!departmentStore.error) {
    showNewDepartmentModal.value = false
    await fetchDepartments({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE DEPARTMENT ---
async function updateDepartment() {
  await departmentStore.updateItem(editDepartmentForm.value.id, editDepartmentForm.value)
  if (!departmentStore.error) {
    showEditDepartmentModal.value = false
    await fetchDepartments({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED DEPARTMENTS ---
async function deleteSelectedDepartments() {
  if (selectedDepartments.value.length === 0) return

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
    for (const departmentId of selectedDepartments.value) {
      await departmentStore.deleteItem(departmentId)
      if (departmentStore.error) break
    }

    if (!departmentStore.error) {
      selectedDepartments.value = []
      await fetchDepartments({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The departments have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewDepartmentModal = () => {
  showNewDepartmentModal.value = false
}

const closeEditDepartmentModal = () => {
  showEditDepartmentModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="departmentStore.error" :icon="mdiAlertCircle" color="danger">
        {{ departmentStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Departments" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Department"
            @click="handleShowNewDepartmentModal"
          />
          <BaseButton
            v-if="selectedDepartments.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedDepartments"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="departmentColumns"
          :data="departmentData"
          :loading="departmentStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditDepartment"
        />
      </CardBox>
    </SectionMain>

    <!-- New Department Modal -->
    <div
      v-if="showNewDepartmentModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Department</h2>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Name</label>
            <input v-model="newDepartmentForm.name" type="text" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block mb-1">Description</label>
            <textarea
              v-model="newDepartmentForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewDepartmentModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewDepartment">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Department Modal -->
    <div
      v-if="showEditDepartmentModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Department</h2>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Name</label>
            <input
              v-model="editDepartmentForm.name"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label class="block mb-1">Description</label>
            <textarea
              v-model="editDepartmentForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditDepartmentModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateDepartment">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
