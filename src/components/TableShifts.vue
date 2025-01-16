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
const items = computed(() => mainStore.shifts_report);
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
      <div class="w-full md:w-1/4 lg:w-1/6">
        <FormField label="" class="w-full">
          <FormControl v-model="selectCategory[0]" :options="selectCategory" />
        </FormField>
      </div>
      <div class="w-full md:w-1/4 lg:w-1/4">
        <FormField label="" class="w-full">
          <FormControl v-model="selectOptions[0]" :options="selectOptions" />
        </FormField>
      </div>
      <div class="w-full  md:w-1/4 lg:w-1/3">
        <FormField class="w-full">
          <DateRangePicker v-model="dateRange" />
        </FormField>
      </div>
      <div class="w-full md:w-1/4 lg:w-1/5">
        <FormField label="" class="w-full">
          <FormControl v-model="selectBranch[0]" :options="selectBranch" />
        </FormField>
      </div>
      <div class="w-full md:w-1/4 lg:w-1/5">
        <FormField label="" class="w-full">
          <FormControl v-model="selectCashier[0]" :options="selectCashier" />
        </FormField>
      </div>

      <Dropdown :icon="mdiEye" :controlIconH="'h-12'"
        class="w-full md:w-1/4 lg:w-1/5 border bg-white border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <!-- Trigger button passed via named slot -->
        <template #trigger>
          <button type="button">
            ▼&emsp;More Options
          </button>
        </template>

        <!-- Dropdown contents (options) passed as default slot -->
        <div class="py-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export Shift Report</div>
          <div class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export Category Sales Summary</div>
          <div class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export Cash Balancing</div>
        </div>
      </Dropdown>
    </div>
    <div class="border border-gray-300 bg-white rounded-md m-4 px-4 py-2">
      <!-- <h5 class="text-md font-bold py-2">Shifts Report</h5> -->

      <hr>
      <!-- Tables Display -->

      <table>
        <thead class="bg-slate-100 border border-t-0 border-l-0 border-r-0 border-gray-300">
          <tr>
            <th v-if="checkable"></th>
            <th>Cashier</th>
            <th>Branch</th>
            <th>Start Shift</th>
            <th>End Shift</th>
            <th>Expected Cash Amount</th>
            <th>Actual Cash Amount</th>
            <th>Difference Amount</th>
            <th></th>
          </tr>
        </thead>
        
        <tbody>
          <tr v-for="itemslist in itemsPaginated" :key="itemslist.transaction_number">
            <TableCheckboxCell v-if="checkable" @checked="checked($event, itemslist)" />
            <td data-label="Cashier">
              {{ itemslist.cashier }}
            </td>
            <td data-label="Branch">
              {{ itemslist.branch }}
            </td>
            <td data-label="Start Shift">
              {{ itemslist.start_shift }}
            </td>
            <td data-label="End Shift">
              {{ itemslist.end_shift }}
            </td>
            <td data-label="Expected Cash Amount">
              ₱{{ itemslist.expected_cash_amount.toFixed(2) }}
            </td>
            <td data-label="Actual Cash Amount">
              ₱{{ itemslist.actual_cash_amount.toFixed(2) }}
            </td>
            <td data-label="Difference Amount">
              ₱{{ itemslist.difference_amount.toFixed(2) }}
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

    <div class="border border-gray-300 bg-white rounded-md m-4 px-4 py-2">
      <h5 class="text-md font-bold py-2">Category Sales Summary</h5>

      <hr>
      <!-- Tables Display -->

      <table>
        <thead class="bg-slate-100 border border-t-0 border-l-0 border-r-0 border-gray-300">
          <tr>
            <th v-if="checkable"></th>
            <th>Created At</th>
            <th>Category</th>
            <th>Sales Quantity</th>
            <th>Refunded Quantity</th>
            <th>Total Quantity</th>
            <th>Sold</th>
            <th>Gross Sales</th>
            <th>Dining Option Fee</th>
            <th>Item Discounts</th>
            <th>Receipt Discounts</th>
            <th>Net Sales</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="itemslist in itemsPaginated2" :key="itemslist.category">
            <TableCheckboxCell v-if="checkable" @checked="checked($event, itemslist)" />
            <td data-label="Created At">
              {{ itemslist.created_at }}
            </td>
            <td data-label="Category">
              {{ itemslist.category }}
            </td>
            <td data-label="Sales Quantity">
              {{ itemslist.sales_quantity }}
            </td>
            <td data-label="Refunded Quantity">
              {{ itemslist.refunded_quantity }}
            </td>
            <td data-label="Total Quantity">
              {{ itemslist.total_quantity }}
            </td>
            <td data-label="Sold">
              ₱{{ itemslist.sold.toFixed(2) }}
            </td>
            <td data-label="Gross Sales">
              ₱{{ itemslist.gross_sales.toFixed(2) }}
            </td>
            <td data-label="Dining Option Fee">
              ₱{{ itemslist.dining_option_fee.toFixed(2) }}
            </td>
            <td data-label="Item Discounts">
              ₱{{ itemslist.item_discounts.toFixed(2) }}
            </td>
            <td data-label="Receipt Discounts">
              ₱{{ itemslist.receipt_discounts.toFixed(2) }}
            </td>
            <td data-label="Net Sales">
              ₱{{ itemslist.net_sales.toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>

      <hr>
      <!-- Pagination for Category Sales Summary -->
      <div class="p-3 lg:px-6 border-t  border-gray-100 dark:border-slate-800">
        <BaseLevel>
          <BaseButtons>
            <BaseButton v-for="page in pagesListCategorySales" :key="page" :active="page === currentPageCategorySales"
              :label="page + 1" :color="page === currentPageCategorySales ? 'lightDark' : 'whiteDark'" small
              @click="currentPageCategorySales = page" />
          </BaseButtons>
          <small>Page {{ currentPageHumanCategorySales }} of {{ numPagesCategorySales }}</small>
        </BaseLevel>
      </div>
    </div>
    <div class="border border-gray-300 bg-white rounded-md m-4 px-4 py-2">
      <h5 class="text-md font-bold py-2">Cash Balancing Summary</h5>

      <hr>
      <!-- Tables Display -->

      <table>
        <thead class="bg-slate-100 border border-t-0 border-l-0 border-r-0 border-gray-300">
          <tr>
            <th v-if="checkable"></th>
            <th>Cashier</th>
            <th>Branch</th>
            <th>Created At</th>
            <th>Type</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="itemslist in itemsPaginated3" :key="itemslist.category">
            <TableCheckboxCell v-if="checkable" @checked="checked($event, itemslist)" />
            <td data-label="Cashier">
              {{ itemslist.cashier }}
            </td>
            <td data-label="Branch">
              {{ itemslist.branch }}
            </td>
            <td data-label="Created At">
              {{ itemslist.created_at }}
            </td>
            <td data-label="Type">
              {{ itemslist.type }}
            </td>
            <td data-label="Comment">
              {{ itemslist.comment }}
            </td>
          </tr>
        </tbody>
      </table>

      <hr>
      <!-- Pagination for Category Sales Summary -->
      <div class="p-3 lg:px-6 border-t  border-gray-100 dark:border-slate-800">
        <BaseLevel>
          <BaseButtons>
            <BaseButton v-for="page in pagesListCashBalancing" :key="page" :active="page === currentPageCashBalancing"
              :label="page + 1" :color="page === currentPageCashBalancing ? 'lightDark' : 'whiteDark'" small
              @click="currentPageCashBalancing = page" />
          </BaseButtons>
          <small>Page {{ currentPageHumanCashBalancing }} of {{ numPagesCashBalancing }}</small>
        </BaseLevel>
      </div>
    </div>

  </div>

</template>
