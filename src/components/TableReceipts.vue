<script setup>
import { reactive, computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiEye, mdiTrashCan, mdiChartBar, mdiPencil, mdiPlus, mdiDotsHorizontal } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import PillTag from '@/components/PillTag.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import CardBox from '@/components/CardBox.vue'

defineProps({
  checkable: Boolean
})
const selectOptions = [
  { id: 1, label: 'Panadero Matina Aplaya2 Branch' }

]
const dateRange = ref([null, null]);
const form = reactive({
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '',
  department: selectOptions[0],
  subject: '',
  question: ''
})
const mainStore = useMainStore()

const items = computed(() => mainStore.receipts)

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

    <div class="flex gap-2 py-2 px-2 justify-start">
      <FormField label="" class="w-72">
        <FormControl v-model="form.department" :options="selectOptions" />
      </FormField>
      <FormField class="w-96">
        <DateRangePicker v-model="dateRange" />
      </FormField>
      <div class="flex gap-0  px-2 justify-start">
        <FormField>
          <FormControl v-model="text" type="tel" placeholder="Search Transaction #" />
          <BaseButton type="submit" color="info" class="w-fit text-sm" label="Search" />
        </FormField>
      </div>
    </div>

    <!-- Tables Display -->

    <table>
      <thead>
        <tr>
          <th v-if="checkable"></th>
          <th>Transaction #</th>
          <th>Date</th>
          <th>Time</th>
          <th>Sales Invoice #</th>
          <th>Cashier</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="itemslist in itemsPaginated" :key="itemslist.transaction_number">
          <TableCheckboxCell v-if="checkable" @checked="checked($event, itemslist)" />
          <td data-label="Transaction #">
            {{ itemslist.transaction_number }}
          </td>
          <td data-label="Date">
            {{ itemslist.date }}
          </td>
          <td data-label="Time">
            {{ itemslist.time }}
          </td>
          <td data-label="Cashier">
            {{ itemslist.sales_invoice }}
          </td>
          <td data-label="Cashier">
            {{ itemslist.cashier }}
          </td>
          <td data-label="Amount">
            ₱{{ itemslist.amount.toFixed(2) }}
          </td>
         
          <td>
            <BaseButtons type="justify-start lg:justify-end" no-wrap>
              <BaseButton color="" :icon="mdiPencil" small class="" />
              <!-- <BaseButton color="" :icon="mdiChartBar" small :label="'View Ledger'" /> -->
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
