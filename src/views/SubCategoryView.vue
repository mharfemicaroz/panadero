<script setup>
import { ref, computed } from 'vue'
import { useSubcategoryStore } from '@/stores/product/subcategory'
import { useProductCategoryStore } from '@/stores/product/category'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Swal from 'sweetalert2'

// --- State ---
const showNewSubcategoryModal = ref(false)
const newSubcategoryForm = ref({ name: '', categoryId: null })

const showEditSubcategoryModal = ref(false)
const editSubcategoryForm = ref({ id: null, name: '', categoryId: null })

// --- Store ---
const subcategoryStore = useSubcategoryStore()
const categoryStore = useProductCategoryStore()

// Track selected subcategories for bulk actions
const selectedSubcategories = ref([])

// --- Fetch Data ---
async function fetchSubcategories(queryParams = {}, forceRefresh = false) {
  await subcategoryStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchSubcategories({ page: 1, limit: 5 })

// --- Compute Data ---
const subcategoryData = computed(() => ({
  total: subcategoryStore.items?.total || 0,
  totalPages: subcategoryStore.items?.totalPages || 1,
  currentPage: subcategoryStore.items?.currentPage || 1,
  pageSize: subcategoryStore.items?.pageSize || 5,
  data: subcategoryStore.items?.data || []
}))

// --- Table Columns ---
const subcategoryColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  {
    key: 'category',
    label: 'Category',
    formatter: (value, row) => (row.category ? row.category.name : '—')
  }
]

// --- Table Events ---
const handleQueryChange = async (query) => {
  await fetchSubcategories(query, true)
}

const handleSelected = (selectedItems) => {
  selectedSubcategories.value = selectedItems
}

const handleEditSubcategory = async (row) => {
  await categoryStore.fetchItems()
  editSubcategoryForm.value = {
    id: row.id,
    name: row.name,
    categoryId: row.category ? row.category.id : null
  }
  showEditSubcategoryModal.value = true
}

// --- Create New Subcategory ---
const handleShowNewSubcategoryModal = async () => {
  await categoryStore.fetchItems()
  newSubcategoryForm.value = { name: '', categoryId: null }
  showNewSubcategoryModal.value = true
}

async function saveNewSubcategory() {
  await subcategoryStore.createItem({
    name: newSubcategoryForm.value.name,
    categoryId: newSubcategoryForm.value.categoryId
  })

  if (!subcategoryStore.error) {
    showNewSubcategoryModal.value = false
    await fetchSubcategories({ page: 1, limit: 5 }, true)
  }
}

// --- Update Subcategory ---
async function updateSubcategory() {
  await subcategoryStore.updateItem(editSubcategoryForm.value.id, {
    name: editSubcategoryForm.value.name,
    categoryId: editSubcategoryForm.value.categoryId
  })

  if (!subcategoryStore.error) {
    showEditSubcategoryModal.value = false
    await fetchSubcategories({ page: 1, limit: 5 }, true)
  }
}

// --- Delete Selected Subcategories ---
async function deleteSelectedSubcategories() {
  const confirmation = await Swal.fire({
    title: 'Delete Subcategories?',
    text: 'Are you sure you want to delete the selected subcategories?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d'
  })

  if (!confirmation.isConfirmed) return

  for (const subcategoryId of selectedSubcategories.value) {
    await subcategoryStore.deleteItem(subcategoryId)
    if (subcategoryStore.error) break
  }

  if (!subcategoryStore.error) {
    selectedSubcategories.value = []
    await fetchSubcategories({ page: 1, limit: 5 }, true)
  }
}

// --- Close Modals ---
const closeNewSubcategoryModal = () => {
  showNewSubcategoryModal.value = false
}

const closeEditSubcategoryModal = () => {
  showEditSubcategoryModal.value = false
}
</script>

<template>
  <!-- Show notification if error occurs -->
  <NotificationBar v-if="subcategoryStore.error" :icon="mdiAlertCircle" color="danger">
    {{ subcategoryStore.error }}
  </NotificationBar>

  <SectionTitleLineWithButton :icon="mdiTableBorder" title="Subcategories" main>
    <div class="flex items-center gap-2">
      <BaseButton
        :icon="mdiPlus"
        color="primary"
        label="New Subcategory"
        @click="handleShowNewSubcategoryModal"
      />
      <BaseButton
        v-if="selectedSubcategories.length"
        :icon="mdiDelete"
        color="danger"
        label="Delete"
        @click="deleteSelectedSubcategories"
      />
    </div>
  </SectionTitleLineWithButton>

  <CardBox class="mb-6">
    <BaseTable
      :columns="subcategoryColumns"
      :data="subcategoryData"
      :loading="subcategoryStore.isLoading"
      checkable
      @query-change="handleQueryChange"
      @selected="handleSelected"
      @edit="handleEditSubcategory"
    />
  </CardBox>

  <!-- New Subcategory Modal -->
  <div
    v-if="showNewSubcategoryModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Add Subcategory</h2>
      <div class="mb-4">
        <label class="block mb-1" for="subcatName">Name</label>
        <input
          id="subcatName"
          v-model="newSubcategoryForm.name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="categorySelect">Category</label>
        <select
          id="categorySelect"
          v-model="newSubcategoryForm.categoryId"
          class="w-full border p-2 rounded"
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

      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewSubcategoryModal">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewSubcategory">
          Save
        </button>
      </div>
    </div>
  </div>

  <!-- Edit Subcategory Modal -->
  <div
    v-if="showEditSubcategoryModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Edit Subcategory</h2>

      <div class="mb-4">
        <label class="block mb-1" for="editSubcatName">Name</label>
        <input
          id="editSubcatName"
          v-model="editSubcategoryForm.name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="editCategorySelect">Category</label>
        <select
          id="editCategorySelect"
          v-model="editSubcategoryForm.categoryId"
          class="w-full border p-2 rounded"
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

      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditSubcategoryModal">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateSubcategory">
          Update
        </button>
      </div>
    </div>
  </div>
</template>
