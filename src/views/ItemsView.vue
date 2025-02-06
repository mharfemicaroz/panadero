<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import { useItemStore } from '@/stores/product/item'
import { useWarehouseStore } from '@/stores/warehouse'
import { useProductCategoryStore } from '@/stores/product/category'
import { useSubcategoryStore } from '@/stores/product/subcategory'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewItemModal = ref(false)
const showEditItemModal = ref(false)

const newItemForm = ref({
  name: '',
  price: 0,
  beginning_qty: 0,
  sku: '',
  barcode: '',
  cost: 0,
  unit_of_measurement: '',
  sold_by: '',
  image: '',
  warehouse_id: null,
  category_id: null,
  subcategory_id: null
})

const editItemForm = ref({
  id: null,
  name: '',
  price: 0,
  beginning_qty: 0,
  sku: '',
  barcode: '',
  cost: 0,
  unit_of_measurement: '',
  sold_by: '',
  image: '',
  warehouse_id: null,
  category_id: null,
  subcategory_id: null
})

// --- STORES ---
const itemStore = useItemStore()
const warehouseStore = useWarehouseStore()
const categoryStore = useProductCategoryStore()
const selectedItems = ref([])

// --- FETCH DATA ---
async function fetchItems(queryParams = {}, forceRefresh = false) {
  await itemStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchItems({ page: 1, limit: 5 })

const itemData = computed(() => ({
  total: itemStore.items?.total || 0,
  totalPages: itemStore.items?.totalPages || 1,
  currentPage: itemStore.items?.currentPage || 1,
  pageSize: itemStore.items?.pageSize || 5,
  data: itemStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const itemColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'price', label: 'Price', sortable: true, filterable: true },
  { key: 'cost', label: 'Cost', sortable: true, filterable: true },
  {
    key: 'category',
    label: 'Category',
    formatter: (value, row) => (row.category ? row.category.name : '')
  },
  {
    key: 'subcategory',
    label: 'Subcategory',
    formatter: (value, row) => (row.subcategory ? row.subcategory.name : '')
  }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchItems(query, true)
}

const handleSelected = (selectedItemsList) => {
  selectedItems.value = selectedItemsList
}

const handleEditItem = async (row) => {
  // Fetch all necessary related data before showing the modal
  await warehouseStore.fetchAll()
  await categoryStore.fetchItems()
  await categoryStore.fetchSubcategoriesByCategory(row.category.id)

  // Populate the edit form ensuring relationships are properly assigned
  editItemForm.value = {
    id: row.id,
    name: row.name,
    price: row.price,
    beginning_qty: row.beginning_qty,
    sku: row.sku,
    barcode: row.barcode,
    cost: row.cost,
    unit_of_measurement: row.unit_of_measurement,
    sold_by: row.sold_by,
    image: row.image,
    warehouse_id: row.warehouse ? row.warehouse.id : null,
    category_id: row.category ? row.category.id : null,
    subcategory_id: row.subcategory ? row.subcategory.id : null
  }

  // Show the edit modal
  showEditItemModal.value = true
}

// --- FETCH SUBCATEGORIES ---
async function fetchSubcategories(CategoryId) {
  await categoryStore.fetchSubcategoriesByCategory(CategoryId)
}

// --- CREATE NEW ITEM ---
const handleShowNewItemModal = async () => {
  await warehouseStore.fetchAll()
  await categoryStore.fetchItems()
  categoryStore.subcategories = []
  newItemForm.value = {
    name: '',
    price: 0,
    beginning_qty: 0,
    sku: '',
    barcode: '',
    cost: 0,
    unit_of_measurement: '',
    sold_by: '',
    image: '',
    warehouse_id: null,
    category_id: null,
    subcategory_id: null
  }
  showNewItemModal.value = true
}

async function saveNewItem() {
  await itemStore.createItem(newItemForm.value)
  if (!itemStore.error) {
    showNewItemModal.value = false
    await fetchItems({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE ITEM ---
async function updateItem() {
  await itemStore.updateItem(editItemForm.value.id, editItemForm.value)
  if (!itemStore.error) {
    showEditItemModal.value = false
    await fetchItems({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED ITEMS ---
async function deleteSelectedItems() {
  if (selectedItems.value.length === 0) return

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
    for (const itemId of selectedItems.value) {
      await itemStore.deleteItem(itemId)
      if (itemStore.error) break
    }

    if (!itemStore.error) {
      selectedItems.value = []
      await fetchItems({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The items have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewItemModal = () => {
  showNewItemModal.value = false
}

const closeEditItemModal = () => {
  showEditItemModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="itemStore.error" :icon="mdiAlertCircle" color="danger">
        {{ itemStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Items" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Item"
            @click="handleShowNewItemModal"
          />
          <BaseButton
            v-if="selectedItems.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedItems"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="itemColumns"
          :data="itemData"
          :loading="itemStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditItem"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- New Item Modal -->
  <div
    v-if="showNewItemModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[600px]">
      <h2 class="text-xl mb-4">Add Item</h2>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Name</label>
          <input v-model="newItemForm.name" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Price</label>
          <input v-model="newItemForm.price" type="number" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Beginning Qty</label>
          <input
            v-model="newItemForm.beginning_qty"
            type="number"
            class="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Cost</label>
          <input v-model="newItemForm.cost" type="number" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">SKU</label>
          <input v-model="newItemForm.sku" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Barcode</label>
          <input v-model="newItemForm.barcode" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Unit of Measurement</label>
          <input
            v-model="newItemForm.unit_of_measurement"
            type="text"
            class="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Sold By</label>
          <select v-model="newItemForm.sold_by" class="w-full border p-2 rounded">
            <option value="each">Each</option>
            <option value="weight">Weight</option>
          </select>
        </div>

        <div class="col-span-2">
          <label class="block mb-1">Image URL</label>
          <input v-model="newItemForm.image" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Warehouse</label>

          <select v-model="newItemForm.warehouse_id" class="w-full border p-2 rounded">
            <option
              v-for="warehouse in warehouseStore.warehouses"
              :key="warehouse.id"
              :value="warehouse.id"
            >
              {{ warehouse.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-1">Category</label>
          <select
            v-model="newItemForm.category_id"
            class="w-full border p-2 rounded"
            @change="fetchSubcategories(newItemForm.category_id)"
          >
            <option
              v-for="category in categoryStore.items.data"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="col-span-2">
          <label class="block mb-1">Subcategory</label>
          <select v-model="newItemForm.subcategory_id" class="w-full border p-2 rounded">
            <option
              v-for="subcategory in categoryStore.subcategories"
              :key="subcategory.id"
              :value="subcategory.id"
            >
              {{ subcategory.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewItemModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewItem">Save</button>
      </div>
    </div>
  </div>

  <!-- Edit Item Modal -->
  <div
    v-if="showEditItemModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[600px]">
      <h2 class="text-xl mb-4">Edit Item</h2>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Name</label>
          <input v-model="editItemForm.name" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Price</label>
          <input v-model="editItemForm.price" type="number" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Beginning Qty</label>
          <input
            v-model="editItemForm.beginning_qty"
            type="number"
            class="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Cost</label>
          <input v-model="editItemForm.cost" type="number" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">SKU</label>
          <input v-model="editItemForm.sku" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Barcode</label>
          <input v-model="editItemForm.barcode" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Unit of Measurement</label>
          <input
            v-model="editItemForm.unit_of_measurement"
            type="text"
            class="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Sold By</label>
          <select v-model="editItemForm.sold_by" class="w-full border p-2 rounded">
            <option value="each">Each</option>
            <option value="weight">Weight</option>
          </select>
        </div>

        <div class="col-span-2">
          <label class="block mb-1">Image URL</label>
          <input v-model="editItemForm.image" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Warehouse</label>

          <select v-model="editItemForm.warehouse_id" class="w-full border p-2 rounded">
            <option
              v-for="warehouse in warehouseStore.warehouses"
              :key="warehouse.id"
              :value="warehouse.id"
            >
              {{ warehouse.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-1">Category</label>

          <select
            v-model="editItemForm.category_id"
            class="w-full border p-2 rounded"
            @change="fetchSubcategories(editItemForm.category_id)"
          >
            <option
              v-for="category in categoryStore.items.data"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="col-span-2">
          <label class="block mb-1">Subcategory</label>
          <select v-model="editItemForm.subcategory_id" class="w-full border p-2 rounded">
            <option
              v-for="subcategory in categoryStore.subcategories"
              :key="subcategory.id"
              :value="subcategory.id"
            >
              {{ subcategory.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditItemModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateItem">Update</button>
      </div>
    </div>
  </div>
</template>
