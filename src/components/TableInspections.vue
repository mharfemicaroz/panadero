<script setup>
import { reactive, computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiDotsVertical, mdiPlus, mdiBookmark, mdiDotsHorizontal } from '@mdi/js'
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




    <div>
      <div class="flex gap-2  px-2 justify-start">

        <FormControl :icon="mdiMagnify" v-model="text" type="tel" placeholder="Search" />
        <BaseButton :icon="mdiPlus" type="submit" color="info"
          class="w-fit bg-red-800 border-0 hover:bg-red-700 text-sm h-9" label="Add Filter" />
      </div>
    </div>
    <div class="px-5">
      <h5 class="text-md font-bold py-2 ">Bookmarked Templates </h5>

      <table class="min-w-full border bg-white">
        <thead class="bg-slate-100 border border-t-0 border-l-0 border-r-0 border-gray-300">
          <tr>
            <th data-label="Inspection">Inspection</th>
            <th data-label="Date">Date</th>
            <th data-label="Report">Report</th>
            <th data-label="Doc Number">Doc Number</th>
            <th data-label="Score">Score</th>
            <th data-label="Conducted">Conducted</th>
            <th data-label="Completed">Completed</th>





            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="itemslist in itemsPaginated" :key="itemslist.transaction_number">
            <TableCheckboxCell v-if="checkable" @checked="checked($event, itemslist)" />
            <td data-label="Inspection">
              {{ itemslist.inspection }}
            </td>
            <td data-label="Date">
              {{ itemslist.date }}
            </td>
            <td data-label="Report">
              {{ itemslist.report }}
            </td>
            <td data-label="Doc Number">
              {{ itemslist.doc_number }}
            </td>
            <td data-label="Score">
              {{ itemslist.score }}
            </td>
            <td data-label="Conducted">
              {{ itemslist.conducted }}
            </td>
            <td data-label="Completed">
              <BaseButtons type="justify-start lg:justify-start" no-wrap>
                <BaseButton color="" class="border border-gray-300 bg-white text-red-800" small :label="itemslist.completed" />


              </BaseButtons>

            </td>


            <td class="before:hidden lg:w-1 whitespace-nowrap">
              <BaseButtons type="justify-start lg:justify-end" no-wrap>
                <BaseButton color=""  class="border border-white-300 bg-white" small :icon="mdiDotsVertical" />
               

              </BaseButtons>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>

</template>
