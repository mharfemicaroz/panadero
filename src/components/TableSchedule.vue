<script setup>
import { reactive, computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiDotsVertical, mdiPlus, mdiBookmark, mdiDotsHorizontal, mdiCalendarBlank } from '@mdi/js'
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
const items = computed(() => mainStore.inspections);
const items2 = computed(() => mainStore.templates);
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




    <div class="">

      <div class="px-5">
        <div class="flex rounded-md bg-white rounded border border-gray-300 overflow-hidden w-fit ">
          <a href="#schedule" class="px-6 py-2 font-semibold rounded-md bg-blue-100 text-blue-700">
            My Schedules
          </a>
          <a href="#manage-schedules" class="px-6 py-2 font-semibold ">
            Manage Schedules </a>
          <a href="#miss-late-inpsections" class="px-6 py-2 font-semibold  ">
            Missed/Late Inspections
          </a>

        </div>
        <div class="flex gap-2 py-2  justify-start">

          <FormControl :icon="mdiMagnify" class="w-fit" v-model="text" type="tel" placeholder="Search" />
          <BaseButton :icon="mdiPlus" type="submit" color="info"
            class="w-fit bg-red-800 border-0 hover:bg-red-700 text-sm h-9" label="Add Filter" />
          <BaseButton :icon="mdiPlus" type="submit" color="info"
            class="w-fit bg-red-800 border-0 hover:bg-red-700 text-sm h-9" label="Schedule Inspection" />
        </div>
        <div class="text-center bg-white border border-gray-300 rounded p-5 my-2">
          <br>
          <PillTag class="border-0" :huge="true" :icon="mdiCalendarBlank" opacity="opacity-50" />
          <br>
          <span class="font-bold text-2xl">No scheduled inspections due in the next 7 days!</span>
          <br>
          <span class=" text-xm">You don't have any scheduled inspections.</span>
          <br><br><br>
        </div>

      </div>

    </div>

  </div>

</template>
