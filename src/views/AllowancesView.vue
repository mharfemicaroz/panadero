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
import { useAllowanceStore } from '../stores/hr/allowanceStore'

// --- STATE ---
const showNewAllowanceModal = ref(false)
const showEditAllowanceModal = ref(false)

const newAllowanceForm = ref({
  name: '',
  description: '',
  type: 'transportation',
  amount_type: 'fixed',
  amount: 0,
  is_taxable: true,
  is_recurring: true,
  frequency: 'per_payroll',
  eligibility_criteria: ''
})

const editAllowanceForm = ref({
  id: null,
  name: '',
  description: '',
  type: 'transportation',
  amount_type: 'fixed',
  amount: 0,
  is_taxable: true,
  is_recurring: true,
  frequency: 'per_payroll',
  eligibility_criteria: ''
})

// --- STORES ---
const allowanceStore = useAllowanceStore()
const selectedAllowances = ref([])

// --- FETCH DATA ---
async function fetchAllowances(queryParams = {}, forceRefresh = false) {
  await allowanceStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchAllowances({ page: 1, limit: 10 })

const allowanceData = computed(() => ({
  total: allowanceStore.items?.total || 0,
  totalPages: allowanceStore.items?.totalPages || 1,
  currentPage: allowanceStore.items?.currentPage || 1,
  pageSize: allowanceStore.items?.pageSize || 10,
  data: allowanceStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const allowanceColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'type', label: 'Type', sortable: true, filterable: true },
  { key: 'amount_type', label: 'Amount Type', sortable: true, filterable: true },
  { key: 'amount', label: 'Amount', sortable: true, filterable: true },
  { key: 'frequency', label: 'Frequency', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchAllowances(query, true)
}

const handleSelected = (selectedList) => {
  selectedAllowances.value = selectedList
}

const handleEditAllowance = async (row) => {
  allowanceStore.isLoading = true
  editAllowanceForm.value = {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    amount_type: row.amount_type,
    amount: row.amount,
    is_taxable: row.is_taxable,
    is_recurring: row.is_recurring,
    frequency: row.frequency,
    eligibility_criteria: row.eligibility_criteria
  }
  showEditAllowanceModal.value = true
  allowanceStore.isLoading = false
}

const handleShowNewAllowanceModal = () => {
  newAllowanceForm.value = {
    name: '',
    description: '',
    type: 'transportation',
    amount_type: 'fixed',
    amount: 0,
    is_taxable: true,
    is_recurring: true,
    frequency: 'per_payroll',
    eligibility_criteria: ''
  }
  showNewAllowanceModal.value = true
}

async function saveNewAllowance() {
  await allowanceStore.createItem(newAllowanceForm.value)
  if (!allowanceStore.error) {
    showNewAllowanceModal.value = false
    await fetchAllowances({ page: 1, limit: 10 }, true)
  }
}

async function updateAllowance() {
  await allowanceStore.updateItem(editAllowanceForm.value.id, editAllowanceForm.value)
  if (!allowanceStore.error) {
    showEditAllowanceModal.value = false
    await fetchAllowances({ page: 1, limit: 10 }, true)
  }
}

async function deleteSelectedAllowances() {
  if (selectedAllowances.value.length === 0) return

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
    for (const allowanceId of selectedAllowances.value) {
      await allowanceStore.deleteItem(allowanceId)
      if (allowanceStore.error) break
    }
    if (!allowanceStore.error) {
      selectedAllowances.value = []
      await fetchAllowances({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The allowances have been deleted.', 'success')
    }
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="allowanceStore.error" :icon="mdiAlertCircle" color="danger">
        {{ allowanceStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Allowances" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Allowance"
            @click="handleShowNewAllowanceModal"
          />
          <BaseButton
            v-if="selectedAllowances.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedAllowances"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="allowanceColumns"
          :data="allowanceData"
          :loading="allowanceStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditAllowance"
        />
      </CardBox>
    </SectionMain>

    <!-- New Allowance Modal -->
    <div
      v-if="showNewAllowanceModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Allowance</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1">Name</label>
            <input v-model="newAllowanceForm.name" type="text" class="w-full border p-2 rounded" />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Description</label>
            <textarea
              v-model="newAllowanceForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
          <div>
            <label class="block mb-1">Type</label>
            <select v-model="newAllowanceForm.type" class="w-full border p-2 rounded">
              <option value="transportation">Transportation</option>
              <option value="meal">Meal</option>
              <option value="housing">Housing</option>
              <option value="communication">Communication</option>
              <option value="medical">Medical</option>
              <option value="representation">Representation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Amount Type</label>
            <select v-model="newAllowanceForm.amount_type" class="w-full border p-2 rounded">
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Amount</label>
            <input
              v-model.number="newAllowanceForm.amount"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Frequency</label>
            <select v-model="newAllowanceForm.frequency" class="w-full border p-2 rounded">
              <option value="per_payroll">Per Payroll</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="one_time">One Time</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Eligibility Criteria</label>
            <textarea
              v-model="newAllowanceForm.eligibility_criteria"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center">
              <span class="mr-1">Taxable</span>
              <input v-model="newAllowanceForm.is_taxable" type="checkbox" class="mt-0" />
            </label>
            <label class="flex items-center">
              <span class="mr-1">Recurring</span>
              <input v-model="newAllowanceForm.is_recurring" type="checkbox" class="mt-0" />
            </label>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showNewAllowanceModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewAllowance">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Allowance Modal -->
    <div
      v-if="showEditAllowanceModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Allowance</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1">Name</label>
            <input v-model="editAllowanceForm.name" type="text" class="w-full border p-2 rounded" />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Description</label>
            <textarea
              v-model="editAllowanceForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
          <div>
            <label class="block mb-1">Type</label>
            <select v-model="editAllowanceForm.type" class="w-full border p-2 rounded">
              <option value="transportation">Transportation</option>
              <option value="meal">Meal</option>
              <option value="housing">Housing</option>
              <option value="communication">Communication</option>
              <option value="medical">Medical</option>
              <option value="representation">Representation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Amount Type</label>
            <select v-model="editAllowanceForm.amount_type" class="w-full border p-2 rounded">
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Amount</label>
            <input
              v-model.number="editAllowanceForm.amount"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Frequency</label>
            <select v-model="editAllowanceForm.frequency" class="w-full border p-2 rounded">
              <option value="per_payroll">Per Payroll</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="one_time">One Time</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Eligibility Criteria</label>
            <textarea
              v-model="editAllowanceForm.eligibility_criteria"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center">
              <span class="mr-1">Taxable</span>
              <input v-model="editAllowanceForm.is_taxable" type="checkbox" class="mt-0" />
            </label>
            <label class="flex items-center">
              <span class="mr-1">Recurring</span>
              <input v-model="editAllowanceForm.is_recurring" type="checkbox" class="mt-0" />
            </label>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showEditAllowanceModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateAllowance">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
