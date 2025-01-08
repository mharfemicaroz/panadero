<script setup>
import { reactive, computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiCalendarBlank, mdiBullhorn, mdiBookmarkOutline, mdiMagnify, mdiHelpCircle, mdiPuzzle, mdiPlus, mdiDotsHorizontal } from '@mdi/js'
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
import Dropdown from '@/components/Dropdown.vue'
import CardBox from '@/components/CardBox.vue'

defineProps({
  checkable: Boolean
})
const selectCategory = [
  { id: 1, label: 'All Day' }

]
const selectBranch = [
  { id: 1, label: 'Panadero Matina Aplaya2 Branch' }

]
const selectCashier = [
  { id: 1, label: 'Administrator' },
  { id: 2, label: 'Lealyn Guineta' },
  { id: 3, label: 'Janice Pareja' },
  { id: 4, label: 'Regine Carmina' },
  { id: 5, label: 'Reyna Patiga' }
];

const selectOptions = [
  { id: 1, label: 'Panadero Matina Aplaya2 Branch' }

]
const dateRange = ref([null, null]);

const mainStore = useMainStore()
const items = computed(() => mainStore.progress);
const items2 = computed(() => mainStore.bookmarked);
const items3 = computed(() => mainStore.cash_balancing_summary);

const isModalActive = ref(false);
const isModalDangerActive = ref(false);

const perPage = ref(5);

const currentPageShifts = ref(0); // Separate currentPage for Shifts Report
const currentPageCategorySales = ref(0); // Separate currentPage for Category Sales Summary

const checkedRows = ref([]);

// Pagination for Shifts Report
const itemsPaginated = computed(() =>
  items.value.slice(perPage.value * currentPageShifts.value, perPage.value * (currentPageShifts.value + 1))
);

// Pagination for Category Sales Summary
const itemsPaginated2 = computed(() =>
  items2.value.slice(perPage.value * currentPageCategorySales.value, perPage.value * (currentPageCategorySales.value + 1))
);
const itemsPaginated3 = computed(() =>
  items3.value.slice(perPage.value * currentPageCategorySales.value, perPage.value * (currentPageCategorySales.value + 1))
);
// Pages List for Shifts Report
const numPagesShifts = computed(() => Math.ceil(items.value.length / perPage.value));
const pagesListShifts = computed(() => Array.from({ length: numPagesShifts.value }, (_, i) => i));


// Pages List for Category Sales Summary
const numPagesCategorySales = computed(() => Math.ceil(items2.value.length / perPage.value));
const pagesListCategorySales = computed(() => Array.from({ length: numPagesCategorySales.value }, (_, i) => i));


// Pages List for Category Sales Summary
const numPagesCashBalancing = computed(() => Math.ceil(items3.value.length / perPage.value));
const pagesListCashBalancing = computed(() => Array.from({ length: numPagesCashBalancing.value }, (_, i) => i));


// Current Page Human Text for Shifts Report
const currentPageHumanShifts = computed(() => currentPageShifts.value + 1);

// Current Page Human Text for Category Sales Summary
const currentPageHumanCategorySales = computed(() => currentPageCategorySales.value + 1);
const currentPageHumanCashBalancing = computed(() => pagesListCashBalancing.value + 1);

const checkable = ref(false); // Assuming you will toggle checkboxes somewhere

const checked = (event, item) => {
  // Handle row checking logic
  if (event) {
    checkedRows.value.push(item);
  } else {
    checkedRows.value = checkedRows.value.filter((row) => row !== item);
  }
};
const pillsSettingsModel = ref(['icon'])

const pillsOutline = computed(() => pillsSettingsModel.value.indexOf('outline') > -1)

