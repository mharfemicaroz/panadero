<template>
  <div
    :class="`cart-sidebar bg-white shadow-lg p-4 border-l w-full md:sticky md:top-0 transition-all duration-300 ${
      showCartTable ? 'md:w-1/5' : 'md:w-2/5'
    }`"
  >
    <!-- Customer Section -->
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-2">Customer</h2>
      <div class="flex items-center space-x-2">
        <div class="relative w-full">
          <input
            v-model="localCustomerName"
            type="text"
            placeholder="Customer"
            class="w-full p-2 border rounded text-base"
            @input="$emit('filterCustomers')"
          />
          <ul
            v-if="filteredCustomers && filteredCustomers.length"
            class="absolute z-10 bg-white border rounded mt-1 w-full text-base max-h-40 overflow-y-auto"
          >
            <li
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="p-2 hover:bg-gray-100 cursor-pointer"
              @click="$emit('selectCustomer', customer)"
            >
              {{ customer.first_name }} {{ customer.last_name }}
            </li>
          </ul>
        </div>
        <button
          @click="$emit('openCustomerModal')"
          class="py-2 px-4 text-white rounded-lg hover:bg-red-700 bg-red-600"
        >
          <BaseIcon :path="mdiAccountPlus" size="18" />
        </button>
      </div>
    </div>

    <!-- Cart Table -->
    <div v-if="!showCartTable">
      <CartTable
        :cart="cart"
        :discountAllItemsPercent="discountAllItemsPercent"
        :discountEntireSale="discountEntireSale"
        :subTotalBeforeGlobalDiscount="subTotalBeforeGlobalDiscount"
        :totalCartAmount="totalCartAmount"
        @openItemPriceModal="$emit('openItemPriceModal', $event)"
        @openItemDiscountModal="$emit('openItemDiscountModal', $event)"
        @removeFromCart="$emit('removeFromCart', $event)"
        @update:discountAllItemsPercent="$emit('update:discountAllItemsPercent', $event)"
        @update:discountEntireSale="$emit('update:discountEntireSale', $event)"
      />
    </div>

    <!-- Payment Section with Enhanced UI -->
    <div class="mt-6">
      <h2 class="text-xl font-bold mb-3">Payment</h2>

      <!-- Payment Type Buttons (with horizontal scrolling) -->
      <div class="mb-4">
        <label class="block text-lg font-medium mb-2">Payment Type</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="type in paymentTypes"
            :key="type"
            @click="localSelectedPaymentType = type"
            :class="[
              'py-2 px-4 border rounded-lg text-center text-lg min-w-[100px]',
              localSelectedPaymentType === type
                ? 'bg-[#b51919] text-white border-[#b51919]'
                : 'bg-gray-200 text-gray-800 border-gray-300'
            ]"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Amount Due -->
      <div class="mb-4">
        <label class="block text-lg font-medium mb-2">Amount Due</label>
        <input
          type="number"
          class="p-2 border rounded w-full text-lg"
          :value="amountDue"
          min="0"
          step="0.01"
          readonly
        />
      </div>

      <!-- Conditional Payment Fields -->
      <div v-if="localSelectedPaymentType === 'Check'" class="mb-4">
        <label class="block text-lg font-medium mb-2">Check Number</label>
        <input
          type="text"
          class="w-full p-2 border rounded text-lg"
          v-model="localCheckNumber"
          placeholder="Enter check number"
        />
        <label class="block text-lg font-medium mb-2 mt-3">Bank Name</label>
        <input
          type="text"
          class="w-full p-2 border rounded text-lg"
          v-model="localBankName"
          placeholder="Enter bank name"
        />
      </div>
      <div v-else-if="localSelectedPaymentType === 'E-Wallet'" class="mb-4">
        <label class="block text-lg font-medium mb-2">E-Wallet Ref/Code</label>
        <input
          type="text"
          class="w-full p-2 border rounded text-lg"
          v-model="localWalletReference"
          placeholder="Enter e-wallet ref/code"
        />
      </div>
      <div
        v-else-if="
          localSelectedPaymentType === 'Credit Card' || localSelectedPaymentType === 'Debit Card'
        "
        class="mb-4"
      >
        <label class="block text-lg font-medium mb-2">Transaction/Auth Code</label>
        <input
          type="text"
          class="w-full p-2 border rounded text-lg"
          v-model="localCardAuthCode"
          placeholder="Enter auth code"
        />
      </div>
      <div v-else-if="localSelectedPaymentType === 'Bank'" class="mb-4">
        <label class="block text-lg font-medium mb-2">Bank Ref</label>
        <input
          type="text"
          class="w-full p-2 border rounded text-lg"
          v-model="localBankReference"
          placeholder="Enter bank ref"
        />
      </div>

      <button
        @click="$emit('checkout')"
        class="w-full mt-4 py-3 px-6 bg-red-600 text-white rounded-lg text-lg hover:bg-red-700 font-bold"
      >
        Checkout
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits, ref, watch, nextTick } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CartTable from '@/components/pos/CartTable.vue'
import { mdiAccountPlus, mdiDelete, mdiExitToApp, mdiTrashCan } from '@mdi/js'

const props = defineProps({
  cart: Array,
  customerName: String,
  filteredCustomers: Array,
  discountAllItemsPercent: Number,
  discountEntireSale: Number,
  totalCartAmount: Number,
  paymentTypes: Array,
  selectedPaymentType: String,
  amountDue: Number,
  checkNumber: String,
  bankName: String,
  walletReference: String,
  cardAuthCode: String,
  bankReference: String,
  subTotalBeforeGlobalDiscount: Number,
  showCartTable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:customerName',
  'update:discountAllItemsPercent',
  'update:discountEntireSale',
  'update:selectedPaymentType',
  'update:checkNumber',
  'update:bankName',
  'update:walletReference',
  'update:cardAuthCode',
  'update:bankReference',
  'filterCustomers',
  'selectCustomer',
  'openCustomerModal',
  'openItemPriceModal',
  'openItemDiscountModal',
  'removeFromCart',
  'checkout',
  'suspendSale',
  'cancelSale',
  'openSalesModal'
])

// Two-way bindings for customer and payment fields
const localCustomerName = computed({
  get: () => props.customerName,
  set: (val) => emit('update:customerName', val)
})

const localSelectedPaymentType = computed({
  get: () => props.selectedPaymentType,
  set: (val) => emit('update:selectedPaymentType', val)
})

const localCheckNumber = computed({
  get: () => props.checkNumber,
  set: (val) => emit('update:checkNumber', val)
})

const localBankName = computed({
  get: () => props.bankName,
  set: (val) => emit('update:bankName', val)
})

const localWalletReference = computed({
  get: () => props.walletReference,
  set: (val) => emit('update:walletReference', val)
})

const localCardAuthCode = computed({
  get: () => props.cardAuthCode,
  set: (val) => emit('update:cardAuthCode', val)
})

const localBankReference = computed({
  get: () => props.bankReference,
  set: (val) => emit('update:bankReference', val)
})
</script>
<style scoped>
.cart-sidebar {
  transition: width 0.3s ease-in-out;
}
</style>
