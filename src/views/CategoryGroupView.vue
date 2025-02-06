<script setup>
import { ref, computed } from 'vue'
import { useCategoryGroupStore } from '@/stores/product/categoryGroup'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiPlus, mdiTableBorder } from '@mdi/js'

// --------------------------------------
// State for modals
// --------------------------------------
const showNewCategoryGroupModal = ref(false)
const newCategoryGroupForm = ref({ name: '' })

const showEditCategoryGroupModal = ref(false)
const editCategoryGroupForm = ref({ id: null, name: '' })

// Store
const categoryGroupStore = useCategoryGroupStore()

// 1. Create a function to fetch data with an optional forceRefresh
async function fetchCategoryGroups(queryParams, forceRefresh = false) {
  await categoryGroupStore.fetchItems(queryParams, forceRefresh)
}

// 2. Initial fetch: no forceRefresh => won't fetch again if already loaded
fetchCategoryGroups({ page: 1, limit: 5 })

const categoryGroupData = computed(() => ({
  total: categoryGroupStore.items?.total || 0,
  totalPages: categoryGroupStore.items?.totalPages || 1,
  currentPage: categoryGroupStore.items?.currentPage || 1,
  pageSize: categoryGroupStore.items?.pageSize || 5,
  data: categoryGroupStore.items?.data || []
}))

// Table Definition
const categoryGroupColumns = [{ key: 'name', label: 'Name', sortable: true, filterable: true }]

// Table events
const handleQueryChange = async (query) => {
  // For user-driven sorting/filtering/pagination,
  // we do want fresh data each time => pass forceRefresh: true
  await fetchCategoryGroups(query, true)
}

const handleSelected = (selected) => {
  console.log('Selected Groups:', selected)
}

const handleEditCategoryGroup = (row) => {
  editCategoryGroupForm.value = {
    id: row.id,
    name: row.name
  }
  showEditCategoryGroupModal.value = true
}

// Create & Update
function showNewGroupModal() {
  newCategoryGroupForm.value = { name: '' }
  showNewCategoryGroupModal.value = true
}

async function saveNewCategoryGroup() {
  try {
    await categoryGroupStore.createItem(newCategoryGroupForm.value)
    showNewCategoryGroupModal.value = false
    // Force refresh to see the newly added group
    await fetchCategoryGroups({ page: 1, limit: 5 }, true)
  } catch (err) {
    console.error('Error creating group:', err)
  }
}

async function updateCategoryGroup() {
  try {
    await categoryGroupStore.updateItem(editCategoryGroupForm.value.id, {
      name: editCategoryGroupForm.value.name
    })
    showEditCategoryGroupModal.value = false
    // Force refresh to see updated group
    await fetchCategoryGroups({ page: 1, limit: 5 }, true)
  } catch (err) {
    console.error('Error updating group:', err)
  }
}

function closeNewGroupModal() {
  showNewCategoryGroupModal.value = false
}

function closeEditGroupModal() {
  showEditCategoryGroupModal.value = false
}
</script>

<template>
  <SectionTitleLineWithButton :icon="mdiTableBorder" title="Category Group" main>
    <BaseButton
      :icon="mdiPlus"
      color="primary"
      label="New Category Group"
      @click="showNewGroupModal"
    />
  </SectionTitleLineWithButton>

  <CardBox class="mb-6">
    <!-- Pass the isLoading state from the store -->
    <BaseTable
      :columns="categoryGroupColumns"
      :data="categoryGroupData"
      :loading="categoryGroupStore.isLoading"
      checkable
      @query-change="handleQueryChange"
      @selected="handleSelected"
      @edit="handleEditCategoryGroup"
    />
  </CardBox>

  <!-- New Category Group Modal -->
  <div
    v-if="showNewCategoryGroupModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">New Category Group</h2>
      <div class="mb-4">
        <label class="block mb-1" for="groupName">Name</label>
        <input
          id="groupName"
          type="text"
          v-model="newCategoryGroupForm.name"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewGroupModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewCategoryGroup">
          Save
        </button>
      </div>
    </div>
  </div>

  <!-- Edit Category Group Modal -->
  <div
    v-if="showEditCategoryGroupModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl mb-4">Edit Category Group</h2>
      <div class="mb-4">
        <label class="block mb-1" for="editGroupName">Name</label>
        <input
          id="editGroupName"
          type="text"
          v-model="editCategoryGroupForm.name"
          class="w-full border p-2 rounded"
        />
      </div>
      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditGroupModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateCategoryGroup">
          Update
        </button>
      </div>
    </div>
  </div>
</template>
