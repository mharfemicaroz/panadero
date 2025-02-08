<!-- src/components/CartSidebar.vue -->
<template>
  <div class="cart-sidebar bg-white shadow-lg p-4 border-l md:w-1/4 w-full md:sticky md:top-0">
    <!-- Buttons Row -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        @click="toggleFullscreen"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
      >
        <BaseIcon v-if="!isFullscreen" :path="mdiFullscreen" size="14" />
        <BaseIcon v-else :path="mdiFullscreenExit" size="14" />
      </button>
      <button
        @click="$emit('openSalesModal')"
        class="py-1 px-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sales
      </button>
      <button
        v-if="cart.length > 0"
        @click="$emit('suspendSale')"
        class="py-1 px-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Suspend
      </button>
      <button
        v-if="cart.length > 0"
        @click="$emit('cancelSale')"
        class="py-1 px-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Cancel
      </button>
    </div>

    <!-- Customer Section -->
    <div class="mb-4">
      <h2 class="text-lg font-bold mb-2">Customer</h2>
      <div class="flex items-center space-x-1">
        <div class="relative w-full">
          <input
            v-model="localCustomerName"
            type="text"
            placeholder="Customer"
            class="w-full p-1 border rounded text-sm"
            @input="$emit('filterCustomers')"
          />
          <ul
            v-if="filteredCustomers && filteredCustomers.length"
            class="absolute z-10 bg-white border rounded mt-1 w-full text-xs"
          >
            <li
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="p-1 hover:bg-gray-100 cursor-pointer"
              @click="$emit('selectCustomer', customer)"
            >
              {{ customer.first_name }} {{ customer.last_name }}
            </li>
          </ul>
        </div>
        <button
          @click="$emit('openCustomerModal')"
          class="p-1 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
        >
          <BaseIcon :path="mdiAccountPlus" size="14" />
        </button>
      </div>
    </div>

    <!-- Cart Table -->
    <h2 class="text-lg font-bold mb-2">Cart</h2>
    <div v-if="cart.length === 0" class="text-gray-500 text-center text-xs">No items in cart</div>
    <div v-else>
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b">
            <th class="text-left py-1">Product</th>
            <th class="text-left py-1">Qty</th>
            <th class="text-left py-1">Price</th>
            <th class="text-left py-1">Disc.</th>
            <th class="text-left py-1">Total</th>
            <th class="text-center py-1">Act</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in cart" :key="item.id" class="border-b">
            <td class="py-1">{{ item.name }}</td>
            <!-- Quantity Cell with Toggleable Stepper -->
            <td class="py-1">
              <div v-if="stepperToggle[index]" class="flex items-center space-x-1">
                <button
                  @click="decrementQuantity(index)"
                  class="bg-red-500 text-white w-5 h-5 rounded flex items-center justify-center text-xs"
                >
                  –
                </button>
                <div class="w-6 text-center text-xs">{{ item.quantity }}</div>
                <button
                  @click="incrementQuantity(index)"
                  class="bg-green-500 text-white w-5 h-5 rounded flex items-center justify-center text-xs"
                >
                  +
                </button>
                <button
                  @click="toggleStepper(index)"
                  class="bg-blue-500 w-10 h-5 rounded flex items-center justify-center text-xs"
                >
                  Done
                </button>
              </div>
              <div v-else class="flex items-center space-x-1">
                <span class="text-xs">{{ item.quantity }}</span>
                <button @click="toggleStepper(index)" class="text-xs text-blue-500 underline">
                  Edit
                </button>
              </div>
            </td>
            <td class="py-1">
              <a
                class="text-[#b51919] hover:underline cursor-pointer text-xs"
                @click.stop="$emit('openItemPriceModal', index)"
              >
                ₱{{ item.price.toFixed(2) }}
              </a>
            </td>
            <td class="py-1">
              <a
                class="text-[#b51919] hover:underline cursor-pointer text-xs"
                @click.stop="$emit('openItemDiscountModal', index)"
              >
                ₱{{ item.discount.toFixed(2) }}
              </a>
            </td>
            <td class="py-1 text-xs">
              ₱{{ ((item.price - item.discount) * item.quantity).toFixed(2) }}
            </td>
            <td class="py-1 text-center">
              <button
                @click="$emit('removeFromCart', index)"
                class="p-1 bg-[#b51919] text-white rounded text-xs"
              >
                ✘
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Global Discounts -->
      <div class="mt-2 text-xs">
        <p>
          <strong>Subtotal:</strong>
          ₱{{ subTotalBeforeGlobalDiscount.toFixed(2) }}
        </p>
        <p class="mt-1">
          <label for="discountAllItemsPercent" class="font-bold text-xs"> Discount All (%): </label>
          <input
            id="discountAllItemsPercent"
            v-model.number="localDiscountAllItemsPercent"
            type="number"
            min="0"
            max="100"
            class="w-12 p-1 border rounded ml-1 text-xs"
          />
          %
        </p>
        <p class="mt-1">
          <label for="discountEntireSale" class="font-bold text-xs"> Sale Discount: </label>
          <input
            id="discountEntireSale"
            v-model.number="localDiscountEntireSale"
            type="number"
            min="0"
            class="w-12 p-1 border rounded ml-1 text-xs"
          />
        </p>
        <div class="mt-2 text-base font-bold">Total: ₱{{ totalCartAmount.toFixed(2) }}</div>
      </div>
    </div>

    <!-- Payment Section with Enhanced UI -->
    <div class="mt-4">
      <h2 class="text-lg font-bold mb-2">Payment</h2>

      <!-- Payment Type Buttons -->
      <div class="mb-2">
        <label class="block text-xs font-medium mb-1">Payment Type</label>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="type in paymentTypes"
            :key="type"
            @click="localSelectedPaymentType = type"
            :class="[
              'p-2 border rounded flex-1 text-center text-xs',
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
      <div class="mb-2">
        <label class="block text-xs font-medium mb-1">Amount Due</label>
        <input
          type="number"
          class="p-1 border rounded w-full text-xs"
          :value="amountDue"
          min="0"
          step="0.01"
          readonly
        />
      </div>

      <!-- Conditional Payment Fields -->
      <div v-if="localSelectedPaymentType === 'Check'" class="mb-2">
        <label class="block text-xs font-medium mb-1">Check Number</label>
        <input
          type="text"
          class="w-full p-1 border rounded text-xs"
          v-model="localCheckNumber"
          placeholder="Enter check number"
        />
        <label class="block text-xs font-medium mb-1 mt-1">Bank Name</label>
        <input
          type="text"
          class="w-full p-1 border rounded text-xs"
          v-model="localBankName"
          placeholder="Enter bank name"
        />
      </div>
      <div v-else-if="localSelectedPaymentType === 'E-Wallet'" class="mb-2">
        <label class="block text-xs font-medium mb-1"> E-Wallet Ref/Code </label>
        <input
          type="text"
          class="w-full p-1 border rounded text-xs"
          v-model="localWalletReference"
          placeholder="Enter e-wallet ref/code"
        />
      </div>
      <div
        v-else-if="
          localSelectedPaymentType === 'Credit Card' || localSelectedPaymentType === 'Debit Card'
        "
        class="mb-2"
      >
        <label class="block text-xs font-medium mb-1"> Transaction/Auth Code </label>
        <input
          type="text"
          class="w-full p-1 border rounded text-xs"
          v-model="localCardAuthCode"
          placeholder="Enter auth code"
        />
      </div>
      <div v-else-if="localSelectedPaymentType === 'Bank'" class="mb-2">
        <label class="block text-xs font-medium mb-1"> Bank Ref </label>
        <input
          type="text"
          class="w-full p-1 border rounded text-xs"
          v-model="localBankReference"
          placeholder="Enter bank ref"
        />
      </div>

      <button
        @click="$emit('checkout')"
        class="w-full mt-2 p-2 bg-[#b51919] text-white rounded text-xs hover:bg-[#a31818]"
      >
        Checkout
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits, ref } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiAccountPlus, mdiFullscreen, mdiFullscreenExit } from '@mdi/js'

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
  subTotalBeforeGlobalDiscount: Number
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

