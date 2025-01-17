<script setup>
import { reactive, computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiPrinterSettings, mdiMagnify } from '@mdi/js'
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
const selectAccount = [
  { id: 1, label: 'Sales Account' },
  { id: 1, label: 'Payroll' }

]
const selectType = [

  { id: 1, label: 'All' }, 
  { id: 1, label: 'Debit' }, 
  { id: 1, label: 'Credit' }


]

const selectCashier = [
  { id: 1, label: 'Administrator' },
  { id: 2, label: 'Lealyn Guineta' },
  { id: 3, label: 'Janice Pareja' },
  { id: 4, label: 'Regine Carmina' },
  { id: 5, label: 'Reyna Patiga' }

];

const dateRange = ref([null, null]);

const mainStore = useMainStore()
const items = computed(() => mainStore.balance_sheet);
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
      <div class="w-full md:w-1/3 lg:w-1/3">
        <FormField label="" class="w-full">
          <FormControl v-model="selectAccount[0]" :options="selectAccount" />
        </FormField>
      </div>
      <div class="w-full md:w-1/3 lg:w-1/3">
        <FormField label="" class="w-full">
          <FormControl v-model="selectType[0]" :options="selectType" />
        </FormField>
      </div>
      <div class="w-full  ">
        <FormField class="w-full">
          <DateRangePicker v-model="dateRange" />
          <BaseButton type="submit" color="info"   class="w-fit text-sm h-9" label="Submit" />

        </FormField>
      </div>
      <!-- <div class="flex gap-0  justify-start">
        <FormField>
          <FormControl v-model="text" type="tel" placeholder="Search Transaction #" :icon="mdiMagnify"/>
          <BaseButton type="submit" color=""  :icon="mdiPrinterSettings" class="bg-white  border-gray-300 w-fit text-sm h-9"  />
        </FormField>
      </div> -->
    </div>
    



  </div>

</template>
