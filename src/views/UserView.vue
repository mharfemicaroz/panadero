<script setup>
import { ref, computed } from 'vue'
import { mdiPlus, mdiTableBorder, mdiDelete, mdiAlertCircle } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import BaseTable from '@/components/BaseTable.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/user'

// --- STATE ---
const showNewUserModal = ref(false)
const showEditUserModal = ref(false)

const newUserForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'cashier',
  first_name: '',
  last_name: ''
})

const editUserForm = ref({
  id: null,
  username: '',
  email: '',
  role: 'cashier',
  first_name: '',
  last_name: ''
})

// --- STORES ---
const userStore = useUserStore()
const selectedUsers = ref([])

// --- FETCH DATA ---
async function fetchUsers(queryParams = {}, forceRefresh = false) {
  await userStore.fetchAll(queryParams, forceRefresh)
}

// Initial fetch
fetchUsers({ page: 1, limit: 10 })

const userData = computed(() => {
  const pageSize = userStore.users?.pageSize || 10
  const allData = userStore.users?.data || []
  // Filter users to include only those with role 'cashier' or 'admin'
  const filteredData = allData.filter((user) => ['cashier', 'admin'].includes(user.role))
  const total = filteredData.length
  const totalPages = Math.ceil(total / pageSize)

  return {
    total,
    totalPages,
    currentPage: userStore.users?.currentPage || 1,
    pageSize,
    data: filteredData
  }
})

// --- TABLE COLUMNS ---
const userColumns = [
  { key: 'username', label: 'Username', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'first_name', label: 'First Name', sortable: true, filterable: true },
  { key: 'last_name', label: 'Last Name', sortable: true, filterable: true }
]

// --- TABLE EVENTS ---
const handleQueryChange = async (query) => {
  await fetchUsers(query, true)
}

const handleSelected = (selectedUsersList) => {
  selectedUsers.value = selectedUsersList
}

const handleEditUser = async (row) => {
  editUserForm.value = {
    id: row.id,
    username: row.username,
    email: row.email,
    role: 'cashier',
    first_name: row.first_name,
    last_name: row.last_name
  }

  showEditUserModal.value = true
}

// --- CREATE NEW USER ---
const handleShowNewUserModal = () => {
  newUserForm.value = {
    username: '',
    email: '',
    password: '',
    role: 'cashier',
    first_name: '',
    last_name: ''
  }
  showNewUserModal.value = true
}

async function saveNewUser() {
  await userStore.create(newUserForm.value)
  if (!userStore.error) {
    showNewUserModal.value = false
    await fetchUsers({ page: 1, limit: 10 }, true)
  }
}

// --- UPDATE USER ---
async function updateUser() {
  await userStore.updateById(editUserForm.value.id, editUserForm.value)
  if (!userStore.error) {
    showEditUserModal.value = false
    await fetchUsers({ page: 1, limit: 10 }, true)
  }
}

// --- DELETE SELECTED USERS ---
async function deleteSelectedUsers() {
  if (selectedUsers.value.length === 0) return

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
    for (const userId of selectedUsers.value) {
      await userStore.deleteById(userId)
      if (userStore.error) break
    }

    if (!userStore.error) {
      selectedUsers.value = []
      await fetchUsers({ page: 1, limit: 10 }, true)
      Swal.fire('Deleted!', 'The users have been deleted.', 'success')
    }
  }
}

// --- CLOSE MODALS ---
const closeNewUserModal = () => {
  showNewUserModal.value = false
}

const closeEditUserModal = () => {
  showEditUserModal.value = false
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="userStore.error" :icon="mdiAlertCircle" color="danger">
        {{ userStore.error }}
      </NotificationBar>

      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Cashiers" main>
        <div class="flex items-center gap-2">
          <BaseButton
            :icon="mdiPlus"
            color="primary"
            label="New User"
            @click="handleShowNewUserModal"
          />
          <BaseButton
            v-if="selectedUsers.length"
            :icon="mdiDelete"
            color="danger"
            label="Delete"
            @click="deleteSelectedUsers"
          />
        </div>
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <BaseTable
          :columns="userColumns"
          :data="userData"
          :loading="userStore.isLoading"
          checkable
          @query-change="handleQueryChange"
          @selected="handleSelected"
          @edit="handleEditUser"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>

  <!-- New User Modal -->
  <div
    v-if="showNewUserModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[600px]">
      <h2 class="text-xl mb-4">Add User</h2>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Username</label>
          <input v-model="newUserForm.username" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Email</label>
          <input v-model="newUserForm.email" type="email" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Password</label>
          <input v-model="newUserForm.password" type="password" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">First Name</label>
          <input v-model="newUserForm.first_name" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Last Name</label>
          <input v-model="newUserForm.last_name" type="text" class="w-full border p-2 rounded" />
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeNewUserModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="saveNewUser">Save</button>
      </div>
    </div>
  </div>

  <!-- Edit User Modal -->
  <div
    v-if="showEditUserModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[600px]">
      <h2 class="text-xl mb-4">Edit User</h2>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Username</label>
          <input v-model="editUserForm.username" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Email</label>
          <input v-model="editUserForm.email" type="email" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">First Name</label>
          <input v-model="editUserForm.first_name" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block mb-1">Last Name</label>
          <input v-model="editUserForm.last_name" type="text" class="w-full border p-2 rounded" />
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-4">
        <button class="px-4 py-2 bg-gray-200 rounded" @click="closeEditUserModal">Cancel</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="updateUser">Update</button>
      </div>
    </div>
  </div>
</template>
