<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import { useBranchStore } from '@/stores/branch'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewBranchModal = ref(false)
const showEditBranchModal = ref(false)

const newBranchForm = ref({
  name: '',
  location: '',
  is_active: true
})

const editBranchForm = ref({
  id: null,
  name: '',
  location: '',
  is_active: true
})

// --- STORES ---
const branchStore = useBranchStore()
const selectedBranches = ref([])

// --- FETCH DATA ---
async function fetchBranches(queryParams = {}, forceRefresh = false) {
  await branchStore.fetchAll(queryParams, forceRefresh)
}

// Initial fetch
fetchBranches({ page: 1, limit: 5 })

const branchData = computed(() => ({
  total: branchStore.branches?.total || 0,
  totalPages: branchStore.branches?.totalPages || 1,
  currentPage: branchStore.branches?.currentPage || 1,
  pageSize: branchStore.branches?.pageSize || 5,
  data: branchStore.branches?.data || []
}))

// --- TABLE COLUMNS ---
const branchColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'location', label: 'Location', sortable: true, filterable: true },
  {
    key: 'is_active',
    label: 'Status',
    sortable: true,
    formatter: (value) => (value ? 'Active' : 'Inactive')
  }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchBranches(query, true)
}

const handleSelected = (selectedBranchesList) => {
  selectedBranches.value = selectedBranchesList
}

const handleEditBranch = (row) => {
  editBranchForm.value = {
    id: row.id,
    name: row.name,
    location: row.location,
    is_active: row.is_active
  }
  showEditBranchModal.value = true
}

// --- CREATE NEW BRANCH ---
const handleShowNewBranchModal = () => {
  newBranchForm.value = {
    name: '',
    location: '',
    is_active: true
  }
  showNewBranchModal.value = true
}

async function saveNewBranch() {
  await branchStore.create(newBranchForm.value)
  if (!branchStore.error) {
    showNewBranchModal.value = false
    await fetchBranches({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE BRANCH ---
async function updateBranch() {
  await branchStore.updateById(editBranchForm.value.id, editBranchForm.value)

  if (!branchStore.error) {
    showEditBranchModal.value = false
    await fetchBranches({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED BRANCHES ---
async function deleteSelectedBranches() {
  if (selectedBranches.value.length === 0) return

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
    for (const branchId of selectedBranches.value) {
      await branchStore.deleteById(branchId)
      if (branchStore.error) break
    }

    if (!branchStore.error) {
      selectedBranches.value = []
      await fetchBranches({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The branches have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewBranchModal = () => {
  showNewBranchModal.value = false
}

const closeEditBranchModal = () => {
  showEditBranchModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="branchStore.error" :icon="mdiAlertCircle" color="danger">
        {{ branchStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Branches" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Branch"
            @click="handleShowNewBranchModal"
          />
          <BaseButton
            v-if="selectedBranches.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedBranches"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="branchColumns"
          :data="branchData"
          :loading="branchStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditBranch"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- New Branch Modal -->
  <div
    v-if="showNewBranchModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[500px]">
      <h2 class="text-xl mb-4">Add Branch</h2>

      <div class="space-y-4">
        <div>
          <label class="block mb-1">Name</label>
          <input v-model="newBranchForm.name" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Location</label>
          <input v-model="newBranchForm.location" type="text" class="w-full border p-2 rounded" />
        </div>

        <div class="flex items-center">
          <input v-model="newBranchForm.is_active" type="checkbox" class="mr-2" />
          <label>Active</label>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewBranchModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewBranch">
          Save
        </button>
      </div>
    </div>
  </div>

  <!-- Edit Branch Modal -->
  <div
    v-if="showEditBranchModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[500px]">
      <h2 class="text-xl mb-4">Edit Branch</h2>

      <div class="space-y-4">
        <div>
          <label class="block mb-1">Name</label>
          <input v-model="editBranchForm.name" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Location</label>
          <input v-model="editBranchForm.location" type="text" class="w-full border p-2 rounded" />
        </div>

        <div class="flex items-center">
          <input v-model="editBranchForm.is_active" type="checkbox" class="mr-2" />
          <label>Active</label>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditBranchModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateBranch">
          Update
        </button>
      </div>
    </div>
  </div>
</template>
