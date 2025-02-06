<script setup>
import { ref, computed } from 'vue'
import { useProductCategoryStore } from '@/stores/product/category'
import { useCategoryGroupStore } from '@/stores/product/categoryGroup'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'

import { mdiPlus, mdiTableBorder, mdiDelete } from '@mdi/js' // Import an icon for delete

// Modals for create & edit
const showNewCategoryModal = ref(false)
const newCategoryForm = ref({ name: '', categoryGroup: null, isActive: true })

const showEditCategoryModal = ref(false)
const editCategoryForm = ref({ id: null, name: '', categoryGroup: null, isActive: true })

// STORES
const categoryStore = useProductCategoryStore()
const categoryGroupStore = useCategoryGroupStore()

// Keep track of which categories are currently selected (array of IDs)
const selectedCategories = ref([])

// Fetch data
async function fetchCategories(queryParams, forceRefresh = false) {
  await categoryStore.fetchItems(queryParams, forceRefresh)
}

// On component mount, do an initial fetch (no forced refresh)
fetchCategories({ page: 1, limit: 5 })

// Compute the table data
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

// Table event handlers
const handleQueryChange = async (query) => {
  // For user-initiated sort/filter/page changes, force a refresh
  await fetchCategories(query, true)
}

const handleSelected = (selectedItems) => {
  // This is triggered when rows are (de)selected in BaseTable.
  // `selectedItems` is an array of row IDs.
  selectedCategories.value = selectedItems
}

const handleEditCategory = async (row) => {
  // Fetch category groups so user can choose from the dropdown
  await categoryGroupStore.fetchItems()

  editCategoryForm.value = {
    id: row.id,
    name: row.name,
    categoryGroup: row.categoryGroup ? row.categoryGroup.id : null,
    isActive: row.isActive ?? true
  }
  showEditCategoryModal.value = true
}

// Add new category
const handleShowNewCategoryModal = async () => {
  await categoryGroupStore.fetchItems()

  newCategoryForm.value = {
    name: '',
    categoryGroup: null,
    isActive: true
  }

  showNewCategoryModal.value = true
}

async function saveNewCategory() {
  try {
    await categoryStore.createItem({
      name: newCategoryForm.value.name,
      categoryGroupId: newCategoryForm.value.categoryGroup,
      isActive: newCategoryForm.value.isActive
    })
    showNewCategoryModal.value = false
    await fetchCategories({ page: 1, limit: 5 }, true)
  } catch (error) {
    console.error('Error creating category:', error)
  }
}

// Update category
async function updateCategory() {
  try {
    await categoryStore.updateItem(editCategoryForm.value.id, {
      name: editCategoryForm.value.name,
      categoryGroupId: editCategoryForm.value.categoryGroup,
      isActive: editCategoryForm.value.isActive
    })
    showEditCategoryModal.value = false
    await fetchCategories({ page: 1, limit: 5 }, true)
  } catch (error) {
    console.error('Error updating category:', error)
  }
}

// Delete selected categories
async function deleteSelectedCategories() {
  // Optional confirmation
  if (!confirm('Are you sure you want to delete the selected categories?')) {
    return
  }

  try {
    // Loop over each selected ID and call store's delete action
    for (const categoryId of selectedCategories.value) {
      await categoryStore.deleteItem(categoryId)
    }

    // Clear local selected list
    selectedCategories.value = []

    // Optionally re-fetch from server to ensure data is up to date
    await fetchCategories({ page: 1, limit: 5 }, true)
  } catch (error) {
    console.error('Error deleting categories:', error)
  }
}

// Close modals
const closeNewCategoryModal = () => {
  showNewCategoryModal.value = false
}

const closeEditCategoryModal = () => {
  showEditCategoryModal.value = false
}
</script>

<template>
  <SectionTitleLineWithButton :icon="mdiTableBorder" title="Category" main>
    <!-- Wrap the two buttons in a single container -->
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
