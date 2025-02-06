<template>
  <!-- 1. Show a NotificationBar if there's an error in the store -->
  <NotificationBar v-if="categoryStore.error" :icon="mdiAlertCircle" color="danger">
    {{ categoryStore.error }}
  </NotificationBar>

  <SectionTitleLineWithButton :icon="mdiTableBorder" title="Category" main>
    <!-- Buttons in a small flex container -->
    <div class="flex items-center gap-2">
      <BaseButton
        :icon="mdiPlus"
        color="primary"
        label="New Category"
        @click="handleShowNewCategoryModal"
      />
      <BaseButton
        v-if="selectedCategories.length"
        :icon="mdiDelete"
        color="danger"
        label="Delete"
        @click="deleteSelectedCategories"
      />
    </div>
  </SectionTitleLineWithButton>

  <CardBox class="mb-6">
    <!-- The table displays categories, handles selection, sorting, paging, etc. -->
    <BaseTable
      :columns="categoryColumns"
      :data="categoryData"
      :loading="categoryStore.isLoading"
      checkable
      @query-change="handleQueryChange"
      @selected="handleSelected"
      @edit="handleEditCategory"
    />
  </CardBox>

  <!-- Modal to create a new category -->
  <div
    v-if="showNewCategoryModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Add Category</h2>
      <div class="mb-4">
        <label class="block mb-1" for="catName">Name</label>
        <input
          id="catName"
          v-model="newCategoryForm.name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="catGroupSelect">Category Group</label>
        <select
          id="catGroupSelect"
          v-model="newCategoryForm.categoryGroup"
          class="w-full border p-2 rounded"
        >
          <option :value="null">None</option>
          <option v-for="group in categoryGroupStore.items.data" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
        </select>
      </div>

      <div class="mb-4 flex items-center">
        <input id="isActive" type="checkbox" v-model="newCategoryForm.isActive" class="mr-2" />
        <label for="isActive">Show in POS?</label>
      </div>

      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewCategoryModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewCategory">
          Save
        </button>
      </div>
    </div>
  </div>

  <!-- Modal to edit an existing category -->
  <div
    v-if="showEditCategoryModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Edit Category</h2>

      <div class="mb-4">
        <label class="block mb-1" for="editCatName">Name</label>
        <input
          id="editCatName"
          v-model="editCategoryForm.name"
          type="text"
          class="w-full border p-2 rounded"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="editCatGroupSelect">Category Group</label>
        <select
          id="editCatGroupSelect"
          v-model="editCategoryForm.categoryGroup"
          class="w-full border p-2 rounded"
        >
          <option :value="null">None</option>
          <option v-for="group in categoryGroupStore.items.data" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
        </select>
      </div>

      <div class="mb-4 flex items-center">
        <input id="editIsActive" type="checkbox" v-model="editCategoryForm.isActive" class="mr-2" />
        <label for="editIsActive">Show in POS?</label>
      </div>

      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditCategoryModal">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateCategory">
          Update
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 1. Import your store that has `error`, `isLoading`, etc.
import { useProductCategoryStore } from '@/stores/product/category'
import { useCategoryGroupStore } from '@/stores/product/categoryGroup'

// 2. Import icons, NotificationBar, and SweetAlert2
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'
import NotificationBar from '@/components/NotificationBar.vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css'

// 3. Import any base components
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'

// --- Local State ---
const showNewCategoryModal = ref(false)
const newCategoryForm = ref({
  name: '',
  categoryGroup: null,
  isActive: true
})

const showEditCategoryModal = ref(false)
const editCategoryForm = ref({
  id: null,
  name: '',
  categoryGroup: null,
  isActive: true
})

// --- Stores ---
const categoryStore = useProductCategoryStore()
const categoryGroupStore = useCategoryGroupStore()

// Track which categories are selected (IDs)
const selectedCategories = ref([])

// --- Fetch Data ---
async function fetchCategories(queryParams, forceRefresh = false) {
  await categoryStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchCategories({ page: 1, limit: 5 })

// Table Data
const categoryData = computed(() => ({
  total: categoryStore.items?.total || 0,
  totalPages: categoryStore.items?.totalPages || 1,
  currentPage: categoryStore.items?.currentPage || 1,
  pageSize: categoryStore.items?.pageSize || 5,
  data: categoryStore.items?.data || []
}))

// Table columns
const categoryColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  {
    key: 'categoryGroup',
    label: 'Category Group',
    formatter: (value, row) => (row.categoryGroup ? row.categoryGroup.name : '')
  }
]

// --- Table Events ---
const handleQueryChange = async (query) => {
  // Force a refresh for user-initiated sort/filter/page changes
  await fetchCategories(query, true)
}

const handleSelected = (selectedItems) => {
  selectedCategories.value = selectedItems
}

const handleEditCategory = async (row) => {
  categoryStore.isLoading = true

  // Fetch category groups before proceeding
  await categoryGroupStore.fetchItems()

  // Ensure all data has finished loading
  while (categoryGroupStore.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay to check again
  }

  // Populate the edit form
  editCategoryForm.value = {
    id: row.id,
    name: row.name,
    categoryGroup: row.categoryGroup ? row.categoryGroup.id : null,
    isActive: row.isActive ?? true
  }

  // Show edit modal after everything is ready
  showEditCategoryModal.value = true
  categoryStore.isLoading = false
}

// --- Create Category ---
const handleShowNewCategoryModal = async () => {
  categoryStore.isLoading = true

  // Fetch category groups before proceeding
  await categoryGroupStore.fetchItems()

  // Ensure all data has finished loading
  while (categoryGroupStore.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay to check again
  }

  // Reset new category form
  newCategoryForm.value = {
    name: '',
    categoryGroup: null,
    isActive: true
  }

  // Show new category modal after everything is ready
  showNewCategoryModal.value = true
  categoryStore.isLoading = false
}

async function saveNewCategory() {
  await categoryStore.createItem({
    name: newCategoryForm.value.name,
    categoryGroupId: newCategoryForm.value.categoryGroup,
    isActive: newCategoryForm.value.isActive
  })

  // If there's no error, close modal & refresh
  if (!categoryStore.error) {
    showNewCategoryModal.value = false
    await fetchCategories({ page: 1, limit: 5 }, true)
  }
}

// --- Update Category ---
async function updateCategory() {
  await categoryStore.updateItem(editCategoryForm.value.id, {
    name: editCategoryForm.value.name,
    categoryGroupId: editCategoryForm.value.categoryGroup,
    isActive: editCategoryForm.value.isActive
  })

  if (!categoryStore.error) {
    showEditCategoryModal.value = false
    await fetchCategories({ page: 1, limit: 5 }, true)
  }
}

// --- Delete Selected (using SweetAlert2) ---
async function deleteSelectedCategories() {
  if (!selectedCategories.value.length) return

  // Show the SweetAlert2 confirmation
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${selectedCategories.value.length} selected categories. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  })

  // If user cancels, do nothing
  if (!result.isConfirmed) return

  // Otherwise, proceed with deletion
  for (const categoryId of selectedCategories.value) {
    await categoryStore.deleteItem(categoryId)
    if (categoryStore.error) break
  }

  // If no error, clear selection & refresh
  if (!categoryStore.error) {
    selectedCategories.value = []
    await fetchCategories({ page: 1, limit: 5 }, true)

    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: 'Selected categories have been deleted.',
      timer: 1500,
      showConfirmButton: false
    })
  }
}

// --- Close Modals ---
const closeNewCategoryModal = () => {
  showNewCategoryModal.value = false
}

const closeEditCategoryModal = () => {
  showEditCategoryModal.value = false
}
</script>
