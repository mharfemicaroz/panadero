<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'
import { useSalaryStore } from '../stores/hr/salaryStore'
import { useEmployeeStore } from '../stores/hr/employeeStore'

// --- STORES ---
const salaryStore = useSalaryStore()
const employeeStore = useEmployeeStore()
const selectedSalaries = ref([])

// Fetch employees (for the dropdown) – limit increased to load many employees
employeeStore.fetchItems({ page: 1, limit: 100 }, true)

// --- STATE ---
const showNewSalaryModal = ref(false)
const showEditSalaryModal = ref(false)

const newSalaryForm = ref({
  employee_id: null,
  basic_salary: 0,
  daily_rate: 0,
  hourly_rate: 0,
  overtime_rate: 1.25,
  night_differential_rate: 1.1,
  holiday_rate: 2.0,
  tax_rate: 0.0,
  effective_date: ''
})

const editSalaryForm = ref({
  id: null,
  employee_id: null,
  basic_salary: 0,
  daily_rate: 0,
  hourly_rate: 0,
  overtime_rate: 1.25,
  night_differential_rate: 1.1,
  holiday_rate: 2.0,
  tax_rate: 0.0,
  effective_date: ''
})

// --- FETCH DATA ---
async function fetchSalaries(queryParams = {}, forceRefresh = false) {
  await salaryStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchSalaries({ page: 1, limit: 10 })

const salaryData = computed(() => ({
  total: salaryStore.items?.total || 0,
  totalPages: salaryStore.items?.totalPages || 1,
  currentPage: salaryStore.items?.currentPage || 1,
  pageSize: salaryStore.items?.pageSize || 10,
  data: (salaryStore.items?.data || []).map((item) => ({
    ...item,
    employee: item.employee
      ? `${item.employee.first_name} ${item.employee.last_name}`
      : `Employee ${item.employee_id}`
  }))
}))

// --- TABLE COLUMNS ---
const salaryColumns = [
  { key: 'employee', label: 'Employee', sortable: true, filterable: true },
  { key: 'basic_salary', label: 'Basic Salary', sortable: true, filterable: true },
  { key: 'daily_rate', label: 'Daily Rate', sortable: true, filterable: true },
  { key: 'overtime_rate', label: 'Overtime Rate', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchSalaries(query, true)
}

const handleSelected = (selectedList) => {
  selectedSalaries.value = selectedList
}

const handleEditSalary = async (row) => {
  salaryStore.isLoading = true
  editSalaryForm.value = {
    id: row.id,
    employee_id: row.employee_id,
    basic_salary: row.basic_salary,
    daily_rate: row.daily_rate,
    hourly_rate: row.hourly_rate,
    overtime_rate: row.overtime_rate,
    night_differential_rate: row.night_differential_rate,
    holiday_rate: row.holiday_rate,
    tax_rate: row.tax_rate,
    effective_date: row.effective_date
  }
  showEditSalaryModal.value = true
  salaryStore.isLoading = false
}

const handleShowNewSalaryModal = async () => {
  // Ensure employee list is loaded
  await employeeStore.fetchItems({ page: 1, limit: 100 }, true)
  newSalaryForm.value = {
    employee_id: null,
    basic_salary: 0,
    daily_rate: 0,
    hourly_rate: 0,
    overtime_rate: 1.25,
    night_differential_rate: 1.1,
    holiday_rate: 2.0,
    tax_rate: 0.0,
    effective_date: ''
  }
  showNewSalaryModal.value = true
}

async function saveNewSalary() {
  await salaryStore.createItem(newSalaryForm.value)
  if (!salaryStore.error) {
    showNewSalaryModal.value = false
    await fetchSalaries({ page: 1, limit: 10 }, true)
  }
}

async function updateSalary() {
  await salaryStore.updateItem(editSalaryForm.value.id, editSalaryForm.value)
  if (!salaryStore.error) {
    showEditSalaryModal.value = false
    await fetchSalaries({ page: 1, limit: 10 }, true)
  }
}

async function deleteSelectedSalaries() {
  if (selectedSalaries.value.length === 0) return

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
    for (const salaryId of selectedSalaries.value) {
      await salaryStore.deleteItem(salaryId)
      if (salaryStore.error) break
    }
    if (!salaryStore.error) {
      selectedSalaries.value = []
      await fetchSalaries({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The salary records have been deleted.', 'success')
    }
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="salaryStore.error" :icon="mdiAlertCircle" color="danger">
        {{ salaryStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Salaries" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Salary"
            @click="handleShowNewSalaryModal"
          />
          <BaseButton
            v-if="selectedSalaries.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedSalaries"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="salaryColumns"
          :data="salaryData"
          :loading="salaryStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditSalary"
        />
      </CardBox>
    </SectionMain>

    <!-- New Salary Modal -->
    <div
      v-if="showNewSalaryModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Salary</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- Employee Selection using Employee Store -->
          <div class="col-span-2">
            <label class="block mb-1">Employee</label>
            <select v-model.number="newSalaryForm.employee_id" class="w-full border p-2 rounded">
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
            <label class="block mb-1">Basic Salary</label>
            <input
              v-model.number="newSalaryForm.basic_salary"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Daily Rate</label>
            <input
              v-model.number="newSalaryForm.daily_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Hourly Rate</label>
            <input
              v-model.number="newSalaryForm.hourly_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Overtime Rate</label>
            <input
              v-model.number="newSalaryForm.overtime_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Night Differential Rate</label>
            <input
              v-model.number="newSalaryForm.night_differential_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Holiday Rate</label>
            <input
              v-model.number="newSalaryForm.holiday_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Tax Rate</label>
            <input
              v-model.number="newSalaryForm.tax_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Effective Date</label>
            <input
              v-model="newSalaryForm.effective_date"
              type="date"
              class="w-full border p-2 rounded"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showNewSalaryModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewSalary">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Salary Modal -->
    <div
      v-if="showEditSalaryModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Salary</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- Employee Selection using Employee Store -->
          <div class="col-span-2">
            <label class="block mb-1">Employee</label>
            <select v-model.number="editSalaryForm.employee_id" class="w-full border p-2 rounded">
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
            <label class="block mb-1">Basic Salary</label>
            <input
              v-model.number="editSalaryForm.basic_salary"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Daily Rate</label>
            <input
              v-model.number="editSalaryForm.daily_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Hourly Rate</label>
            <input
              v-model.number="editSalaryForm.hourly_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Overtime Rate</label>
            <input
              v-model.number="editSalaryForm.overtime_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Night Differential Rate</label>
            <input
              v-model.number="editSalaryForm.night_differential_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Holiday Rate</label>
            <input
              v-model.number="editSalaryForm.holiday_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Tax Rate</label>
            <input
              v-model.number="editSalaryForm.tax_rate"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Effective Date</label>
            <input
              v-model="editSalaryForm.effective_date"
              type="date"
              class="w-full border p-2 rounded"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showEditSalaryModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateSalary">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
