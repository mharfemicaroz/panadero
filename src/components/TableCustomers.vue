<script setup>
import { computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiEye, mdiTrashCan,mdiChartBar, mdiPencil, mdiPlus, mdiDotsHorizontal } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import PillTag from '@/components/PillTag.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import CardBox from '@/components/CardBox.vue'

defineProps({
  checkable: Boolean
})

const mainStore = useMainStore()

const items = computed(() => mainStore.customers)

const isModalActive = ref(false)

const isModalDangerActive = ref(false)

const perPage = ref(5)

const currentPage = ref(0)

const checkedRows = ref([])

const itemsPaginated = computed(() =>
  items.value.slice(perPage.value * currentPage.value, perPage.value * (currentPage.value + 1))
)

const numPages = computed(() => Math.ceil(items.value.length / perPage.value))

const currentPageHuman = computed(() => currentPage.value + 1)

const pagesList = computed(() => {
  const pagesList = []

  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i)
  }

  return pagesList
})

const remove = (arr, cb) => {
  const newArr = []

  arr.forEach((item) => {
    if (!cb(item)) {
      newArr.push(item)
    }
  })

  return newArr
}

const checked = (isChecked, itemslist) => {
  if (isChecked) {
    checkedRows.value.push(itemslist)
  } else {
    checkedRows.value = remove(checkedRows.value, (row) => row.id === itemslist.id)
  }
}

const getColor = (role) => {
  switch (role) {
    case 'Admin':
      return 'success'
    case 'Editor':
      return 'warning'
    case 'Viewer':
      return 'danger'
    default:
      return 'info'
  }
}
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="View Details">
    <p>Details about the selected username will go here.</p>
  </CardBoxModal>

  <CardBoxModal v-model="isModalDangerActive" title="Confirm Deletion" button="danger" has-cancel>
    <p>Are you sure you want to delete this record?</p>
  </CardBoxModal>
  <div>

   

    <!-- Tables Display -->

    <table>
  <thead>
    <tr>
      <th v-if="checkable"></th>
      <th>Name</th>
      <th>Email</th>
      <th>Phone Number</th>
      <th>Address</th>
      <th>Total Spent</th>
      <th>Total Points</th>
      <th>Total Balance</th>
      <th>Customer Created Date</th>
      <th>Customer Last Order Date</th>
      <th>Total Transaction</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="itemslist in itemsPaginated" :key="itemslist.name">
      <TableCheckboxCell v-if="checkable" @checked="checked($event, itemslist)" />
      <td data-label="Name">
        {{ itemslist.name }}
      </td>
      <td data-label="Email">
        {{ itemslist.email }}
      </td>
      <td data-label="Phone Number">
        {{ itemslist.phone_number }}
      </td>
      <td data-label="Address">
        {{ itemslist.address }}
      </td>
      <td data-label="Total Spent">
        {{ itemslist.total_spent }}
      </td>
      <td data-label="Total Points">
        {{ itemslist.total_points }}
      </td>
      <td data-label="Total Balance">
        {{ itemslist.total_balance }}
      </td>
      <td data-label="Customer Created Date">
        {{ itemslist.customer_created_date }}
      </td>
      <td data-label="Customer Last Order Date">
        {{ itemslist.customer_last_order_date }}
      </td>
      <td data-label="Total Transaction">
        {{ itemslist.total_transaction }}
      </td>
      <td>
        <BaseButtons type="justify-start lg:justify-end" no-wrap>
          <BaseButton color="" :icon="mdiPencil" small />
          <BaseButton color="" :icon="mdiChartBar" small :label="'View Ledger'" />
        </BaseButtons>
      </td>
    </tr>
  </tbody>
</table>

    <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
      <BaseLevel>
        <BaseButtons>
          <BaseButton v-for="page in pagesList" :key="page" :active="page === currentPage" :label="page + 1"
            :color="page === currentPage ? 'lightDark' : 'whiteDark'" small @click="currentPage = page" />
        </BaseButtons>
        <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
      </BaseLevel>
    </div>


  </div>

</template>
