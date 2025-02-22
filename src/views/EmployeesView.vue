<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import { useEmployeeStore } from '../stores/hr/employeeStore'
import { useDepartmentStore } from '../stores/hr/departmentStore'
import { useJobTitleStore } from '../stores/hr/jobTitleStore'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// Retrieve global API_URL from main.js
const { appContext } = getCurrentInstance()
const API_URL = appContext.config.globalProperties.API_URL || ''

// --- STATE ---
const showNewEmployeeModal = ref(false)
const showEditEmployeeModal = ref(false)

const newEmployeeForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department_id: null,
  job_title_id: null,
  status: 'active',
  picture: ''
})

const editEmployeeForm = ref({
  id: null,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department_id: null,
  job_title_id: null,
  status: 'active',
  picture: ''
})

// --- COMPUTED PREVIEW SOURCE FOR EDIT MODAL ---
const editPictureSrc = computed(() => {
  if (!editEmployeeForm.value.picture) return ''
  // If the picture is a Base64 string, use it directly; otherwise, prefix with API_URL.
  return editEmployeeForm.value.picture.startsWith('data:')
    ? editEmployeeForm.value.picture
    : `${API_URL}${editEmployeeForm.value.picture}`
})

// --- STORES ---
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const jobTitleStore = useJobTitleStore()
const selectedEmployees = ref([])