const pillsHuge = computed(() => pillsSettingsModel.value.indexOf('huge') > -1)
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



    <div class="flex gap-2  px-2 justify-end">

      <FormControl :icon="mdiMagnify" v-model="text" type="tel" placeholder="Search" />
      <BaseButton :icon="mdiPlus" type="submit" color="info"
        class="w-fit bg-red-800 border-0 hover:bg-red-700 text-sm h-9" label="Create" />
    </div>
    <div class="flex flex-wrap justify-center gap-0 ">
      <div class=" p-4 w-full sm:w-1/2 md:w-1/3">
        <div class="border border-gray-300 bg-white rounded-md p-5   ">
          <div class="flex items-center">
            <span class="text-5xl font-bold w-full">0</span>
            <PillTag class="border-0" :huge="true" :icon="mdiBullhorn" opacity="opacity-50" />
          </div>
          <span class="text-md font-bold">Heads Up</span>
        </div>
      </div>

      <div class="p-4 w-full sm:w-1/2 md:w-1/3">
        <div class="border border-gray-300 bg-white rounded-md p-5   ">
          <div class="flex items-center">
            <span class="text-5xl font-bold w-full">0</span>
            <PillTag class="border-0" :huge="true" :icon="mdiPuzzle" opacity="opacity-50" />
          </div>
          <span class="text-md font-bold">Training</span>
        </div>
      </div>

      <div class=" p-4 w-full sm:w-1/2 md:w-1/3">
        <div class="border border-gray-300 bg-white rounded-md p-5   ">
          <div class="flex items-center">
            <span class="text-5xl font-bold w-full">0</span>
            <PillTag class="border-0" :huge="true" :icon="mdiHelpCircle" opacity="opacity-50" />
          </div>
          <span class="text-md font-bold">Issues</span>
        </div>
      </div>

    </div>


    <div class="">

      <h5 class="text-md font-bold py-2 px-5">In Progress </h5>
      <div class="flex flex-wrap justify-center gap-0 ">
        <div v-for="itemslist in itemsPaginated" :key="itemslist.category" class=" p-4 w-full sm:w-1/2 md:w-1/3">
          <div class="border border-gray-300 bg-white rounded-md p-5   ">
            <div class="flex">
              <div class="flex justify-start  w-full">
                <PillTag class="border-0 font-bold p-0  " :huge="false" :icon="mdiMagnify" opacity="opacity-50"
                  label="INSPECTION" />
              </div>
              <div class="flex justify-end  w-full">
                <PillTag class="border-0 font-bold text-end" :huge="false" opacity="opacity-50"
                  :label="itemslist.date" />
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-2xl font-bold w-full py-2 line-clamp-1">{{ itemslist.name }}</span>

            </div>
            <PillTag class="border-0 text-end text-xs" :huge="false" opacity="opacity-50"
              :label="itemslist.modified" />

          </div>
        </div>



      </div>
    </div>
    <div class="">

      <h5 class="text-md font-bold py-2 px-5">Bookmarked Templates </h5>
      <div class="flex flex-wrap justify-center gap-0 ">
        <div v-for="itemslist in itemsPaginated2" :key="itemslist.category" class=" p-4 w-full sm:w-1/2 md:w-1/3">
          <div class="border border-gray-300 bg-white rounded-md p-5   ">
            <div class="flex">
              <div class="flex justify-start  w-full">
                <PillTag class="border-0 font-bold p-0  " :huge="false" :icon="mdiBookmarkOutline" opacity="opacity-50"
                  label="TEMPLATE" />
              </div>

            </div>
            <div class="flex items-center">
              <span class="text-xl font-bold w-full py-2 line-clamp-1">{{ itemslist.name }}</span>

            </div>


          </div>
        </div>



      </div>
    </div>
    <div class="">
      <h5 class="text-md font-bold py-2 px-5 ">Agenda </h5>
      <div class="px-5">
        <div class="flex rounded-md bg-white rounded border border-gray-300 overflow-hidden w-fit ">
          <a href="#all" class="px-6 py-2 font-semibold rounded-md bg-blue-100 text-blue-700">
            All
          </a>
          <a href="#inspections" class="px-6 py-2 font-semibold ">
            Inspections </a>
          <a href="#actions" class="px-6 py-2 font-semibold  ">
            Actions
          </a>
          <a href="#issues" class="px-6 py-2 font-semibold  ">
            Issues
          </a>
          <a href="#training" class="px-6 py-2 font-semibold  ">
            Training
          </a>
        </div>
        <div class="text-center bg-white border border-gray-300 rounded p-5 my-2">
          <br>
          <PillTag class="border-0" :huge="true" :icon="mdiCalendarBlank" opacity="opacity-50" />
          <br>
          <span class="font-bold text-2xl">All Clear!</span>
          <br>
          <span class=" text-xm">Scheduled items and items with due dates that are <br>
            assigned to you will appear here.</span>
            <br><br><br>
        </div>

      </div>

    </div>

  </div>

</template>
