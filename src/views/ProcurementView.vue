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
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STORES ---
import { useProcurementStore } from '@/stores/product/procurement'
import { useSupplierStore } from '@/stores/product/supplier'
import { useWarehouseStore } from '@/stores/warehouse'
import { useItemStore } from '@/stores/product/item'

// --- STATE ---
const showNewProcurementModal = ref(false)
const showEditProcurementModal = ref(false)

// New Procurement Form
const newProcurementForm = ref({
  supplier_id: '',
  items: [], // Will store an array of objects: { id, name, quantity, purchase_cost }
  warehouse_id: '',
  procurement_date: '',
  status: ''
})

// For item searching in the new modal
const newItemSearchQuery = ref('')

// Edit Procurement Form
const editProcurementForm = ref({
  id: null,
  supplier_id: '',
  items: [],
  warehouse_id: '',
  procurement_date: '',
  status: ''
})

// For item searching in the edit modal
const editItemSearchQuery = ref('')

// Selections for bulk delete
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

// Fetch suppliers, warehouses, and items on mount (for drop-downs / searching)
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

// Filter item options by search query (new modal)
const filteredNewItemOptions = computed(() => {
  if (!newItemSearchQuery.value) return []
  return itemOptions.value.filter((item) =>
    item.name.toLowerCase().includes(newItemSearchQuery.value.toLowerCase())
  )
})

// Filter item options by search query (edit modal) - omitted for brevity if you only need it in the new modal
// const filteredEditItemOptions = computed(() => { ... })

// --- TABLE COLUMNS FOR PROCUREMENTS ---
const procurementColumns = [
  {
    key: 'supplier',
    label: 'Supplier',
    formatter: (value, row) => (row.supplier ? row.supplier.name : '')
  },
  {
    key: 'items',
    label: 'Items',
    // Show each item's name, quantity, and cost
    formatter: (value, row) =>
      row.items
        ? row.items
            .map((i) => `${i.name} (Qty: ${i.quantity}, Cost: ${i.purchase_cost})`)
            .join(', ')
        : ''
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

const handleEditProcurement = (row) => {
  // Example if you also do the "Edit" version
  // ...
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
  // Perform your create operation
  await procurementStore.createItem(newProcurementForm.value)
  if (!procurementStore.error) {
    showNewProcurementModal.value = false
    await fetchProcurements({ page: 1, limit: 10 }, true)
  }
}

// --- ADD / REMOVE ITEM ROWS ---
function addNewItem() {
  if (!newItemSearchQuery.value) return

  // Attempt to find the first matching item in the search results
  const found = filteredNewItemOptions.value[0]
  if (found) {
    // Check if it's already in the list
    const exists = newProcurementForm.value.items.find((i) => i.id === found.id)
    if (!exists) {
      newProcurementForm.value.items.push({
        id: found.id,
        name: found.name,
        quantity: 1,
        purchase_cost: 0
      })
    }
  }
  // Clear search to close dropdown
  newItemSearchQuery.value = ''
}

function removeNewItem(index) {
  newProcurementForm.value.items.splice(index, 1)
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

// --- CLOSE MODALS ---
const closeNewProcurementModal = () => {
  showNewProcurementModal.value = false
}
</script>

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
        <BaseTable
          :columns="procurementColumns"
          :data="procurementData"
          :total="procurementData.total"
          :loading="procurementStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditProcurement"
        />
      </CardBox>
    </SectionMain>

    <!-- New Procurement Modal -->
    <div
      v-if="showNewProcurementModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
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
            placeholder="e.g. pending, completed..."
            class="w-full border p-2 rounded"
          />
        </div>

        <!-- Items Section -->
        <div class="mb-4">
          <label class="block mb-1">Items</label>
          <!-- Search & Add Item -->
          <div class="flex gap-2 mb-2">
            <input
              v-model="newItemSearchQuery"
              type="text"
              placeholder="Search item by name"
              class="w-full border p-2 rounded"
            />
          </div>

          <!-- Suggestions Dropdown -->
          <div
            v-if="newItemSearchQuery && filteredNewItemOptions.length"
            class="absolute z-50 border p-2 mt-1 rounded bg-white max-h-48 overflow-y-auto"
          >
            <ul>
              <li
                v-for="itm in filteredNewItemOptions"
                :key="itm.id"
                class="cursor-pointer hover:bg-gray-100 p-1"
                @click="
                  () => {
                    // Add item with default quantity & cost
                    if (!newProcurementForm.items.find((i) => i.id === itm.id)) {
                      newProcurementForm.items.push({
                        id: itm.id,
                        name: itm.name,
                        quantity: 1,
                        purchase_cost: 0
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
              <tr v-for="(itm, index) in newProcurementForm.items" :key="itm.id" class="border-b">
                <td class="p-0">{{ itm.name }}</td>
                <td class="p-2 w-24">
                  <input
                    type="number"
                    min="1"
                    class="border p-1 w-full"
                    v-model.number="itm.quantity"
                  />
                </td>
                <td class="p-2 w-24">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="border p-1 w-full"
                    v-model.number="itm.purchase_cost"
                  />
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
  </LayoutAuthenticated>
</template>
