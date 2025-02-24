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
import { useDeductionStore } from '../stores/hr/deductionStore'

// --- STATE ---
const showNewDeductionModal = ref(false)
const showEditDeductionModal = ref(false)

const newDeductionForm = ref({
  name: '',
  description: '',
  type: 'tax',
  amount_type: 'fixed',
  amount: 0,
  is_recurring: true,
  is_required: true,
  frequency: 'per_payroll'
})

const editDeductionForm = ref({
  id: null,
  name: '',
  description: '',
  type: 'tax',
  amount_type: 'fixed',
  amount: 0,
  is_recurring: true,
  is_required: true,
  frequency: 'per_payroll'
})

// --- STORES ---
const deductionStore = useDeductionStore()
const selectedDeductions = ref([])

// --- FETCH DATA ---
async function fetchDeductions(queryParams = {}, forceRefresh = false) {
  await deductionStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchDeductions({ page: 1, limit: 10 })

const deductionData = computed(() => ({
  total: deductionStore.items?.total || 0,
  totalPages: deductionStore.items?.totalPages || 1,
  currentPage: deductionStore.items?.currentPage || 1,
  pageSize: deductionStore.items?.pageSize || 10,
  data: deductionStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const deductionColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'type', label: 'Type', sortable: true, filterable: true },
  { key: 'amount_type', label: 'Amount Type', sortable: true, filterable: true },
  { key: 'amount', label: 'Amount', sortable: true, filterable: true },

  { key: 'frequency', label: 'Frequency', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchDeductions(query, true)
}

const handleSelected = (selectedList) => {
  selectedDeductions.value = selectedList
}

const handleEditDeduction = async (row) => {
  deductionStore.isLoading = true
  editDeductionForm.value = {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    amount_type: row.amount_type,
    amount: row.amount,
    is_recurring: row.is_recurring,
    is_required: row.is_required,
    frequency: row.frequency
  }
  showEditDeductionModal.value = true
  deductionStore.isLoading = false
}

const handleShowNewDeductionModal = () => {
  // Reset the new form values
  newDeductionForm.value = {
    name: '',
    description: '',
    type: 'tax',
    amount_type: 'fixed',
    amount: 0,
    is_recurring: true,
    is_required: true,
    frequency: 'per_payroll'
  }
  showNewDeductionModal.value = true
}

async function saveNewDeduction() {
  await deductionStore.createItem(newDeductionForm.value)
  if (!deductionStore.error) {
    showNewDeductionModal.value = false
    await fetchDeductions({ page: 1, limit: 10 }, true)
  }
}

async function updateDeduction() {
  await deductionStore.updateItem(editDeductionForm.value.id, editDeductionForm.value)
  if (!deductionStore.error) {
    showEditDeductionModal.value = false
    await fetchDeductions({ page: 1, limit: 10 }, true)
  }
}

async function deleteSelectedDeductions() {
  if (selectedDeductions.value.length === 0) return

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
    for (const deductionId of selectedDeductions.value) {
      await deductionStore.deleteItem(deductionId)
      if (deductionStore.error) break
    }

    if (!deductionStore.error) {
      selectedDeductions.value = []
      await fetchDeductions({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The deductions have been deleted.', 'success')
    }
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="deductionStore.error" :icon="mdiAlertCircle" color="danger">
        {{ deductionStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Deductions" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Deduction"
            @click="handleShowNewDeductionModal"
          />
          <BaseButton
            v-if="selectedDeductions.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedDeductions"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="deductionColumns"
          :data="deductionData"
          :loading="deductionStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditDeduction"
        />
      </CardBox>
    </SectionMain>

    <!-- New Deduction Modal -->
    <div
      v-if="showNewDeductionModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Deduction</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1">Name</label>
            <input v-model="newDeductionForm.name" type="text" class="w-full border p-2 rounded" />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Description</label>
            <textarea
              v-model="newDeductionForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
          <div>
            <label class="block mb-1">Type</label>
            <select v-model="newDeductionForm.type" class="w-full border p-2 rounded">
              <option value="tax">Tax</option>
              <option value="sss">SSS</option>
              <option value="philhealth">PhilHealth</option>
              <option value="pagibig">Pag-IBIG</option>
              <option value="loan">Loan</option>
              <option value="cash_advance">Cash Advance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Amount Type</label>
            <select v-model="newDeductionForm.amount_type" class="w-full border p-2 rounded">
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Amount</label>
            <input
              v-model.number="newDeductionForm.amount"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Frequency</label>
            <select v-model="newDeductionForm.frequency" class="w-full border p-2 rounded">
              <option value="per_payroll">Per Payroll</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="one_time">One Time</option>
            </select>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center">
              <span class="mr-1">Recurring</span>
              <input v-model="newDeductionForm.is_recurring" type="checkbox" class="mt-0" />
            </label>
            <label class="flex items-center">
              <span class="mr-1">Required</span>
              <input v-model="newDeductionForm.is_required" type="checkbox" class="mt-0" />
            </label>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showNewDeductionModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewDeduction">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Deduction Modal -->
    <div
      v-if="showEditDeductionModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Deduction</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1">Name</label>
            <input v-model="editDeductionForm.name" type="text" class="w-full border p-2 rounded" />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Description</label>
            <textarea
              v-model="editDeductionForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
          <div>
            <label class="block mb-1">Type</label>
            <select v-model="editDeductionForm.type" class="w-full border p-2 rounded">
              <option value="tax">Tax</option>
              <option value="sss">SSS</option>
              <option value="philhealth">PhilHealth</option>
              <option value="pagibig">Pag-IBIG</option>
              <option value="loan">Loan</option>
              <option value="cash_advance">Cash Advance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Amount Type</label>
            <select v-model="editDeductionForm.amount_type" class="w-full border p-2 rounded">
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Amount</label>
            <input
              v-model.number="editDeductionForm.amount"
              type="number"
              step="0.01"
              class="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label class="block mb-1">Frequency</label>
            <select v-model="editDeductionForm.frequency" class="w-full border p-2 rounded">
              <option value="per_payroll">Per Payroll</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="one_time">One Time</option>
            </select>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center">
              <span class="mr-1">Recurring</span>
              <input v-model="editDeductionForm.is_recurring" type="checkbox" class="mt-0" />
            </label>
            <label class="flex items-center">
              <span class="mr-1">Required</span>
              <input v-model="editDeductionForm.is_required" type="checkbox" class="mt-0" />
            </label>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="showEditDeductionModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateDeduction">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