// Two-way bindings for customer and discount fields
const localCustomerName = computed({
  get: () => props.customerName,
  set: (val) => emit('update:customerName', val)
})
const localDiscountAllItemsPercent = computed({
  get: () => props.discountAllItemsPercent,
  set: (val) => emit('update:discountAllItemsPercent', Number(val))
})
const localDiscountEntireSale = computed({
  get: () => props.discountEntireSale,
  set: (val) => emit('update:discountEntireSale', Number(val))
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

// ----- Fullscreen Functionality -----
const isFullscreen = ref(false)
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement
      .requestFullscreen()
      .then(() => {
        isFullscreen.value = true
      })
      .catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err)
      })
  } else {
    document
      .exitFullscreen()
      .then(() => {
        isFullscreen.value = false
      })
      .catch((err) => {
        console.error('Error attempting to exit full-screen mode:', err)
      })
  }
}
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

// ----- Quantity Stepper Functionality -----
const stepperToggle = ref({})

function toggleStepper(index) {
  stepperToggle.value[index] = !stepperToggle.value[index]
}

function incrementQuantity(index) {
  const item = props.cart[index]
  item.quantity = Number(item.quantity) + 1
}

function decrementQuantity(index) {
  const item = props.cart[index]
  if (item.quantity > 1) {
    item.quantity = Number(item.quantity) - 1
  }
}
</script>

<style scoped>
/* You can further adjust these styles to fit your exact needs */
</style>
