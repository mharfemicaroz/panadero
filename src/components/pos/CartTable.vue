<template>
  <div>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiTrashCan } from '@mdi/js'

const props = defineProps({
  cart: Array,
  discountAllItemsPercent: Number,
  discountEntireSale: Number,
  subTotalBeforeGlobalDiscount: Number,
  totalCartAmount: Number
})

const emit = defineEmits([
  'update:discountAllItemsPercent',
  'update:discountEntireSale',
  'openItemPriceModal',
  'openItemDiscountModal',
  'removeFromCart'
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

// Two-way bindings for discount fields
const localDiscountAllItemsPercent = computed({
  get: () => props.discountAllItemsPercent,
  set: (val) => emit('update:discountAllItemsPercent', Number(val))
})
const localDiscountEntireSale = computed({
  get: () => props.discountEntireSale,
  set: (val) => emit('update:discountEntireSale', Number(val))
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
