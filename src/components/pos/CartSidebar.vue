<!-- src/components/CartSidebar.vue -->
<template>
  <div class="cart-sidebar bg-white shadow-lg p-4 border-l md:w-2/5 w-full md:sticky md:top-0">
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
    <h2 class="text-xl font-bold mb-2">Cart</h2>
    <div v-if="cart.length === 0" class="text-gray-500 text-center text-base">No items in cart</div>
    <div v-else>
      <!-- Added container for vertical scrolling -->
      <div class="max-h-64 overflow-y-auto" ref="cartContainer">
        <table class="w-full text-base">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Product</th>
              <th class="text-left py-2">Qty</th>
              <th class="text-left py-2">Price</th>
              <th class="text-left py-2">Disc.</th>
              <th class="text-left py-2">Total</th>
              <th class="text-center py-2">Act</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cart" :key="item.id" class="border-b">
              <td class="py-2">{{ item.name }}</td>
              <!-- Quantity Cell with Toggleable Stepper -->
              <td class="py-2">
                <div v-if="stepperToggle[index]" class="flex items-center space-x-2">
                  <button
                    @click="decrementQuantity(index)"
                    class="bg-red-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  >
                    –
                  </button>
                  <input
                    type="number"
                    v-model.number="item.quantity"
                    @input="validateQuantity(index, $event)"
                    class="w-16 text-center text-lg font-bold border rounded-lg p-1"
                    min="1"
                    step="1"
                  />
                  <button
                    @click="incrementQuantity(index)"
                    class="bg-green-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                  <button
                    @click="toggleStepper(index)"
                    class="bg-blue-500 w-16 h-8 rounded-lg flex items-center justify-center text-lg text-white"
                  >
                    Done
                  </button>
                </div>
                <div v-else class="flex items-center space-x-2">
                  <span class="text-lg">{{ item.quantity }}</span>
                  <button @click="toggleStepper(index)" class="text-lg text-blue-500 underline">
                    Edit
                  </button>
                </div>
              </td>
              <td class="py-2">
                <a
                  class="text-[#b51919] hover:underline cursor-pointer text-lg"
                  @click.stop="$emit('openItemPriceModal', index)"
                >
                  ₱{{ Number(item.price).toFixed(2) }}
                </a>
              </td>
              <td class="py-2">
                <a
                  class="text-[#b51919] hover:underline cursor-pointer text-lg"
                  @click.stop="$emit('openItemDiscountModal', index)"
                >
                  ₱{{ item.discount.toFixed(2) }}
                </a>
              </td>
              <td class="py-2 text-lg">
                ₱{{ ((item.price - item.discount) * item.quantity).toFixed(2) }}
              </td>
              <td class="py-2 text-center">
                <BaseIcon
                  @click="$emit('removeFromCart', index)"
                  class="hover:bg-red-700 bg-red-600 text-white rounded-lg cursor-pointer"
                  :path="mdiTrashCan"
                  size="18"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Global Discounts -->
      <div class="mt-4 text-lg">
        <p>
          <strong>Subtotal:</strong>
          ₱{{ subTotalBeforeGlobalDiscount.toFixed(2) }}
        </p>
        <p class="mt-2 flex items-center gap-2">
          <label for="discountAllItemsPercent" class="font-bold"> Discount All (%): </label>
          <input
            id="discountAllItemsPercent"
            v-model.number="localDiscountAllItemsPercent"
            type="number"
            min="0"
            max="100"
            class="w-16 p-2 border rounded text-lg"
          />
          %
        </p>
        <p class="mt-2 flex items-center gap-2">
          <label for="discountEntireSale" class="font-bold"> Sale Discount: </label>
          <input
            id="discountEntireSale"
            v-model.number="localDiscountEntireSale"
            type="number"
            min="0"
            class="w-16 p-2 border rounded text-lg"
          />
        </p>
        <div class="mt-4 text-2xl font-bold">Total: ₱{{ totalCartAmount.toFixed(2) }}</div>
      </div>
    </div>

    <!-- Payment Section with Enhanced UI -->
    <div class="mt-6">
      <h2 class="text-xl font-bold mb-3">Payment</h2>

      <!-- Payment Type Buttons (with horizontal scrolling) -->
      <div class="mb-4">
        <label class="block text-lg font-medium mb-2">Payment Type</label>
        <div class="flex gap-2 overflow-x-auto whitespace-nowrap">
          <button
            v-for="type in paymentTypes"
            :key="type"
            @click="localSelectedPaymentType = type"
            :class="[
              'py-2 px-4 border rounded-lg flex-1 text-center text-lg min-w-[100px]',
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

const cartContainer = ref(null)

watch(
  () => props.cart.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      nextTick(() => {
        if (cartContainer.value) {
          cartContainer.value.scrollTop = cartContainer.value.scrollHeight
        }
      })
    }
  }
)

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

function validateQuantity(index, event) {
  const item = props.cart[index]
  let value = Number(event.target.value)

  // Ensure the value is a positive integer
  if (value < 1) {
    item.quantity = 1
  } else {
    // Round to nearest integer
    item.quantity = Math.round(value)
  }
}
</script>

<style scoped>
/* You can further adjust these styles to fit your exact needs */
</style>
