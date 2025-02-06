<script setup>
import { ref, computed } from 'vue'
import { useProductCategoryStore } from '@/stores/product/category'
import { useCategoryGroupStore } from '@/stores/product/categoryGroup'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiPlus, mdiTableBorder } from '@mdi/js'

const showNewCategoryModal = ref(false)
const newCategoryForm = ref({ name: '', categoryGroup: null, isActive: true })

const showEditCategoryModal = ref(false)
const editCategoryForm = ref({ id: null, name: '', categoryGroup: null, isActive: true })

// STORES
const categoryStore = useProductCategoryStore()
const categoryGroupStore = useCategoryGroupStore()

// FETCH DATA
async function fetchCategories(queryParams, forceRefresh = false) {
  // We pass forceRefresh if we truly want to re-fetch data from the server
  await categoryStore.fetchItems(queryParams, forceRefresh)
}
// On component mount, fetch categories (no forceRefresh, so only first time fetch)
fetchCategories({ page: 1, limit: 5 })

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

// Handle table events
const handleQueryChange = async (query) => {
  // This might be a user-initiated sort/filter/page change, so we DO want a refresh
  await fetchCategories(query, true)
}

const handleSelected = (selectedItems) => {
  console.log('Selected categories:', selectedItems)
}

const handleEditCategory = async (row) => {
  console.log('Edit Category:', row)
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
  newCategoryForm.value = { name: '', categoryGroup: null, isActive: true }
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
    // Force refresh so we see the newly added category
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
    // Force refresh so we see updated data
    await fetchCategories({ page: 1, limit: 5 }, true)
  } catch (error) {
    console.error('Error updating category:', error)
  }
}

// Close modals
const closeNewCategoryModal = () => (showNewCategoryModal.value = false)
const closeEditCategoryModal = () => (showEditCategoryModal.value = false)
</script>

<template>
  <SectionTitleLineWithButton :icon="mdiTableBorder" title="Category" main>
    <BaseButton
      :icon="mdiPlus"
      color="primary"
      label="New Category"
      @click="handleShowNewCategoryModal"
    />
  </SectionTitleLineWithButton>

  <CardBox class="mb-6">
    <!-- Pass `loading` prop to BaseTable -->
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

  <!-- New Category Modal -->
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

  <!-- Edit Category Modal -->
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
