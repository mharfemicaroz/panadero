<!-- src/components/CartSidebar.vue -->
<template>
  <div
    class="cart-sidebar bg-white shadow-lg p-6 border-l md:w-1/3 w-full md:sticky md:top-0 h-screen overflow-y-auto"
  >
    <!-- Buttons -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        @click="toggleFullscreen"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        <BaseIcon v-if="!isFullscreen" :path="mdiFullscreen" size="16" />
        <BaseIcon v-else :path="mdiFullscreenExit" size="16" />
      </button>
      <button
        @click="$emit('openSalesModal')"
        class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        View Sales
      </button>
      <button
        v-if="cart.length > 0"
        @click="$emit('suspendSale')"
        class="p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Suspend Sale
      </button>
      <button
        v-if="cart.length > 0"
        @click="$emit('cancelSale')"
        class="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Cancel Sale
      </button>
    </div>
    <!-- Customer Section -->
    <div class="mb-6">
      <h2 class="text-xl font-bold mb-4">Customer</h2>
      <div class="flex items-start space-x-2">
        <div class="relative w-full">
          <input
            v-model="localCustomerName"
            type="text"
            placeholder="Customer Name"
            class="w-full p-2 border rounded"
            @input="$emit('filterCustomers')"
          />
          <ul
            v-if="filteredCustomers && filteredCustomers.length"
            class="absolute z-10 bg-white border rounded mt-1 w-full"
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
          class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
        >
          <BaseIcon :path="mdiAccountPlus" size="16" />
        </button>
      </div>
    </div>
    <!-- Cart Table -->
    <h2 class="text-xl font-bold mb-4">Cart</h2>
    <div v-if="cart.length === 0" class="text-gray-500 text-center">No items in cart</div>
    <div v-else>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2">Product</th>
            <th class="text-left py-2">Qty</th>
            <th class="text-left py-2">Price</th>
            <th class="text-left py-2">Discount</th>
            <th class="text-left py-2">Total</th>
            <th class="text-center py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in cart" :key="item.id" class="border-b">
            <td>{{ item.name }}</td>
            <!-- Quantity Cell with Toggleable Stepper -->
            <td>
              <div v-if="stepperToggle[index]" class="flex items-center space-x-1">
                <button
                  @click="decrementQuantity(index)"
                  class="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center"
                >
                  –
                </button>
                <div class="w-8 text-center">{{ item.quantity }}</div>
                <button
                  @click="incrementQuantity(index)"
                  class="bg-green-500 text-white w-6 h-6 rounded flex items-center justify-center"
                >
                  +
                </button>
                <button
                  @click="toggleStepper(index)"
                  class="bg-blue-500 text-white w-12 h-6 rounded flex items-center justify-center"
                >
                  Done
                </button>
              </div>
              <div v-else class="flex items-center space-x-1">
                <span>{{ item.quantity }}</span>
                <button @click="toggleStepper(index)" class="text-sm text-blue-500 underline">
                  Edit
                </button>
              </div>
            </td>
            <td>
              <a
                class="text-[#b51919] hover:underline cursor-pointer"
                @click.stop="$emit('openItemPriceModal', index)"
              >
                ₱{{ item.price.toFixed(2) }}
              </a>
            </td>
            <td>
              <a
                class="text-[#b51919] hover:underline cursor-pointer"
                @click.stop="$emit('openItemDiscountModal', index)"
              >
                ₱{{ item.discount.toFixed(2) }}
              </a>
            </td>
            <td>₱{{ ((item.price - item.discount) * item.quantity).toFixed(2) }}</td>
            <td class="text-center">
              <button
                @click="$emit('removeFromCart', index)"
                class="p-1 bg-[#b51919] text-white rounded"
              >
                ✘
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Global Discounts -->
      <div class="mt-4 text-sm">
        <p>
          <strong>Subtotal (Items & Per-Item Discounts):</strong>
          ₱{{ subTotalBeforeGlobalDiscount.toFixed(2) }}
        </p>
        <p class="mt-2">
          <label for="discountAllItemsPercent" class="font-bold">
            Discount All Items by Percent:
          </label>
          <input
            id="discountAllItemsPercent"
            v-model.number="localDiscountAllItemsPercent"
            type="number"
            min="0"
            max="100"
            class="w-16 p-1 border rounded ml-2"
          />%
        </p>
        <p class="mt-2">
          <label for="discountEntireSale" class="font-bold"> Discount Entire Sale: </label>
          <input
            id="discountEntireSale"
            v-model.number="localDiscountEntireSale"
            type="number"
            min="0"
            class="w-16 p-1 border rounded ml-2"
          />
        </p>
        <div class="mt-4 text-lg font-bold">Total: ₱{{ totalCartAmount.toFixed(2) }}</div>
      </div>
    </div>
    <!-- Payment Section -->
    <div class="mt-6">
      <h2 class="text-xl font-bold mb-4">Payment</h2>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Payment Type</label>
        <select v-model="localSelectedPaymentType" class="w-full p-2 border rounded">
          <option disabled value="">-- Select Payment Type --</option>
          <option v-for="type in paymentTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Amount Due</label>
        <input
          type="number"
          class="p-2 border rounded w-full"
          :value="amountDue"
          min="0"
          step="0.01"
          readonly
        />
      </div>
      <!-- Conditional Payment Fields -->
      <div v-if="localSelectedPaymentType === 'Check'" class="mb-4">
        <label class="block text-sm font-medium mb-1">Check Number</label>
        <input
          type="text"
          class="w-full p-2 border rounded"
          v-model="localCheckNumber"
          placeholder="Enter check number"
        />
        <label class="block text-sm font-medium mb-1 mt-2">Bank Name</label>
        <input
          type="text"
          class="w-full p-2 border rounded"
          v-model="localBankName"
          placeholder="Enter bank name"
        />
      </div>
      <div v-else-if="localSelectedPaymentType === 'E-Wallet'" class="mb-4">
        <label class="block text-sm font-medium mb-1"> E-Wallet Reference/Code </label>
        <input
          type="text"
          class="w-full p-2 border rounded"
          v-model="localWalletReference"
          placeholder="Enter e-wallet reference/code"
        />
      </div>
      <div
        v-else-if="
          localSelectedPaymentType === 'Credit Card' || localSelectedPaymentType === 'Debit Card'
        "
        class="mb-4"
      >
        <label class="block text-sm font-medium mb-1"> Transaction / Auth Code </label>
        <input
          type="text"
          class="w-full p-2 border rounded"
          v-model="localCardAuthCode"
          placeholder="Enter authorization code"
        />
      </div>
      <div v-else-if="localSelectedPaymentType === 'Bank'" class="mb-4">
        <label class="block text-sm font-medium mb-1"> Bank Transfer Reference </label>
        <input
          type="text"
          class="w-full p-2 border rounded"
          v-model="localBankReference"
          placeholder="Enter bank transaction ID"
        />
      </div>
      <button
        @click="$emit('checkout')"
        class="w-full mt-4 p-4 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
      >
        Checkout
      </button>
    </div>
  </div>
</template>

<script setup>
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiAccountPlus, mdiFullscreen, mdiFullscreenExit } from '@mdi/js'
import { computed, defineProps, defineEmits, ref } from 'vue'

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

// Two-way bindings for various fields
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

// ----- Quantity Stepper Functions -----
// We'll track whether the stepper is visible per row (keyed by index)
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
