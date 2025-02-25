<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- Error Notification -->
      <NotificationBar v-if="procurementStore.error" :icon="mdiAlertCircle" color="danger">
        {{ procurementStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Procurements" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Procurement"
            @click="handleShowNewProcurementModal"
          />
          <BaseButton
            v-if="selectedProcurements.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedProcurements"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <!-- Cell-actions slot now includes View, Edit and Approve -->
        <BaseTable
          :columns="procurementColumns"
          :data="procurementData"
          :total="procurementData.total"
          :loading="procurementStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
        >
          <template #cell-actions="{ row }">
            <div class="flex gap-2">
              <BaseButton :icon="mdiEye" color="info" @click="viewProcurementDetails(row)" />
              <BaseButton
                v-if="row.status !== 'received'"
                :icon="mdiPencil"
                color="gray"
                @click="handleEditProcurement(row)"
              />
              <BaseButton
                v-if="row.status !== 'received'"
                :icon="mdiCheck"
                color="success"
                @click="approveProcurement(row)"
              />
            </div>
          </template>
        </BaseTable>
      </CardBox>
    </SectionMain>

    <!-- New Procurement Modal -->
    <div
      v-if="showNewProcurementModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px] relative">
        <h2 class="text-xl mb-4">Add Procurement</h2>
        <!-- Supplier -->
        <div class="mb-4">
          <label class="block mb-1">Supplier</label>
          <select v-model="newProcurementForm.supplier_id" class="w-full border p-2 rounded">
            <option value="">Select Supplier</option>
            <option v-for="supplier in supplierOptions" :key="supplier.id" :value="supplier.id">
              {{ supplier.name }}
            </option>
          </select>
        </div>
        <!-- Warehouse -->
        <div class="mb-4">
          <label class="block mb-1">Warehouse</label>
          <select v-model="newProcurementForm.warehouse_id" class="w-full border p-2 rounded">
            <option value="">Select Warehouse</option>
            <option v-for="wh in warehouseOptions" :key="wh.id" :value="wh.id">
              {{ wh.name }}
            </option>
          </select>
        </div>
        <!-- Procurement Date -->
        <div class="mb-4">
          <label class="block mb-1">Procurement Date</label>
          <input
            v-model="newProcurementForm.procurement_date"
            type="date"
            class="w-full border p-2 rounded"
          />
        </div>
        <!-- Status -->
        <div class="mb-4">
          <label class="block mb-1">Status</label>
          <input
            v-model="newProcurementForm.status"
            type="text"
            placeholder="e.g. pending, received..."
            class="w-full border p-2 rounded"
          />
        </div>
        <!-- Items Section -->
        <div class="mb-4 relative">
          <label class="block mb-1">Items</label>
          <!-- Search & Add Item -->
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
                    if (!newProcurementForm.items.find((i) => i.item_id === itm.id)) {
                      newProcurementForm.items.push({
                        item_id: itm.id,
                        name: itm.name,
                        quantity: 1,
                        purchase_cost: itm.cost
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
          <!-- Items Table -->
          <table class="w-full border mt-2">
            <thead class="bg-gray-200">
              <tr>
                <th class="p-2">Item Name</th>
                <th class="p-2">Quantity</th>
                <th class="p-2">Purchase Cost</th>
                <th class="p-2">Amount</th>
                <th class="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(itm, index) in newProcurementForm.items"
                :key="itm.item_id"
                class="border-b"
              >
                <td class="p-2">{{ itm.name }}</td>
                <td class="p-2 w-24">
                  <input
                    type="number"
                    min="1"
                    class="border p-1 w-full"
                    v-model.number="itm.quantity"
                  />
                </td>
                <td class="p-2 w-24">
                  {{ itm.purchase_cost }}
                </td>
                <td class="p-2 w-24">
                  {{ (itm.quantity || 0) * (itm.purchase_cost || 0) }}
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
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewProcurementModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewProcurement">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Procurement Modal -->
    <div
      v-if="showEditProcurementModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px] relative">
        <h2 class="text-xl mb-4">Edit Procurement</h2>
        <!-- Supplier -->
        <div class="mb-4">
          <label class="block mb-1">Supplier</label>
          <select v-model="editProcurementForm.supplier_id" class="w-full border p-2 rounded">
            <option value="">Select Supplier</option>
            <option v-for="supplier in supplierOptions" :key="supplier.id" :value="supplier.id">
              {{ supplier.name }}
            </option>
          </select>
        </div>
        <!-- Warehouse -->
        <div class="mb-4">
          <label class="block mb-1">Warehouse</label>
          <select v-model="editProcurementForm.warehouse_id" class="w-full border p-2 rounded">
            <option value="">Select Warehouse</option>
            <option v-for="wh in warehouseOptions" :key="wh.id" :value="wh.id">
              {{ wh.name }}
            </option>
          </select>
        </div>
        <!-- Procurement Date -->
        <div class="mb-4">
          <label class="block mb-1">Procurement Date</label>
          <input
            v-model="editProcurementForm.procurement_date"
            type="date"
            class="w-full border p-2 rounded"
          />
        </div>
        <!-- Status -->
        <div class="mb-4">
          <label class="block mb-1">Status</label>
          <input
            v-model="editProcurementForm.status"
            type="text"
            placeholder="e.g. pending, received..."
            class="w-full border p-2 rounded"
          />
        </div>
        <!-- Items Section (Edit Mode) -->
        <div class="mb-4 relative">
          <label class="block mb-1">Items</label>
          <!-- Search & Add Item for Edit Modal -->
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
                    if (!editProcurementForm.items.find((i) => i.item_id === itm.id)) {
                      editProcurementForm.items.push({
                        item_id: itm.id,
                        name: itm.name,
                        quantity: 1,
                        purchase_cost: 0
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
          <!-- Items Table for Edit Modal -->
          <table class="w-full border mt-2">
            <thead class="bg-gray-200">
              <tr>
                <th class="p-2">Item Name</th>
                <th class="p-2">Quantity</th>
                <th class="p-2">Purchase Cost</th>
                <th class="p-2">Amount</th>
                <th class="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(itm, index) in editProcurementForm.items"
                :key="itm.item_id"
                class="border-b"
              >
                <td class="p-2">{{ itm.item.name }}</td>
                <td class="p-2 w-24">
                  <input
                    type="number"
                    min="1"
                    class="border p-1 w-full"
                    v-model.number="itm.quantity"
                  />
                </td>
                <td class="p-2 w-24">
                  {{ itm.item.cost }}
                </td>
                <td class="p-2 w-24">
                  {{ (itm.quantity || 0) * (itm.item.cost || 0) }}
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
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditProcurementModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveEditProcurement">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- View Procurement Modal (Compact Minimalistic) -->
    <div
      v-if="showViewProcurementModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-4 rounded shadow-lg w-[400px]">
        <h2 class="text-lg font-bold mb-2">Procurement Details</h2>
        <div class="mb-2 text-sm">
          <strong>Supplier:</strong>
          {{ viewProcurementForm.supplier ? viewProcurementForm.supplier.name : 'N/A' }}
        </div>
        <div class="mb-2 text-sm">
          <strong>Warehouse:</strong>
          {{ viewProcurementForm.warehouse ? viewProcurementForm.warehouse.name : 'N/A' }}
        </div>
        <div class="mb-2 text-sm">
          <strong>Date:</strong> {{ viewProcurementForm.procurement_date }}
        </div>
        <div class="mb-2 text-sm"><strong>Status:</strong> {{ viewProcurementForm.status }}</div>
        <div class="mb-2 text-sm">
          <strong>Items:</strong>
          <table class="w-full mt-1 text-xs border">
            <thead>
              <tr class="bg-gray-200">
                <th class="p-1 border">Item</th>
                <th class="p-1 border">Qty</th>
                <th class="p-1 border">Cost</th>
                <th class="p-1 border">Amt</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(itm, idx) in viewProcurementForm.items" :key="idx" class="border-b">
                <td class="p-1 border">{{ itm.item.name }}</td>
                <td class="p-1 border">{{ itm.quantity }}</td>
                <td class="p-1 border">{{ itm.cost }}</td>
                <td class="p-1 border">{{ (itm.quantity || 0) * (itm.cost || 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-end mt-2">
          <button
            class="px-3 py-1 bg-blue-600 text-white rounded text-xs"
            @click="closeViewProcurementModal"
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
import { useProcurementStore } from '@/stores/product/procurement'
import { useSupplierStore } from '@/stores/product/supplier'
import { useWarehouseStore } from '@/stores/warehouse'
import { useItemStore } from '@/stores/product/item'

// --- STATE ---
const showNewProcurementModal = ref(false)
const showEditProcurementModal = ref(false)
const showViewProcurementModal = ref(false)

const newProcurementForm = ref({
  supplier_id: '',
  items: [],
  warehouse_id: '',
  procurement_date: '',
  status: ''
})
const newItemSearchQuery = ref('')

// Edit form uses its own search query for items
const editProcurementForm = ref({
  id: null,
  supplier_id: '',
  items: [],
  warehouse_id: '',
  procurement_date: '',
  status: ''
})
const editItemSearchQuery = ref('')

// For viewing details
const viewProcurementForm = ref({})

const selectedProcurements = ref([])

// --- STORES ---
const procurementStore = useProcurementStore()
const supplierStore = useSupplierStore()
const warehouseStore = useWarehouseStore()
const itemStore = useItemStore()

// --- FETCH DATA ---
async function fetchProcurements(queryParams = {}, forceRefresh = false) {
  await procurementStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchProcurements({ page: 1, limit: 10 })

onMounted(async () => {
  await supplierStore.fetchItems({ page: 1, limit: 100 }, true)
  await warehouseStore.fetchAll({ page: 1, limit: 100 }, true)
  await itemStore.fetchItems({ page: 1, limit: 100 }, true)
})

// --- COMPUTED ---
const procurementData = computed(() => ({
  total: procurementStore.items?.total || 0,
  totalPages: procurementStore.items?.totalPages || 1,
  currentPage: procurementStore.items?.currentPage || 1,
  pageSize: procurementStore.items?.pageSize || 10,
  data: procurementStore.items?.data || []
}))

const supplierOptions = computed(() => supplierStore.items.data)
const warehouseOptions = computed(() => warehouseStore.warehouses)
const itemOptions = computed(() => itemStore.items.data)

const filteredNewItemOptions = computed(() => {
  if (!newItemSearchQuery.value) return []
  return itemOptions.value.filter((item) =>
    item.name.toLowerCase().includes(newItemSearchQuery.value.toLowerCase())
  )
})

// For edit modal, similar filtering using editItemSearchQuery
const filteredEditItemOptions = computed(() => {
  if (!editItemSearchQuery.value) return []
  return itemOptions.value.filter((item) =>
    item.name.toLowerCase().includes(editItemSearchQuery.value.toLowerCase())
  )
})

// --- TABLE COLUMNS ---
const procurementColumns = [
  {
    key: 'supplier',
    label: 'Supplier',
    formatter: (value, row) => (row.supplier ? row.supplier.name : '')
  },
  {
    key: 'warehouse',
    label: 'Warehouse',
    formatter: (value, row) => (row.warehouse ? row.warehouse.name : '')
  },
  { key: 'procurement_date', label: 'Date', sortable: true, filterable: true },
  { key: 'status', label: 'Status', sortable: true, filterable: true }
]

// --- TABLE HANDLERS ---
const handleQueryChange = async (query) => {
  await fetchProcurements(query, true)
}

const handleSelected = (selectedList) => {
  selectedProcurements.value = selectedList
}

// When a row is edited, populate the edit form and show the modal.
const handleEditProcurement = (row) => {
  editProcurementForm.value = {
    id: row.id,
    supplier_id: row.supplier_id,
    warehouse_id: row.warehouse_id,
    procurement_date: row.procurement_date,
    status: row.status,
    items: row.items ? row.items : []
  }
  showEditProcurementModal.value = true
}

async function saveEditProcurement() {
  await procurementStore.updateItem(editProcurementForm.value.id, editProcurementForm.value)
  if (!procurementStore.error) {
    showEditProcurementModal.value = false
    await fetchProcurements({ page: 1, limit: 10 }, true)
  }
}

function closeEditProcurementModal() {
  showEditProcurementModal.value = false
}

// --- CREATE (NEW) PROCUREMENT MODAL ---
const handleShowNewProcurementModal = () => {
  newProcurementForm.value = {
    supplier_id: '',
    items: [],
    warehouse_id: '',
    procurement_date: '',
    status: ''
  }
  newItemSearchQuery.value = ''
  showNewProcurementModal.value = true
}

async function saveNewProcurement() {
  console.log('Saving procurement with payload:', JSON.stringify(newProcurementForm.value, null, 2))
  newProcurementForm.value.items.forEach((itm, idx) => {
    if (!itm.item_id) {
      console.error(`Item at index ${idx} is missing item_id:`, itm)
    }
  })
  await procurementStore.createItem(newProcurementForm.value)
  if (!procurementStore.error) {
    showNewProcurementModal.value = false
    await fetchProcurements({ page: 1, limit: 10 }, true)
  }
}

function addNewItem() {
  if (!newItemSearchQuery.value) return
  const found = filteredNewItemOptions.value[0]
  if (found) {
    const exists = newProcurementForm.value.items.find((i) => i.item_id === found.id)
    if (!exists) {
      const newItem = {
        item_id: found.id,
        name: found.name,
        quantity: 1,
        purchase_cost: 0
      }
      console.log('Adding item:', newItem)
      newProcurementForm.value.items.push(newItem)
    }
  }
  newItemSearchQuery.value = ''
}

function removeNewItem(index) {
  newProcurementForm.value.items.splice(index, 1)
}

// --- EDIT MODAL ITEM HANDLERS ---
function addEditItem() {
  if (!editItemSearchQuery.value) return
  const found = filteredEditItemOptions.value[0]
  if (found) {
    const exists = editProcurementForm.value.items.find((i) => i.item_id === found.id)
    if (!exists) {
      const newItem = {
        item_id: found.id,
        name: found.name,
        quantity: 1,
        purchase_cost: 0
      }
      editProcurementForm.value.items.push(newItem)
    }
  }
  editItemSearchQuery.value = ''
}

function removeEditItem(index) {
  editProcurementForm.value.items.splice(index, 1)
}

// --- DELETE SELECTED PROCUREMENTS ---
async function deleteSelectedProcurements() {
  if (selectedProcurements.value.length === 0) return
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
    for (const procurement of selectedProcurements.value) {
      await procurementStore.deleteItem(procurement.id)
      if (procurementStore.error) break
    }
    if (!procurementStore.error) {
      selectedProcurements.value = []
      await fetchProcurements({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The procurements have been deleted.', 'success')
    }
  }
}

// --- APPROVE ACTION PER ROW ---
async function approveProcurement(row) {
  await procurementStore.completeItem(row.id)
  if (!procurementStore.error) {
    await fetchProcurements({ page: 1, limit: 10 }, true)
    Swal.fire('Approved!', 'The procurement has been approved.', 'success')
  }
}

// --- VIEW DETAILS ACTION PER ROW ---
function viewProcurementDetails(row) {
  viewProcurementForm.value = row
  showViewProcurementModal.value = true
}

function closeViewProcurementModal() {
  showViewProcurementModal.value = false
}

function closeNewProcurementModal() {
  showNewProcurementModal.value = false
}
</script>