// --- FETCH DATA ---
async function fetchEmployees(queryParams = {}, forceRefresh = false) {
  await employeeStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchEmployees({ page: 1, limit: 5 })

const employeeData = computed(() => ({
  total: employeeStore.items?.total || 0,
  totalPages: employeeStore.items?.totalPages || 1,
  currentPage: employeeStore.items?.currentPage || 1,
  pageSize: employeeStore.items?.pageSize || 5,
  data: employeeStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const employeeColumns = [
  { key: 'first_name', label: 'First Name', sortable: true, filterable: true },
  { key: 'last_name', label: 'Last Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'phone', label: 'Phone', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchEmployees(query, true)
}

const handleSelected = (selectedEmployeesList) => {
  selectedEmployees.value = selectedEmployeesList
}

const handleEditEmployee = async (row) => {
  employeeStore.isLoading = true

  await Promise.all([departmentStore.fetchItems(), jobTitleStore.fetchItems()])

  while (departmentStore.isLoading || jobTitleStore.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  editEmployeeForm.value = {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    department_id: row.department_id,
    job_title_id: row.job_title_id,
    status: row.status,
    picture: row.picture || ''
  }

  showEditEmployeeModal.value = true
  employeeStore.isLoading = false
}

// --- CREATE NEW EMPLOYEE ---
const handleShowNewEmployeeModal = async () => {
  employeeStore.isLoading = true

  await Promise.all([departmentStore.fetchItems(), jobTitleStore.fetchItems()])

  while (departmentStore.isLoading || jobTitleStore.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  newEmployeeForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: null,
    job_title_id: null,
    status: 'active',
    picture: ''
  }

  showNewEmployeeModal.value = true
  employeeStore.isLoading = false
}

async function saveNewEmployee() {
  await employeeStore.createItem(newEmployeeForm.value)
  if (!employeeStore.error) {
    showNewEmployeeModal.value = false
    await fetchEmployees({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE EMPLOYEE ---
async function updateEmployee() {
  await employeeStore.updateItem(editEmployeeForm.value.id, editEmployeeForm.value)
  if (!employeeStore.error) {
    showEditEmployeeModal.value = false
    await fetchEmployees({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED EMPLOYEES ---
async function deleteSelectedEmployees() {
  if (selectedEmployees.value.length === 0) return

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
    for (const employeeId of selectedEmployees.value) {
      await employeeStore.deleteItem(employeeId)
      if (employeeStore.error) break
    }

    if (!employeeStore.error) {
      selectedEmployees.value = []
      await fetchEmployees({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The employees have been deleted.', 'success')
    }
  }
}

// --- FILE UPLOAD HANDLERS ---
// For new employee modal
function handleNewPictureUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    newEmployeeForm.value.picture = e.target.result // Base64 string
  }
  reader.readAsDataURL(file)
}

// For edit employee modal
function handleEditPictureUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    editEmployeeForm.value.picture = e.target.result
  }
  reader.readAsDataURL(file)
}

// --- CLOSE MODALS ---
const closeNewEmployeeModal = () => {
  showNewEmployeeModal.value = false
}

const closeEditEmployeeModal = () => {
  showEditEmployeeModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="employeeStore.error" :icon="mdiAlertCircle" color="danger">
        {{ employeeStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Employees" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Employee"
            @click="handleShowNewEmployeeModal"
          />
          <BaseButton
            v-if="selectedEmployees.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedEmployees"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="employeeColumns"
          :data="employeeData"
          :loading="employeeStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditEmployee"
        />
      </CardBox>
    </SectionMain>

    <!-- New Employee Modal -->
    <div
      v-if="showNewEmployeeModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Employee</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1">First Name</label>
            <input
              v-model="newEmployeeForm.first_name"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Last Name</label>
            <input
              v-model="newEmployeeForm.last_name"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Email</label>
            <input v-model="newEmployeeForm.email" type="email" class="w-full border p-2 rounded" />
          </div>
          <div>
            <label class="block mb-1">Phone</label>
            <input v-model="newEmployeeForm.phone" type="tel" class="w-full border p-2 rounded" />
          </div>
          <div>
            <label class="block mb-1">Department</label>
            <select v-model="newEmployeeForm.department_id" class="w-full border p-2 rounded">
              <option
                v-for="department in departmentStore.items.data"
                :key="department.id"
                :value="department.id"
              >
                {{ department.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Job Title</label>
            <select v-model="newEmployeeForm.job_title_id" class="w-full border p-2 rounded">
              <option
                v-for="jobTitle in jobTitleStore.items.data"
                :key="jobTitle.id"
                :value="jobTitle.id"
              >
                {{ jobTitle.title }}
              </option>
            </select>
          </div>
          <!-- Picture Upload Field -->
          <div class="col-span-2">
            <label class="block mb-1">Picture</label>
            <input
              type="file"
              accept="image/*"
              @change="handleNewPictureUpload"
              class="w-full border p-2 rounded"
            />
            <!-- Preview if available -->
            <img
              v-if="newEmployeeForm.picture"
              :src="newEmployeeForm.picture"
              alt="Picture Preview"
              class="mt-2 h-32 object-contain"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewEmployeeModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewEmployee">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Employee Modal -->
    <div
      v-if="showEditEmployeeModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Employee</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1">First Name</label>
            <input
              v-model="editEmployeeForm.first_name"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Last Name</label>
            <input
              v-model="editEmployeeForm.last_name"
              type="text"
              class="w-full border p-2 rounded"
            />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Email</label>
            <input
              v-model="editEmployeeForm.email"
              type="email"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Phone</label>
            <input v-model="editEmployeeForm.phone" type="tel" class="w-full border p-2 rounded" />
          </div>
          <div>
            <label class="block mb-1">Department</label>
            <select v-model="editEmployeeForm.department_id" class="w-full border p-2 rounded">
              <option
                v-for="department in departmentStore.items.data"
                :key="department.id"
                :value="department.id"
              >
                {{ department.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Job Title</label>
            <select v-model="editEmployeeForm.job_title_id" class="w-full border p-2 rounded">
              <option
                v-for="jobTitle in jobTitleStore.items.data"
                :key="jobTitle.id"
                :value="jobTitle.id"
              >
                {{ jobTitle.title }}
              </option>
            </select>
          </div>
          <!-- Picture Upload Field -->
          <div class="col-span-2">
            <label class="block mb-1">Picture</label>
            <input
              type="file"
              accept="image/*"
              @change="handleEditPictureUpload"
              class="w-full border p-2 rounded"
            />
            <!-- Preview: if a new image is uploaded (Base64) it will show that, otherwise if the employee already has a picture loaded, it will be prefixed with API_URL -->
            <img
              v-if="editEmployeeForm.picture"
              :src="editPictureSrc"
              alt="Picture Preview"
              class="mt-2 w-32 h-32 object-contain"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditEmployeeModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateEmployee">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
