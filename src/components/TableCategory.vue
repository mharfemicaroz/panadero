<script setup>
import { computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiEye, mdiTrashCan, mdiPencil, mdiPlus, mdiDotsHorizontal } from '@mdi/js'
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

const items = computed(() => mainStore.category)

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
    <div class="flex rounded-md overflow-hidden w-fit p-2">
      <a href="#category" 
        class="px-6 py-2 font-semibold rounded-md bg-blue-100 text-blue-700">
        Category
      </a>
      <a href="#category_group" 
        class="px-6 py-2 font-semibold ">
        Category Group
      </a>
    </div>
   

    <!-- Tables Display -->

    <table>
      <thead>
        <tr>
          <th v-if="checkable" />
          <th>Name</th>
          <th>Category Group</th>



          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="itemslist in itemsPaginated" :key="itemslist.id">
          <TableCheckboxCell v-if="checkable" @checked="checked($event, itemslist)" />
          <td data-label="Name">
            {{ itemslist.name }}
          </td>
          <td data-label="Category Group" class="lg:w-32">
            {{ itemslist.category_group }}
          </td>

          <td class="">
            <BaseButtons type="justify-start lg:justify-end" no-wrap>
              <BaseButton color="" :icon="mdiPencil" small />

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
