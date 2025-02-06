<template>
  <!-- 1. Show a NotificationBar if there's an error in the store -->
  <NotificationBar v-if="categoryGroupStore.error" :icon="mdiAlertCircle" color="danger">
    {{ categoryGroupStore.error }}
  </NotificationBar>

  <SectionTitleLineWithButton :icon="mdiTableBorder" title="Category Group" main>
    <!-- Buttons in a small flex container -->
    <div class="flex items-center gap-2">
      <BaseButton
        :icon="mdiPlus"
        color="primary"
        label="New Category Group"
        @click="showNewGroupModal"
      />

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
    <!-- The table displays category groups, handles selection, sorting, pagination, etc. -->
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

<script setup>
import { ref, computed } from 'vue'

// 1. Import the store and icons
import { useCategoryGroupStore } from '@/stores/product/categoryGroup'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// 2. Import NotificationBar and other components
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'

// 3. Import SweetAlert2
// If you declared SweetAlert2 globally (via main.js -> app.config.globalProperties.$swal),
// you can call `this.$swal` or `getCurrentInstance().proxy.$swal`.
// Otherwise, import locally:
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css'

// --- State for modals ---
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

// Initial fetch
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
  // Force a refresh for user-driven sorting/filtering/pagination
  await fetchCategoryGroups(query, true)
}

const handleSelected = (selected) => {
  // Selected is an array of row IDs (from BaseTable)
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
  await categoryGroupStore.createItem(newCategoryGroupForm.value)

  // If there's no error, close the modal & refresh
  if (!categoryGroupStore.error) {
    showNewCategoryGroupModal.value = false
    await fetchCategoryGroups({ page: 1, limit: 5 }, true)
  }
}

async function updateCategoryGroup() {
  await categoryGroupStore.updateItem(editCategoryGroupForm.value.id, {
    name: editCategoryGroupForm.value.name
  })

  // If successful, close modal & refresh
  if (!categoryGroupStore.error) {
    showEditCategoryGroupModal.value = false
    await fetchCategoryGroups({ page: 1, limit: 5 }, true)
  }
}

// Delete selected category groups using SweetAlert2
async function deleteSelectedCategoryGroups() {
  if (!selectedGroups.value.length) return

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${selectedGroups.value.length} selected category groups. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  })

  if (!result.isConfirmed) {
    return
  }

  // Loop each selected ID, call the store's delete action
  for (const groupId of selectedGroups.value) {
    await categoryGroupStore.deleteItem(groupId)
    if (categoryGroupStore.error) break
  }

  // If no error, clear selection & refresh
  if (!categoryGroupStore.error) {
    selectedGroups.value = []
    await fetchCategoryGroups({ page: 1, limit: 5 }, true)

    // Show success alert
    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: 'Selected category groups have been deleted.',
      timer: 1500,
      showConfirmButton: false
    })
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
