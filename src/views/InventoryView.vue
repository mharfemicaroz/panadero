<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import { useInventoryStore } from '@/stores/product/inventory'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiTableBorder, mdiAlertCircle, mdiImport, mdiExport } from '@mdi/js'

// --- STATE ---
const showEditInventoryModal = ref(false)
const autoCompute = ref(false)
const editInventoryForm = ref({
  id: null,
  warehouse: '',
  item: '',
  current_quantity: 0,
  minimum_quantity: 0,
  maximum_quantity: 0,
  reorder_level: 0,
  quantityChange: 0 // Used for auto-compute
})

// --- STORE ---
const inventoryStore = useInventoryStore()
const selectedInventories = ref([])

// --- FETCH DATA ---
async function fetchInventories(queryParams = {}, forceRefresh = false) {
  await inventoryStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchInventories({ page: 1, limit: 5 })

const inventoryData = computed(() => ({
  total: inventoryStore.items?.total || 0,
  totalPages: inventoryStore.items?.totalPages || 1,
  currentPage: inventoryStore.items?.currentPage || 1,
  pageSize: inventoryStore.items?.pageSize || 5,
  data: inventoryStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const inventoryColumns = [
  {
    key: 'item',
    label: 'Item',
    formatter: (value, row) => (row.item ? row.item.name : '')
  },
  {
    key: 'category',
    label: 'Category',
    formatter: (value, row) => (row.item?.category ? row.item.category.name : '')
  },
  {
    key: 'subcategory',
    label: 'Subcategory',
    formatter: (value, row) => (row.item?.subcategory ? row.item.subcategory.name : '')
  },
  // {
  //   key: 'warehouse',
  //   label: 'Warehouse',
  //   formatter: (value, row) => (row.warehouse ? row.warehouse.name : '')
  // },
  { key: 'current_quantity', label: 'Current Quantity', sortable: true }
  // { key: 'minimum_quantity', label: 'Minimum Quantity', sortable: true },
  // { key: 'maximum_quantity', label: 'Maximum Quantity', sortable: true },
  // { key: 'reorder_level', label: 'Reorder Level', sortable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchInventories(query, true)
}

const handleSelected = (selectedItemsList) => {
  selectedInventories.value = selectedItemsList
}

// --- EDIT INVENTORY ---
const handleEditInventory = async (row) => {
  editInventoryForm.value = {
    id: row.id,
    warehouse: row.warehouse ? row.warehouse.name : '',
    item: row.item ? row.item.name : '',
    current_quantity: row.current_quantity,
    minimum_quantity: row.minimum_quantity,
    maximum_quantity: row.maximum_quantity,
    reorder_level: row.reorder_level,
    quantityChange: 0 // Reset quantity change for auto-compute
  }

  autoCompute.value = false // Default to off
  showEditInventoryModal.value = true
}

// --- UPDATE INVENTORY ---
async function updateInventory() {
  try {
    const form = editInventoryForm.value
    const { id, quantityChange } = form

    // If auto-compute is enabled, update current_quantity by adding quantityChange.
    if (autoCompute.value) {
      form.current_quantity += quantityChange
    }

    // Fetch the current inventory details.
    await inventoryStore.fetchItemById(id)
    const storeCurrent = inventoryStore.item?.current_quantity || 0

    // Determine the effective quantity change.
    const effectiveQtyChange = autoCompute.value
      ? quantityChange
      : form.current_quantity - storeCurrent

    // Determine the note based on the effective quantity change:
    // If positive, set note to "manual add"; if negative, set note to "manual deduct"
    const note =
      effectiveQtyChange > 0 ? 'manual add' : effectiveQtyChange < 0 ? 'manual deduct' : ''

    // Adjust the inventory by the effective quantity change.
    await inventoryStore.adjustItemQuantity(id, effectiveQtyChange, note)

    // If there was an error during adjustment, throw to jump to the catch block.
    if (inventoryStore.error) {
      throw new Error(inventoryStore.error)
    }

    // Update the additional inventory details with the note.
    await inventoryStore.updateItem(id, {
      minimum_quantity: form.minimum_quantity,
      maximum_quantity: form.maximum_quantity,
      reorder_level: form.reorder_level
    })

    // Refresh the inventories list.
    await fetchInventories({ page: 1, limit: 5 }, true)
  } catch (error) {
    console.error('Error updating inventory:', error)
  } finally {
    // Close the modal regardless of success or error.
    showEditInventoryModal.value = false
  }
}

// --- CLOSE MODALS ---
const closeEditInventoryModal = () => {
  showEditInventoryModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- ERROR NOTIFICATION -->
      <NotificationBar v-if="inventoryStore.error" :icon="mdiAlertCircle" color="danger">
        {{ inventoryStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Inventory" main>
        <div class="flex items-center gap-2">
          <BaseButton :icon="mdiImport" color="success" label="Import Stocks" />
          <BaseButton :icon="mdiExport" color="warning" label="Export Stocks" />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="inventoryColumns"
          :data="inventoryData"
          :loading="inventoryStore.isLoading"
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditInventory"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- Edit Inventory Modal -->
  <div
    v-if="showEditInventoryModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Update Inventory</h2>

      <!-- Warehouse (readonly) -->
      <label class="block mb-1">Warehouse</label>
      <p class="p-2 bg-gray-100 rounded">{{ editInventoryForm.warehouse }}</p>

      <!-- Item (readonly) -->
      <label class="block mt-2 mb-1">Item</label>
      <p class="p-2 bg-gray-100 rounded">{{ editInventoryForm.item }}</p>

      <!-- Auto-Compute Toggle -->
      <div class="flex items-center mt-4 mb-2">
        <input type="checkbox" v-model="autoCompute" class="mr-2" />
        <label>Auto-Compute (Stock Adjustment Mode)</label>
      </div>

      <!-- Number Fields -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block mb-1">Current Quantity</label>
          <input
            v-model="editInventoryForm.current_quantity"
            :disabled="autoCompute"
            type="number"
            class="w-full border p-2 rounded"
          />
        </div>
        <div v-if="autoCompute">
          <label class="block mb-1">Quantity Change</label>
          <input
            v-model="editInventoryForm.quantityChange"
            type="number"
            class="w-full border p-2 rounded"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-4">
        <div>
          <label class="block mb-1">Minimum Quantity</label>
          <input
            v-model="editInventoryForm.minimum_quantity"
            type="number"
            class="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label class="block mb-1">Maximum Quantity</label>
          <input
            v-model="editInventoryForm.maximum_quantity"
            type="number"
            class="w-full border p-2 rounded"
          />
        </div>
      </div>

      <label class="block mt-2 mb-1">Reorder Level</label>
      <input
        v-model="editInventoryForm.reorder_level"
        type="number"
        class="w-full border p-2 rounded"
      />

      <!-- Buttons -->
      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditInventoryModal">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateInventory">
          Update
        </button>
      </div>
    </div>
  </div>
</template>
