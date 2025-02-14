<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import { useSupplierStore } from '@/stores/product/supplier'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewSupplierModal = ref(false)
const showEditSupplierModal = ref(false)

const newSupplierForm = ref({
  name: '',
  email: '',
  phone: ''
})

const editSupplierForm = ref({
  id: null,
  name: '',
  email: '',
  phone: ''
})

// --- STORES ---
const supplierStore = useSupplierStore()
const selectedSuppliers = ref([])

// --- FETCH DATA ---
async function fetchSuppliers(queryParams = {}, forceRefresh = false) {
  await supplierStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchSuppliers({ page: 1, limit: 10 })

const supplierData = computed(() => ({
  total: supplierStore.items?.total || 0,
  totalPages: supplierStore.items?.totalPages || 1,
  currentPage: supplierStore.items?.currentPage || 1,
  pageSize: supplierStore.items?.pageSize || 10,
  data: supplierStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const supplierColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'phone', label: 'Phone', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchSuppliers(query, true)
}

const handleSelected = (selectedList) => {
  selectedSuppliers.value = selectedList
}

const handleEditSupplier = async (row) => {
  editSupplierForm.value = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone
  }
  showEditSupplierModal.value = true
}

// --- CREATE NEW SUPPLIER ---
const handleShowNewSupplierModal = () => {
  newSupplierForm.value = {
    name: '',
    email: '',
    phone: ''
  }
  showNewSupplierModal.value = true
}

async function saveNewSupplier() {
  await supplierStore.createItem(newSupplierForm.value)
  if (!supplierStore.error) {
    showNewSupplierModal.value = false
    await fetchSuppliers({ page: 1, limit: 10 }, true)
  }
}

// --- UPDATE SUPPLIER ---
async function updateSupplier() {
  await supplierStore.updateItem(editSupplierForm.value.id, editSupplierForm.value)
  if (!supplierStore.error) {
    showEditSupplierModal.value = false
    await fetchSuppliers({ page: 1, limit: 10 }, true)
  }
}

// --- DELETE SELECTED SUPPLIERS ---
async function deleteSelectedSuppliers() {
  if (selectedSuppliers.value.length === 0) return

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
    for (const supplier of selectedSuppliers.value) {
      await supplierStore.deleteItem(supplier.id)
      if (supplierStore.error) break
    }
    if (!supplierStore.error) {
      selectedSuppliers.value = []
      await fetchSuppliers({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The suppliers have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewSupplierModal = () => {
  showNewSupplierModal.value = false
}

const closeEditSupplierModal = () => {
  showEditSupplierModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="supplierStore.error" :icon="mdiAlertCircle" color="danger">
        {{ supplierStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Suppliers" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Supplier"
            @click="handleShowNewSupplierModal"
          />
          <BaseButton
            v-if="selectedSuppliers.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedSuppliers"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="supplierColumns"
          :data="supplierData"
          :loading="supplierStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditSupplier"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- New Supplier Modal -->
  <div
    v-if="showNewSupplierModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[500px]">
      <h2 class="text-xl mb-4">Add Supplier</h2>
      <div class="mb-4">
        <label class="block mb-1">Name</label>
        <input v-model="newSupplierForm.name" type="text" class="w-full border p-2 rounded" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Email</label>
        <input v-model="newSupplierForm.email" type="email" class="w-full border p-2 rounded" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Phone</label>
        <input v-model="newSupplierForm.phone" type="text" class="w-full border p-2 rounded" />
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewSupplierModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewSupplier">
          Save
        </button>
      </div>
    </div>
  </div>

  <!-- Edit Supplier Modal -->
  <div
    v-if="showEditSupplierModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[500px]">
      <h2 class="text-xl mb-4">Edit Supplier</h2>
      <div class="mb-4">
        <label class="block mb-1">Name</label>
        <input v-model="editSupplierForm.name" type="text" class="w-full border p-2 rounded" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Email</label>
        <input v-model="editSupplierForm.email" type="email" class="w-full border p-2 rounded" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Phone</label>
        <input v-model="editSupplierForm.phone" type="text" class="w-full border p-2 rounded" />
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditSupplierModal">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateSupplier">
          Update
        </button>
      </div>
    </div>
  </div>
</template>
