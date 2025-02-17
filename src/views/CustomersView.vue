<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import { useCustomerStore } from '@/stores/customer'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewCustomerModal = ref(false)
const newCustomerForm = ref({ first_name: '', last_name: '', email: '', phone: '', address: '' })

const showEditCustomerModal = ref(false)
const editCustomerForm = ref({
  id: null,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: ''
})

// Store
const customerStore = useCustomerStore()
const selectedCustomers = ref([])

// --- FETCH DATA ---
async function fetchCustomers(queryParams = {}, forceRefresh = false) {
  await customerStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchCustomers({ page: 1, limit: 10 })

// Compute table data
const customerData = computed(() => ({
  total: customerStore.items?.total || 0,
  totalPages: customerStore.items?.totalPages || 1,
  currentPage: customerStore.items?.currentPage || 1,
  pageSize: customerStore.items?.pageSize || 5,
  data: customerStore.items?.data || []
}))

// Table columns
const customerColumns = [
  { key: 'first_name', label: 'First Name', sortable: true, filterable: true },
  { key: 'last_name', label: 'Last Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'phone', label: 'Phone', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchCustomers(query, true)
}

const handleSelected = (selectedItems) => {
  selectedCustomers.value = selectedItems
}

const handleEditCustomer = (row) => {
  editCustomerForm.value = {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address
  }
  showEditCustomerModal.value = true
}

// --- CREATE NEW CUSTOMER ---
const handleShowNewCustomerModal = () => {
  newCustomerForm.value = { first_name: '', last_name: '', email: '', phone: '', address: '' }
  showNewCustomerModal.value = true
}

async function saveNewCustomer() {
  await customerStore.createItem(newCustomerForm.value)
  if (!customerStore.error) {
    showNewCustomerModal.value = false
    await fetchCustomers({ page: 1, limit: 10 }, true)
  }
}

// --- UPDATE CUSTOMER ---
async function updateCustomer() {
  await customerStore.updateItem(editCustomerForm.value.id, {
    first_name: editCustomerForm.value.first_name,
    last_name: editCustomerForm.value.last_name,
    email: editCustomerForm.value.email,
    phone: editCustomerForm.value.phone,
    address: editCustomerForm.value.address
  })
  if (!customerStore.error) {
    showEditCustomerModal.value = false
    await fetchCustomers({ page: 1, limit: 10 }, true)
  }
}

// --- DELETE SELECTED CUSTOMERS ---
async function deleteSelectedCustomers() {
  if (selectedCustomers.value.length === 0) return

  const confirmDelete = await Swal.fire({
    title: 'Are you sure?',
    text: 'You won’t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete them!'
  })

  if (confirmDelete.isConfirmed) {
    for (const customerId of selectedCustomers.value) {
      await customerStore.deleteItem(customerId)
      if (customerStore.error) break
    }

    if (!customerStore.error) {
      selectedCustomers.value = []
      await fetchCustomers({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The customers have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewCustomerModal = () => {
  showNewCustomerModal.value = false
}

const closeEditCustomerModal = () => {
  showEditCustomerModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- ERROR NOTIFICATION -->
      <NotificationBar v-if="customerStore.error" :icon="mdiAlertCircle" color="danger">
        {{ customerStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Customers" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Customer"
            @click="handleShowNewCustomerModal"
          />
          <BaseButton
            v-if="selectedCustomers.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedCustomers"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="customerColumns"
          :data="customerData"
          :total="customerData.total"
          :loading="customerStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditCustomer"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- New Customer Modal -->
  <div
    v-if="showNewCustomerModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Add Customer</h2>
      <div class="mb-4">
        <label class="block mb-1" for="customerFirstName">First Name</label>
        <input
          id="customerFirstName"
          v-model="newCustomerForm.first_name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1" for="customerLastName">Last Name</label>
        <input
          id="customerLastName"
          v-model="newCustomerForm.last_name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1" for="customerEmail">Email</label>
        <input
          id="customerEmail"
          v-model="newCustomerForm.email"
          type="email"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1" for="customerPhone">Phone</label>
        <input
          id="customerPhone"
          v-model="newCustomerForm.phone"
          type="text"
          class="w-full border p-2 rounded"
        />
        <div class="mb-4">
          <label class="block mb-1" for="customerAddress">Address</label>
          <input
            id="customerAddress"
            v-model="newCustomerForm.address"
            type="text"
            class="w-full border p-2 rounded"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewCustomerModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewCustomer">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Customer Modal -->
  <div
    v-if="showEditCustomerModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Edit Customer</h2>
      <div class="mb-4">
        <label class="block mb-1" for="editCustomerFirstName">First Name</label>
        <input
          id="editCustomerFirstName"
          v-model="editCustomerForm.first_name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1" for="editCustomerLastName">Last Name</label>
        <input
          id="editCustomerLastName"
          v-model="editCustomerForm.last_name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="editCustomerEmail">Email</label>
        <input
          id="editCustomerEmail"
          v-model="editCustomerForm.email"
          type="email"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1" for="editCustomerPhone">Phone</label>
        <input
          id="editCustomerPhone"
          v-model="editCustomerForm.phone"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1" for="editCustomerAddress">Address</label>
        <input
          id="editCustomerAddress"
          v-model="editCustomerForm.address"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>

      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditCustomerModal">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateCustomer">
          Update
        </button>
      </div>
    </div>
  </div>
</template>
