<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- Error Notification -->
      <NotificationBar v-if="orderStore.error" :icon="mdiAlertCircle" color="danger">
        {{ orderStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Purchase Orders" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Order"
            @click="handleShowNewOrderModal"
          />
          <BaseButton
            v-if="selectedOrders.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedOrders"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <!-- BaseTable with cell-actions including View, Edit and Complete -->
        <BaseTable
          :columns="orderColumns"
          :data="orderData"
          :total="orderData.total"
          :loading="orderStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
        >
          <template #cell-actions="{ row }">
            <div class="flex gap-2">
              <BaseButton :icon="mdiEye" color="primary" @click="viewOrderDetails(row)" />
              <BaseButton
                v-if="row.status !== 'completed'"
                :icon="mdiPencil"
                color="primary"
                @click="handleEditOrder(row)"
              />
              <BaseButton
                v-if="row.status !== 'completed'"
                :icon="mdiCheck"
                color="primary"
                @click="completeOrder(row)"
              />
            </div>
          </template>
        </BaseTable>
      </CardBox>
    </SectionMain>

    <!-- New Order Modal -->
    <div
      v-if="showNewOrderModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px] relative">
        <h2 class="text-xl mb-4">New Purchase Order</h2>
        <!-- Customer Selection -->
        <div class="mb-4">
          <label class="block mb-1">Customer</label>
          <select v-model="newOrderForm.customer_id" class="w-full border p-2 rounded">
            <option value="">Select Customer</option>
            <option v-for="customer in customerOptions" :key="customer.id" :value="customer.id">
              {{ customer.first_name }} {{ customer.last_name }}
            </option>
          </select>
        </div>
        <!-- Note: Order Date and Status are auto-set, and User ID is added automatically -->
        <!-- Order Items Section -->
        <div class="mb-4 relative">
          <label class="block mb-1">Order Items</label>
          <!-- Search & Add Order Item -->
          <div class="flex gap-2 mb-2">
            <input
              v-model="newItemSearchQuery"
              type="text"
              placeholder="Search item by name"
              class="w-full border p-2 rounded"
            />
            <BaseButton label="Add" color="primary" @click="addNewItem" />
          </div>
          <!-- Suggestions Dropdown -->
          <div
            v-if="newItemSearchQuery && filteredNewItemOptions.length"
            class="absolute z-50 border p-2 mt-1 rounded bg-white max-h-48 overflow-y-auto w-full"
          >
            <ul>
              <li
                v-for="itm in filteredNewItemOptions"
                :key="itm.id"
                class="cursor-pointer hover:bg-gray-100 p-1"
                @click="
                  () => {
                    if (!newOrderForm.items.find((i) => i.item_id === itm.id)) {
                      newOrderForm.items.push({
                        item_id: itm.id,
                        name: itm.name,
                        quantity: 1,
                        price: itm.price,
                        discount: 0
                      })
                    }
                    newItemSearchQuery = ''
                  }
                "
              >
                {{ itm.name }}
              </li>
            </ul>
          </div>
          <!-- Order Items Table -->
          <table class="w-full border mt-2">
            <thead class="bg-gray-200">
              <tr>
                <th class="p-2">Item Name</th>
                <th class="p-2">Quantity</th>
                <th class="p-2">Price</th>
                <th class="p-2">Discount</th>
                <th class="p-2">Amount</th>
                <th class="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(itm, index) in newOrderForm.items" :key="itm.item_id" class="border-b">
                <td class="p-2">{{ itm.name }}</td>
                <td class="p-2 w-16">
                  <input
                    type="number"
                    min="1"
                    class="border p-1 w-full"
                    v-model.number="itm.quantity"
                  />
                </td>
                <td class="p-2 w-20">{{ itm.price }}</td>
                <td class="p-2 w-20">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="border p-1 w-full"
                    v-model.number="itm.discount"
                  />
                </td>
                <td class="p-2 w-24">
                  {{ (itm.quantity || 0) * ((itm.price || 0) - (itm.discount || 0)) }}
                </td>
                <td class="p-2 w-16 text-center">
                  <button class="text-red-500" @click="removeNewItem(index)">×</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Modal Actions -->
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewOrderModal">Cancel</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewOrder">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Order Modal -->
    <div
      v-if="showEditOrderModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px] relative">
        <h2 class="text-xl mb-4">Edit Purchase Order</h2>
        <!-- Customer Selection -->
        <div class="mb-4">
          <label class="block mb-1">Customer</label>
          <select v-model="editOrderForm.customer_id" class="w-full border p-2 rounded">
            <option value="">Select Customer</option>
            <option v-for="customer in customerOptions" :key="customer.id" :value="customer.id">
              {{ customer.first_name }} {{ customer.last_name }}
            </option>
          </select>
        </div>
        <!-- Order Date (Editable) -->
        <div class="mb-4">
          <label class="block mb-1">Order Date</label>
          <input
            v-model="editOrderForm.order_date"
            type="datetime-local"
            class="w-full border p-2 rounded"
          />
        </div>
        <!-- Order Items Section (Edit Mode) -->
        <div class="mb-4 relative">
          <label class="block mb-1">Order Items</label>
          <!-- Search & Add Order Item for Edit Modal -->
          <div class="flex gap-2 mb-2">
            <input
              v-model="editItemSearchQuery"
              type="text"
              placeholder="Search item by name"
              class="w-full border p-2 rounded"
            />
            <BaseButton label="Add" color="primary" @click="addEditItem" />
          </div>
          <!-- Suggestions Dropdown for Edit Modal -->
          <div
            v-if="editItemSearchQuery && filteredEditItemOptions.length"
            class="absolute z-50 border p-2 mt-1 rounded bg-white max-h-48 overflow-y-auto w-full"
          >
            <ul>
              <li
                v-for="itm in filteredEditItemOptions"
                :key="itm.id"
                class="cursor-pointer hover:bg-gray-100 p-1"
                @click="
                  () => {
                    if (!editOrderForm.items.find((i) => i.item_id === itm.id)) {
                      editOrderForm.items.push({
                        item_id: itm.id,
                        name: itm.name,
                        quantity: 1,
                        price: itm.price,
                        discount: 0
                      })
                    }
                    editItemSearchQuery = ''
                  }
                "
              >
                {{ itm.name }}
              </li>
            </ul>
          </div>
          <!-- Order Items Table for Edit Modal -->
          <table class="w-full border mt-2">
            <thead class="bg-gray-200">
              <tr>
                <th class="p-2">Item Name</th>
                <th class="p-2">Quantity</th>
                <th class="p-2">Price</th>
                <th class="p-2">Discount</th>
                <th class="p-2">Amount</th>
                <th class="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(itm, index) in editOrderForm.items" :key="itm.item_id" class="border-b">
                <td class="p-2">{{ itm.item.name }}</td>
                <td class="p-2 w-16">
                  <input
                    type="number"
                    min="1"
                    class="border p-1 w-full"
                    v-model.number="itm.quantity"
                  />
                </td>
                <td class="p-2 w-20">{{ itm.price }}</td>
                <td class="p-2 w-20">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="border p-1 w-full"
                    v-model.number="itm.discount"
                  />
                </td>
                <td class="p-2 w-24">
                  {{ (itm.quantity || 0) * ((itm.price || 0) - (itm.discount || 0)) }}
                </td>
                <td class="p-2 w-16 text-center">
                  <button class="text-red-500" @click="removeEditItem(index)">×</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Modal Actions for Edit -->
        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditOrderModal">Cancel</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveEditOrder">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- View Order Modal (Compact Minimalistic) -->
    <div
      v-if="showViewOrderModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-4 rounded shadow-lg w-[400px]">
        <h2 class="text-lg font-bold mb-2">Order Details</h2>
        <div class="mb-2 text-sm">
          <strong>Customer:</strong>
          {{
            viewOrderForm.customer
              ? viewOrderForm.customer.first_name + ' ' + viewOrderForm.customer.last_name
              : 'N/A'
          }}
        </div>
        <div class="mb-2 text-sm"><strong>Date:</strong> {{ viewOrderForm.order_date }}</div>
        <div class="mb-2 text-sm"><strong>Status:</strong> {{ viewOrderForm.status }}</div>
        <div class="mb-2 text-sm">
          <strong>Total Amount:</strong> {{ viewOrderForm.total_amount }}
        </div>
        <div class="mb-2 text-sm">
          <strong>Items:</strong>
          <table class="w-full mt-1 text-xs border">
            <thead>
              <tr class="bg-gray-200">
                <th class="p-1 border">Item</th>
                <th class="p-1 border">Qty</th>
                <th class="p-1 border">Price</th>
                <th class="p-1 border">Discount</th>
                <th class="p-1 border">Amt</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(itm, idx) in viewOrderForm.orderItems" :key="idx" class="border-b">
                <td class="p-1 border">{{ itm.item.name }}</td>
                <td class="p-1 border">{{ itm.quantity }}</td>
                <td class="p-1 border">{{ itm.price }}</td>
                <td class="p-1 border">{{ itm.discount }}</td>
                <td class="p-1 border">
                  {{ (itm.quantity || 0) * ((itm.price || 0) - (itm.discount || 0)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-end mt-2">
          <button
            class="px-3 py-1 bg-blue-600 text-white rounded text-xs"
            @click="closeViewOrderModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Swal from 'sweetalert2'
import {
  mdiPlus,
  mdiTableBorder,
  mdiDelete,
  mdiAlertCircle,
  mdiCheck,
  mdiPencil,
  mdiEye
} from '@mdi/js'

// --- STORES ---
import { useOrderStore } from '@/stores/product/order'
import { useCustomerStore } from '@/stores/customer'
import { useItemStore } from '@/stores/product/item'
import { useAuthStore } from '@/stores/auth'

// --- STATE ---
const showNewOrderModal = ref(false)
const showEditOrderModal = ref(false)
const showViewOrderModal = ref(false)

const newOrderForm = ref({
  // When creating a new order, automatically assign the logged in user’s id.
  user_id: null,
  customer_id: '',
  items: [],
  order_date: new Date().toISOString().slice(0, 10),
  status: 'pending',
  total_amount: 0
})
const newItemSearchQuery = ref('')

// Edit form (status not editable)
const editOrderForm = ref({
  id: null,
  customer_id: '',
  items: [],
  order_date: ''
})
const editItemSearchQuery = ref('')

// For viewing details
const viewOrderForm = ref({})

const selectedOrders = ref([])

// --- STORES ---
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const itemStore = useItemStore()
const authStore = useAuthStore()

// --- FETCH DATA ---
async function fetchOrders(queryParams = {}, forceRefresh = false) {
  await orderStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchOrders({ page: 1, limit: 10 })

onMounted(async () => {
  await customerStore.fetchItems({ page: 1, limit: 100 }, true)
  await itemStore.fetchItems({ page: 1, limit: 100 }, true)
})

// --- COMPUTED ---
const orderData = computed(() => ({
  total: orderStore.items?.total || 0,
  totalPages: orderStore.items?.totalPages || 1,
  currentPage: orderStore.items?.currentPage || 1,
  pageSize: orderStore.items?.pageSize || 10,
  data: orderStore.items?.data || []
}))

const customerOptions = computed(() => customerStore.items.data)
const itemOptions = computed(() => itemStore.items.data)

const filteredNewItemOptions = computed(() => {
  if (!newItemSearchQuery.value) return []
  return itemOptions.value.filter((item) =>
    item.name.toLowerCase().includes(newItemSearchQuery.value.toLowerCase())
  )
})

const filteredEditItemOptions = computed(() => {
  if (!editItemSearchQuery.value) return []
  return itemOptions.value.filter((item) =>
    item.name.toLowerCase().includes(editItemSearchQuery.value.toLowerCase())
  )
})

// --- TABLE COLUMNS ---
const orderColumns = [
  {
    key: 'customer',
    label: 'Customer',
    formatter: (value, row) =>
      row.customer ? row.customer.first_name + ' ' + row.customer.last_name : ''
  },
  {
    key: 'order_date',
    label: 'Date',
    sortable: true,
    filterable: true,
    formatter: (value, row) => {
      return row.order_date ? new Date(row.order_date).toLocaleString() : ''
    }
  },
  { key: 'status', label: 'Status', sortable: true, filterable: true },
  { key: 'total_amount', label: 'Total', sortable: true, filterable: true }
]

// --- TABLE HANDLERS ---
const handleQueryChange = async (query) => {
  await fetchOrders(query, true)
}

const handleSelected = (selectedList) => {
  selectedOrders.value = selectedList
}

// When a row is edited, populate the edit form and show the modal.
const handleEditOrder = (row) => {
  editOrderForm.value = {
    id: row.id,
    customer_id: row.customer_id,
    // Convert the ISO date to "YYYY-MM-DDTHH:MM" format for a datetime-local input
    order_date: row.order_date ? new Date(row.order_date).toISOString().slice(0, 16) : '',
    items: row.orderItems ? JSON.parse(JSON.stringify(row.orderItems)) : []
  }
  showEditOrderModal.value = true
}

async function saveEditOrder() {
  await orderStore.updateItem(editOrderForm.value.id, editOrderForm.value)
  if (!orderStore.error) {
    showEditOrderModal.value = false
    await fetchOrders({ page: 1, limit: 10 }, true)
  }
}

function closeEditOrderModal() {
  showEditOrderModal.value = false
}

// --- CREATE (NEW) ORDER MODAL ---
const handleShowNewOrderModal = () => {
  // Automatically assign the logged-in user's id
  newOrderForm.value = {
    user_id: authStore.user ? authStore.user.id : null,
    customer_id: '',
    items: [],
    order_date: new Date().toISOString().slice(0, 10),
    status: 'pending',
    total_amount: 0
  }
  newItemSearchQuery.value = ''
  showNewOrderModal.value = true
}

async function saveNewOrder() {
  // Compute total_amount from order items before sending
  newOrderForm.value.total_amount = newOrderForm.value.items.reduce(
    (sum, itm) => sum + itm.quantity * ((itm.price || 0) - (itm.discount || 0)),
    0
  )
  console.log('Saving order with payload:', JSON.stringify(newOrderForm.value, null, 2))
  newOrderForm.value.items.forEach((itm, idx) => {
    if (!itm.item_id) {
      console.error(`Item at index ${idx} is missing item_id:`, itm)
    }
  })
  await orderStore.createItem(newOrderForm.value)
  if (!orderStore.error) {
    showNewOrderModal.value = false
    await fetchOrders({ page: 1, limit: 10 }, true)
  }
}

function addNewItem() {
  if (!newItemSearchQuery.value) return
  const found = filteredNewItemOptions.value[0]
  if (found) {
    const exists = newOrderForm.value.items.find((i) => i.item_id === found.id)
    if (!exists) {
      const newItem = {
        item_id: found.id,
        name: found.name,
        quantity: 1,
        price: found.price,
        discount: 0
      }
      console.log('Adding item:', newItem)
      newOrderForm.value.items.push(newItem)
    }
  }
  newItemSearchQuery.value = ''
}

function removeNewItem(index) {
  newOrderForm.value.items.splice(index, 1)
}

// --- EDIT MODAL ITEM HANDLERS ---
function addEditItem() {
  if (!editItemSearchQuery.value) return
  const found = filteredEditItemOptions.value[0]
  if (found) {
    const exists = editOrderForm.value.items.find((i) => i.item_id === found.id)
    if (!exists) {
      const newItem = {
        item_id: found.id,
        name: found.name,
        quantity: 1,
        price: found.price,
        discount: 0
      }
      editOrderForm.value.items.push(newItem)
    }
  }
  editItemSearchQuery.value = ''
}

function removeEditItem(index) {
  editOrderForm.value.items.splice(index, 1)
}

// --- DELETE SELECTED ORDERS ---
async function deleteSelectedOrders() {
  if (selectedOrders.value.length === 0) return
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
    for (const order of selectedOrders.value) {
      await orderStore.deleteItem(order)
      if (orderStore.error) break
    }
    if (!orderStore.error) {
      selectedOrders.value = []
      await fetchOrders({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The orders have been deleted.', 'success')
    }
  }
}

// --- COMPLETE (APPROVE) ACTION PER ROW ---
async function completeOrder(row) {
  await orderStore.completeItem(row.id)
  if (!orderStore.error) {
    await fetchOrders({ page: 1, limit: 10 }, true)
    Swal.fire('Completed!', 'The order has been completed.', 'success')
  }
}

// --- VIEW DETAILS ACTION PER ROW ---
function viewOrderDetails(row) {
  viewOrderForm.value = row
  showViewOrderModal.value = true
}

function closeViewOrderModal() {
  showViewOrderModal.value = false
}

function closeNewOrderModal() {
  showNewOrderModal.value = false
}
</script>
