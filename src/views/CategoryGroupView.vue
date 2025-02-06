<script setup>
import { ref, computed } from 'vue'
import { useCategoryGroupStore } from '@/stores/product/categoryGroup'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiPlus, mdiTableBorder, mdiDelete } from '@mdi/js' // Import a delete icon

// --------------------------------------
// State for modals
// --------------------------------------
const showNewCategoryGroupModal = ref(false)
const newCategoryGroupForm = ref({ name: '' })

const showEditCategoryGroupModal = ref(false)
const editCategoryGroupForm = ref({ id: null, name: '' })

// Keep track of selected groups (array of IDs)
const selectedGroups = ref([])

// Store
const categoryGroupStore = useCategoryGroupStore()

// Fetch data
async function fetchCategoryGroups(queryParams, forceRefresh = false) {
  await categoryGroupStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch (no forceRefresh => won’t re-fetch if already loaded)
fetchCategoryGroups({ page: 1, limit: 5 })

// Compute table data
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
  // For user-driven sorting/filtering/pagination => force a refresh
  await fetchCategoryGroups(query, true)
}

const handleSelected = (selected) => {
  // selected is an array of row IDs (from BaseTable)
  selectedGroups.value = selected
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

// Delete selected category groups
async function deleteSelectedCategoryGroups() {
  if (!confirm('Are you sure you want to delete the selected category groups?')) {
    return
  }

  try {
    // Loop each selected ID, call the store delete action
    for (const groupId of selectedGroups.value) {
      await categoryGroupStore.deleteItem(groupId)
    }
    // Clear local selection
    selectedGroups.value = []

    // Optionally re-fetch from server
    await fetchCategoryGroups({ page: 1, limit: 5 }, true)
  } catch (err) {
    console.error('Error deleting groups:', err)
  }
}

// Close modals
function closeNewGroupModal() {
  showNewCategoryGroupModal.value = false
}
function closeEditGroupModal() {
  showEditCategoryGroupModal.value = false
}
</script>

<template>
  <SectionTitleLineWithButton :icon="mdiTableBorder" title="Category Group" main>
    <!-- Wrap buttons together to keep them close, e.g. flex with gap -->
    <div class="flex items-center gap-2">
      <!-- New Group Button -->
      <BaseButton
        :icon="mdiPlus"
        color="primary"
        label="New Category Group"
        @click="showNewGroupModal"
      />

      <!-- Delete Button: only show if there's at least one selected group -->
      <BaseButton
        v-if="selectedGroups.length"
        :icon="mdiDelete"
        color="danger"
        label="Delete"
        @click="deleteSelectedCategoryGroups"
      />
    </div>
  </SectionTitleLineWithButton>

  <CardBox class="mb-6">
    <!-- Pass isLoading from store, table is checkable to allow row selection -->
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
