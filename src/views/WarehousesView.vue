<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import { useWarehouseStore } from '@/stores/warehouse'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewWarehouseModal = ref(false)
const newWarehouseForm = ref({ name: '', location: '' })

const showEditWarehouseModal = ref(false)
const editWarehouseForm = ref({ id: null, name: '', location: '' })

// Store
const warehouseStore = useWarehouseStore()
const selectedWarehouses = ref([])

// --- FETCH DATA ---
async function fetchWarehouses(queryParams = {}, forceRefresh = false) {
  await warehouseStore.fetchAll(queryParams, forceRefresh)
}

// Initial fetch
fetchWarehouses({ page: 1, limit: 5 })

// Compute table data
const warehouseData = computed(() => ({
  total: warehouseStore.warehouses?.length || 0,
  data: warehouseStore.warehouses || []
}))

// Table columns
const warehouseColumns = [
  { key: 'name', label: 'Warehouse Name', sortable: true, filterable: true },
  { key: 'location', label: 'Location', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchWarehouses(query, true)
}

const handleSelected = (selectedItems) => {
  selectedWarehouses.value = selectedItems
}

const handleEditWarehouse = (row) => {
  editWarehouseForm.value = {
    id: row.id,
    name: row.name,
    location: row.location
  }
  showEditWarehouseModal.value = true
}

// --- CREATE NEW WAREHOUSE ---
const handleShowNewWarehouseModal = () => {
  newWarehouseForm.value = { name: '', location: '' }
  showNewWarehouseModal.value = true
}

async function saveNewWarehouse() {
  await warehouseStore.create(newWarehouseForm.value)
  if (!warehouseStore.error) {
    showNewWarehouseModal.value = false
    await fetchWarehouses({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE WAREHOUSE ---
async function updateWarehouse() {
  await warehouseStore.updateById(editWarehouseForm.value.id, {
    name: editWarehouseForm.value.name,
    location: editWarehouseForm.value.location
  })
  if (!warehouseStore.error) {
    showEditWarehouseModal.value = false
    await fetchWarehouses({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED WAREHOUSES ---
async function deleteSelectedWarehouses() {
  if (selectedWarehouses.value.length === 0) return

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
    for (const warehouseId of selectedWarehouses.value) {
      await warehouseStore.deleteById(warehouseId)
      if (warehouseStore.error) break
    }

    if (!warehouseStore.error) {
      selectedWarehouses.value = []
      await fetchWarehouses({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The warehouses have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewWarehouseModal = () => {
  showNewWarehouseModal.value = false
}

const closeEditWarehouseModal = () => {
  showEditWarehouseModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- ERROR NOTIFICATION -->
      <NotificationBar v-if="warehouseStore.error" :icon="mdiAlertCircle" color="danger">
        {{ warehouseStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Warehouse" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Warehouse"
            @click="handleShowNewWarehouseModal"
          />
          <BaseButton
            v-if="selectedWarehouses.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedWarehouses"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="warehouseColumns"
          :data="warehouseData"
          :loading="warehouseStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditWarehouse"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- New Warehouse Modal -->
  <div
    v-if="showNewWarehouseModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Add Warehouse</h2>
      <div class="mb-4">
        <label class="block mb-1" for="warehouseName">Name</label>
        <input
          id="warehouseName"
          v-model="newWarehouseForm.name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1" for="warehouseLocation">Location</label>
        <input
          id="warehouseLocation"
          v-model="newWarehouseForm.location"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewWarehouseModal">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewWarehouse">
          Save
        </button>
      </div>
    </div>
  </div>

  <!-- Edit Warehouse Modal -->
  <div
    v-if="showEditWarehouseModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Edit Warehouse</h2>
      <div class="mb-4">
        <label class="block mb-1" for="editWarehouseName">Name</label>
        <input
          id="editWarehouseName"
          v-model="editWarehouseForm.name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1" for="editWarehouseLocation">Location</label>
        <input
          id="editWarehouseLocation"
          v-model="editWarehouseForm.location"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditWarehouseModal">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateWarehouse">
          Update
        </button>
      </div>
    </div>
  </div>
</template>
