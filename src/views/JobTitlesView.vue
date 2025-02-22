<script setup>
import { ref, computed } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import { useJobTitleStore } from '../stores/hr/jobTitleStore'
import NotificationBar from '../components/NotificationBar.vue'
import BaseTable from '../components/BaseTable.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'
import Swal from 'sweetalert2'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'

// --- STATE ---
const showNewJobTitleModal = ref(false)
const showEditJobTitleModal = ref(false)

const newJobTitleForm = ref({
  title: '',
  description: ''
})

const editJobTitleForm = ref({
  id: null,
  title: '',
  description: ''
})

// --- STORES ---
const jobTitleStore = useJobTitleStore()
const selectedJobTitles = ref([])

// --- FETCH DATA ---
async function fetchJobTitles(queryParams = {}, forceRefresh = false) {
  await jobTitleStore.fetchItems(queryParams, forceRefresh)
}

// Initial fetch
fetchJobTitles({ page: 1, limit: 5 })

const jobTitleData = computed(() => ({
  total: jobTitleStore.items?.total || 0,
  totalPages: jobTitleStore.items?.totalPages || 1,
  currentPage: jobTitleStore.items?.currentPage || 1,
  pageSize: jobTitleStore.items?.pageSize || 5,
  data: jobTitleStore.items?.data || []
}))

// --- TABLE COLUMNS ---
const jobTitleColumns = [
  { key: 'title', label: 'Title', sortable: true, filterable: true },
  { key: 'description', label: 'Description', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchJobTitles(query, true)
}

const handleSelected = (selectedJobTitlesList) => {
  selectedJobTitles.value = selectedJobTitlesList
}

const handleEditJobTitle = (row) => {
  editJobTitleForm.value = {
    id: row.id,
    title: row.title,
    description: row.description
  }
  showEditJobTitleModal.value = true
}

// --- CREATE NEW JOB TITLE ---
const handleShowNewJobTitleModal = () => {
  newJobTitleForm.value = {
    title: '',
    description: ''
  }
  showNewJobTitleModal.value = true
}

async function saveNewJobTitle() {
  await jobTitleStore.createItem(newJobTitleForm.value)
  if (!jobTitleStore.error) {
    showNewJobTitleModal.value = false
    await fetchJobTitles({ page: 1, limit: 5 }, true)
  }
}

// --- UPDATE JOB TITLE ---
async function updateJobTitle() {
  await jobTitleStore.updateItem(editJobTitleForm.value.id, editJobTitleForm.value)
  if (!jobTitleStore.error) {
    showEditJobTitleModal.value = false
    await fetchJobTitles({ page: 1, limit: 5 }, true)
  }
}

// --- DELETE SELECTED JOB TITLES ---
async function deleteSelectedJobTitles() {
  if (selectedJobTitles.value.length === 0) return

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
    for (const jobTitleId of selectedJobTitles.value) {
      await jobTitleStore.deleteItem(jobTitleId)
      if (jobTitleStore.error) break
    }

    if (!jobTitleStore.error) {
      selectedJobTitles.value = []
      await fetchJobTitles({ page: 1, limit: 5 }, true)
      Swal.fire('Deleted!', 'The job titles have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewJobTitleModal = () => {
  showNewJobTitleModal.value = false
}

const closeEditJobTitleModal = () => {
  showEditJobTitleModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="jobTitleStore.error" :icon="mdiAlertCircle" color="danger">
        {{ jobTitleStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Job Titles" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New Job Title"
            @click="handleShowNewJobTitleModal"
          />
          <BaseButton
            v-if="selectedJobTitles.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedJobTitles"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="jobTitleColumns"
          :data="jobTitleData"
          :loading="jobTitleStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditJobTitle"
        />
      </CardBox>
    </SectionMain>

    <!-- New Job Title Modal -->
    <div
      v-if="showNewJobTitleModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Add Job Title</h2>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Title</label>
            <input v-model="newJobTitleForm.title" type="text" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block mb-1">Description</label>
            <textarea
              v-model="newJobTitleForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewJobTitleModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewJobTitle">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Job Title Modal -->
    <div
      v-if="showEditJobTitleModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-[600px]">
        <h2 class="text-xl mb-4">Edit Job Title</h2>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block mb-1">Title</label>
            <input v-model="editJobTitleForm.title" type="text" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block mb-1">Description</label>
            <textarea
              v-model="editJobTitleForm.description"
              class="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditJobTitleModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateJobTitle">
            Update
          </button>
        </div>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
