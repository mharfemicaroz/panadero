<script setup>
import { reactive, computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiMagnify, mdiExport, mdiEye, mdiTrashCan, mdiChartBar, mdiPencil, mdiPlus, mdiDotsHorizontal } from '@mdi/js'
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
import FormCheckRadioGroup from '@/components/FormCheckRadioGroup.vue'


const defaultModel = ref(true);

defineProps({
  checkable: Boolean
})
const selectBranch = [
  { id: 1, label: 'Matina Aplaya2' }

]
const selectEmployee = [
  { id: 1, label: 'Maricar Lacson' },
  { id: 2, label: 'John Mecarl Tiel' },
  { id: 3, label: 'Carmina Regine' },
  { id: 4, label: 'Ifergen Garcia' },
  { id: 5, label: 'Arnel Toribio' },
  { id: 6, label: 'Aive Bucabal Piam' },
  { id: 7, label: 'Patiga Reyna' },
  { id: 8, label: 'Lealyn Guiöeta' }
];


const selectCashier = [
  { id: 1, label: 'Administrator' },
  { id: 2, label: 'Lealyn Guineta' },
  { id: 3, label: 'Janice Pareja' },
  { id: 4, label: 'Regine Carmina' },
  { id: 5, label: 'Reyna Patiga' }

];

const dateRange = ref([null, null]);

const mainStore = useMainStore()
const items = computed(() => mainStore.attendance);
const items2 = computed(() => mainStore.category_sales_summary);
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

    <div class="flex flex-col md:flex-row md:flex-wrap gap-4 p-4">


      <div class="w-full  md:w-1/4 lg:w-1/3">
        <FormField class="w-full">
          <DateRangePicker v-model="dateRange" />
        </FormField>
      </div>
      <!--  <div class="w-full md:w-1/4 lg:w-1/6">
        <FormField label="" class="w-full">
          <FormControl v-model="selectEmployee[0]" :options="selectEmployee" />
        </FormField>
      </div>
      <div class="w-full md:w-1/4 lg:w-1/6">
        <FormField label="" class="w-full">
          <FormControl v-model="selectBranch[0]" :options="selectBranch" />
        </FormField>
      </div> -->

    </div>
    <div class=" overflow-x-auto border border-gray-300 bg-white rounded-md m-4 px-4 py-2">
      <!-- <h5 class="text-md font-bold py-2">Shifts Report</h5> -->

      <hr>
      <!-- Tables Display -->

      <table class="min-w-full">
        <thead class="bg-slate-100 border border-t-0 border-l-0 border-r-0 border-gray-300">
          <tr>
            <th data-label="Employee">Employee</th>
<th data-label="From">From</th>
<th data-label="To">To</th>




         
          </tr>
        </thead>

        <tbody>
          <tr v-for="itemslist in itemsPaginated" :key="itemslist.transaction_number">
            <TableCheckboxCell v-if="checkable" @checked="checked($event, itemslist)" />

            <td data-label="Employee">
  {{ itemslist.employee }}
</td>
<td data-label="From">
  {{ itemslist.from }}
</td>
<td data-label="To">
  {{ itemslist.to }}
</td>







          </tr>
        </tbody>
      </table>

      <hr>
      <!-- Pagination for Shifts Report -->
      <div class="p-3 lg:px-6 border-t bg-white border-gray-100 dark:border-slate-800">
        <BaseLevel>
          <BaseButtons>
            <BaseButton v-for="page in pagesListShifts" :key="page" :active="page === currentPageShifts"
              :label="page + 1" :color="page === currentPageShifts ? 'lightDark' : 'whiteDark'" small
              @click="currentPageShifts = page" />
          </BaseButtons>
          <small>Page {{ currentPageHumanShifts }} of {{ numPagesShifts }}</small>
        </BaseLevel>
      </div>
    </div>



  </div>

</template>
