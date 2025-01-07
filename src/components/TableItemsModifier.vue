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

const items = computed(() => mainStore.itemslist)

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
    <!-- Tab Navigation -->
    <div class="flex rounded-md overflow-hidden w-fit p-2">
      <a href="#items" 
        class="px-6 py-2 font-semibold ">
        Items
      </a>
      <a href="#items_modifier" 
        class="px-6 py-2 font-semibold rounded-md bg-blue-100 text-blue-700">
       Modifiers
      </a>
    </div>

 
   
      <div class="p-5">
        <div class="flex ">
          <div class="flex-1 w-50">
            <h1 class="text-xl font-semibold mt-2 mb-2 ms-2">Modifier</h1>

          </div>




          <div class="flex-1 flex w-50  justify-end justify-items-end">
            <div class="inline-flex rounded-md shadow-sm" role="group">
              <BaseButton color="red" :icon="mdiPlus" small @click="isModalDangerActive = false"
                :label="'Set Modifier'" />
              <BaseButton color="red" :icon="mdiDotsHorizontal" small  @click="isModalDangerActive = true" />
            </div>
          </div>
        </div>
        <hr>
        <br>
        <input type="text" id="first_name"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search Modifier" required />


          <div class=" w-100  flex justify-center justify-items-center">
            <div class="p-5 text-center m-5">
              <span class="text-xl font-bold"> No Modifiers Available</span> <br>
              <span class=""> There are no cards modifier created</span>
             </div>
          </div>
      </div>


    </div>

</template>
