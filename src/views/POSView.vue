<template>
  <!-- Outer container: stack columns on mobile, side-by-side on md+ -->
  <div class="bg-[#f8f8f8] min-h-screen flex flex-col md:flex-row p-4 md:p-8">
    <!-- MAIN CONTENT -->
    <div class="container mx-auto py-8 flex-1">
      <!-- BREADCRUMB NAVIGATION -->
      <div class="mb-6 flex flex-wrap items-center gap-2">
        <span class="text-[#b51919] cursor-pointer hover:underline" @click="resetCategories">
          Home
        </span>
        <span v-if="breadcrumbs.length" class="text-gray-500">/</span>
        <span
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          @click="navigateToBreadcrumb(index)"
          class="text-[#b51919] cursor-pointer hover:underline"
        >
          {{ crumb }}
        </span>
      </div>

      <!-- BACK BUTTON IF INSIDE A CATEGORY -->
      <div v-if="currentCategory" class="mb-4">
        <h2
          class="text-lg font-bold text-[#b51919] cursor-pointer hover:underline flex items-center gap-2"
          @click="goBack"
        >
          ← Back to Categories
        </h2>
      </div>

      <!-- PAGE TITLE -->
      <h1 class="text-2xl font-bold mb-4">
        {{ currentCategory ? currentCategory : 'All Categories' }}
      </h1>

      <!-- SEARCH INPUT -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search categories or products..."
          class="w-full p-2 border rounded"
        />
      </div>

      <!-- IF EXACTLY ONE GLOBAL PARTIAL MATCH (AND NO CATEGORY/SUBCATEGORY NAME MATCH): SHOW THAT SINGLE PRODUCT -->
      <div v-if="singleGlobalSingleMatch" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg flex flex-col items-center"
          :class="{ 'bg-red-100': isInCart(singleGlobalSingleMatch) }"
          @click="toggleProductSelection(singleGlobalSingleMatch)"
        >
          <img
            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(
              singleGlobalSingleMatch.name
            )}`"
            alt="Product Image"
            class="w-16 h-16 rounded-full mb-2"
          />
          <h3 class="font-bold">{{ singleGlobalSingleMatch.name }}</h3>
          <p class="text-sm text-gray-600">₱{{ singleGlobalSingleMatch.price.toFixed(2) }}</p>
        </div>
      </div>

      <!-- OTHERWISE, SHOW NORMAL CATEGORY/SUBCATEGORY/PRODUCT FLOW -->
      <transition-group v-else name="fade" tag="div" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- SUBCATEGORIES (if current category selected) -->
        <div
          v-if="visibleSubcategories.length"
          v-for="subcategory in visibleSubcategories"
          :key="subcategory.name"
          class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg text-center"
          @click="selectCategory(subcategory)"
        >
          <h2 class="text-lg font-bold">{{ subcategory.name }}</h2>
        </div>

        <!-- PRODUCTS in the current category/subcategories -->
        <div
          v-if="filteredProducts.length"
          v-for="product in filteredProducts"
          :key="product.id"
          class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg flex flex-col items-center"
          :class="{ 'bg-red-100': isInCart(product) }"
          @click="toggleProductSelection(product)"
        >
          <img
            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}`"
            alt="Product Image"
            class="w-16 h-16 rounded-full mb-2"
          />
          <h3 class="font-bold">{{ product.name }}</h3>
          <p class="text-sm text-gray-600">₱{{ product.price.toFixed(2) }}</p>
        </div>

        <!-- TOP-LEVEL CATEGORIES (if no category selected) -->
        <div
          v-if="!currentCategory"
          v-for="category in filteredCategories"
          :key="category.name"
          class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg text-center"
          @click="selectCategory(category)"
        >
          <h2 class="text-lg font-bold">{{ category.name }}</h2>
        </div>

        <!-- NO RESULTS -->
        <div
          v-if="
            searchQuery &&
            !filteredCategories.length &&
            !filteredProducts.length &&
            !visibleSubcategories.length
          "
          class="col-span-full text-center text-gray-500"
        >
          No results found for "{{ searchQuery }}"
        </div>
      </transition-group>
    </div>

    <!-- CART SIDEBAR -->
    <div
      class="bg-white shadow-lg p-6 border-l md:w-1/3 w-full md:sticky md:top-0 h-screen overflow-y-auto"
    >
      <!-- Buttons: View Sales, Suspend Sale, Cancel Sale -->
      <div class="mb-6 flex flex-wrap gap-2">
        <!-- VIEW SALES (always visible) -->
        <button
          @click="openSalesModal"
          class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Sales
        </button>

        <!-- SUSPEND SALE (only if cart not empty) -->
        <button
          v-if="cart.length > 0"
          @click="suspendSale"
          class="p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Suspend Sale
        </button>

        <!-- CANCEL SALE (only if cart not empty) -->
        <button
          v-if="cart.length > 0"
          @click="cancelSale"
          class="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel Sale
        </button>
      </div>

      <!-- Customer Section -->
      <div class="mb-6">
        <h2 class="text-xl font-bold mb-4">Customer</h2>

        <div class="flex items-start space-x-2">
          <!-- Input and dropdown -->
          <div class="relative w-full">
            <input
              v-model="customerName"
              type="text"
              placeholder="Customer Name"
              class="w-full p-2 border rounded"
              @input="filterCustomers"
            />
            <ul
              v-if="filteredCustomers.length"
              class="absolute z-10 bg-white border rounded mt-1 w-full"
            >
              <li
                v-for="customer in filteredCustomers"
                :key="customer.id"
                class="p-2 hover:bg-gray-100 cursor-pointer"
                @click="selectCustomer(customer)"
              >
                {{ customer.first_name }} {{ customer.last_name }}
              </li>
            </ul>
          </div>

          <!-- Button with icon -->
          <button
            @click="openCustomerModal"
            class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
          >
            <BaseIcon :path="mdiAccountPlus" size="24" />
          </button>
        </div>
      </div>

      <!-- CART -->
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
              <!-- Center-align the header -->
              <th class="text-center py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cart" :key="item.id" class="border-b">
              <td>{{ item.name }}</td>
              <td>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="w-12 p-1 border rounded"
                />
              </td>
              <!-- Editable Price -->
              <td>
                <a
                  class="text-[#b51919] hover:underline cursor-pointer"
                  @click.stop="openItemPriceModal(index)"
                >
                  ₱{{ item.price.toFixed(2) }}
                </a>
              </td>
              <!-- Editable Discount -->
              <td>
                <a
                  class="text-[#b51919] hover:underline cursor-pointer"
                  @click.stop="openItemDiscountModal(index)"
                >
                  ₱{{ item.discount.toFixed(2) }}
                </a>
              </td>
              <!-- Line total (ignoring global discounts) -->
              <td>₱{{ ((item.price - item.discount) * item.quantity).toFixed(2) }}</td>
              <!-- Center-align the cell content -->
              <td class="text-center">
                <button @click="removeFromCart(index)" class="p-1 bg-[#b51919] text-white rounded">
                  ✘
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Global Discounts Section -->
        <div class="mt-4 text-sm">
          <!-- Subtotal Before Global Discounts -->
          <p>
            <strong>Subtotal (Items & Per-Item Discounts):</strong>
            ₱{{ subTotalBeforeGlobalDiscount.toFixed(2) }}
          </p>

          <!-- Discount All Items by Percent -->
          <p class="mt-2">
            <label for="discountAllItemsPercent" class="font-bold"
              >Discount All Items by Percent:</label
            >
            <input
              id="discountAllItemsPercent"
              v-model.number="discountAllItemsPercent"
              type="number"
              min="0"
              max="100"
              class="w-16 p-1 border rounded ml-2"
            />%
          </p>

          <!-- Discount Entire Sale -->
          <p class="mt-2">
            <label for="discountEntireSale" class="font-bold">Discount Entire Sale:</label>
            <input
              id="discountEntireSale"
              v-model.number="discountEntireSale"
              type="number"
              min="0"
              class="w-16 p-1 border rounded ml-2"
            />
          </p>

          <!-- Final Total -->
          <div class="mt-4 text-lg font-bold">Total: ₱{{ totalCartAmount.toFixed(2) }}</div>
        </div>
      </div>

      <!-- PAYMENT SECTION -->
      <div class="mt-6">
        <h2 class="text-xl font-bold mb-4">Payment</h2>

        <!-- Payment Type -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Payment Type</label>
          <select v-model="selectedPaymentType" class="w-full p-2 border rounded">
            <option disabled value="">-- Select Payment Type --</option>
            <option v-for="type in paymentTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <!-- Amount Due (automatically linked to totalCartAmount) -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Amount Due</label>
          <input
            type="number"
            class="p-2 border rounded w-full"
            :value="amountDue"
            min="0"
            step="0.01"
          />
        </div>

        <!-- Conditional Fields Depending on Payment Type -->
        <div v-if="selectedPaymentType === 'Check'" class="mb-4">
          <label class="block text-sm font-medium mb-1">Check Number</label>
          <input
            type="text"
            class="w-full p-2 border rounded"
            v-model="checkNumber"
            placeholder="Enter check number"
          />
          <label class="block text-sm font-medium mb-1 mt-2">Bank Name</label>
          <input
            type="text"
            class="w-full p-2 border rounded"
            v-model="bankName"
            placeholder="Enter bank name"
          />
        </div>

        <div v-else-if="selectedPaymentType === 'E-Wallet'" class="mb-4">
          <label class="block text-sm font-medium mb-1">E-Wallet Reference/Code</label>
          <input
            type="text"
            class="w-full p-2 border rounded"
            v-model="walletReference"
            placeholder="Enter e-wallet reference/code"
          />
        </div>

        <div
          v-else-if="selectedPaymentType === 'Credit Card' || selectedPaymentType === 'Debit Card'"
          class="mb-4"
        >
          <label class="block text-sm font-medium mb-1">Transaction / Auth Code</label>
          <input
            type="text"
            class="w-full p-2 border rounded"
            v-model="cardAuthCode"
            placeholder="Enter authorization code"
          />
        </div>

        <div v-else-if="selectedPaymentType === 'Bank'" class="mb-4">
          <label class="block text-sm font-medium mb-1">Bank Transfer Reference</label>
          <input
            type="text"
            class="w-full p-2 border rounded"
            v-model="bankReference"
            placeholder="Enter bank transaction ID"
          />
        </div>

        <!-- Checkout Button -->
        <button
          @click="checkout"
          class="w-full mt-4 p-4 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
        >
          Checkout
        </button>
      </div>
    </div>

    <!-- CUSTOMER MODAL -->
    <div
      v-if="isCustomerModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 rounded-lg md:w-1/3 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Add Customer</h2>
        <form @submit.prevent="saveCustomer">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Name</label>
            <input
              v-model="newCustomer.name"
              type="text"
              placeholder="Customer Name"
              class="w-full p-2 border rounded"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              v-model="newCustomer.email"
              type="email"
              placeholder="Customer Email"
              class="w-full p-2 border rounded"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Phone</label>
            <input
              v-model="newCustomer.phone"
              type="text"
              placeholder="Customer Phone"
              class="w-full p-2 border rounded"
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="closeCustomerModal"
              class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button type="submit" class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ITEM DISCOUNT MODAL -->
    <div
      v-if="isItemDiscountModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 rounded-lg md:w-1/3 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Edit Discount</h2>
        <div class="mb-4 flex items-center gap-2">
          <label class="block text-sm font-medium">Discount Amount (₱):</label>
          <input
            v-model.number="itemDiscountModalValue"
            type="number"
            min="0"
            step="0.01"
            class="p-2 border rounded flex-1"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="closeItemDiscountModal"
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ✘
          </button>
          <button
            type="button"
            @click="saveItemDiscount"
            class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
          >
            ✓
          </button>
        </div>
      </div>
    </div>

    <!-- ITEM PRICE MODAL -->
    <div
      v-if="isItemPriceModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 rounded-lg md:w-1/3 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Edit Price</h2>
        <div class="mb-4 flex items-center gap-2">
          <label class="block text-sm font-medium">New Price (₱):</label>
          <input
            v-model.number="itemPriceModalValue"
            type="number"
            min="0"
            step="0.01"
            class="p-2 border rounded flex-1"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="closeItemPriceModal"
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ✘
          </button>
          <button
            type="button"
            @click="saveItemPrice"
            class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
          >
            ✓
          </button>
        </div>
      </div>
    </div>

    <!-- SALES MODAL -->
    <div
      v-if="isSalesModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 rounded-lg md:w-2/3 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div class="flex flex-wrap md:flex-nowrap justify-between items-center mb-4">
          <h2 class="text-xl font-bold">All Sales</h2>
          <button
            type="button"
            @click="closeSalesModal"
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <input
            v-model="salesSearchQuery"
            type="text"
            placeholder="Search by ID, Customer Name, etc."
            class="p-2 border rounded flex-1"
          />
          <div class="flex items-center gap-1">
            <label class="text-sm">From:</label>
            <input v-model="salesFromDate" type="date" class="p-1 border rounded" />
          </div>
          <div class="flex items-center gap-1">
            <label class="text-sm">To:</label>
            <input v-model="salesToDate" type="date" class="p-1 border rounded" />
          </div>
        </div>

        <table class="table-auto w-full text-sm border-collapse">
          <thead>
            <tr class="border-b">
              <th class="p-2 text-left">ID</th>
              <th class="p-2 text-left">Date</th>
              <th class="p-2 text-left">Customer</th>
              <th class="p-2 text-left">Status</th>
              <th class="p-2 text-right">Total</th>
              <th class="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id" class="border-b">
              <td class="p-2">{{ sale.id }}</td>
              <td class="p-2">{{ formatDate(sale.created_at) }}</td>
              <td class="p-2">{{ sale.customer_name || 'N/A' }}</td>
              <td class="p-2">{{ sale.status }}</td>
              <td class="p-2 text-right">₱{{ (Number(sale.total_amount) || 0).toFixed(2) }}</td>
              <td class="p-2">
                <div class="flex gap-2">
                  <button
                    v-if="sale.status === 'suspended'"
                    @click="unsuspendSale(sale)"
                    class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Unsuspend
                  </button>
                  <button
                    v-if="sale.status === 'suspended' || sale.status === 'completed'"
                    @click="voidSale(sale)"
                    class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Void
                  </button>
                  <button
                    @click="printExistingSale(sale)"
                    class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Print
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="flex flex-wrap justify-between items-center mt-4">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- RECEIPT MODAL -->
    <div
      v-if="isReceiptModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 rounded-lg md:w-1/3 w-full max-w-md" id="receiptContainer">
        <h2 class="text-xl font-bold mb-4">Transaction Receipt</h2>

        <!-- Transaction ID Display -->
        <p><strong>Transaction ID:</strong> {{ transactionId }}</p>

        <!-- Barcode Element -->
        <div class="my-4 text-center">
          <svg id="barcodeElement"></svg>
        </div>

        <!-- Purchase Summary -->
        <div class="text-sm mb-4">
          <p><strong>Customer:</strong> {{ receiptData.customerName || 'N/A' }}</p>
          <p><strong>Payment Type:</strong> {{ receiptData.paymentType }}</p>
          <p><strong>Amount Due:</strong> ₱{{ receiptData.total }}</p>
          <p><strong>Status:</strong> {{ receiptData.status }}</p>
        </div>

        <div v-if="receiptData.items && receiptData.items.length" class="font-mono text-xs mb-4">
          <!-- Header row -->
          <div class="flex border-b pb-1">
            <div class="w-40">Item</div>
            <div class="w-16 text-right">Qty</div>
            <div class="w-24 text-right">Price</div>
            <div class="w-24 text-right">Disc</div>
            <div class="w-24 text-right">Total</div>
          </div>
          <!-- Cart items -->
          <div v-for="item in receiptData.items" :key="item.id" class="flex">
            <div class="w-40 truncate">
              {{ item.item?.name ?? item.name }}
            </div>
            <div class="w-16 text-right">
              {{ item.quantity }}
            </div>
            <div class="w-24 text-right">₱{{ item.price }}</div>
            <div class="w-24 text-right">₱{{ item.discount }}</div>
            <div class="w-24 text-right">₱{{ (item.price - item.discount) * item.quantity }}</div>
          </div>
        </div>

        <!-- Grand Total -->
        <p class="text-lg font-bold mb-4">Grand Total: ₱{{ receiptData.total }}</p>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 no-print">
          <button
            type="button"
            v-print="printOptions"
            class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
          >
            Print
          </button>
          <button
            type="button"
            @click="closeReceiptModal"
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watchEffect, watch } from 'vue'
import JsBarcode from 'jsbarcode'
import Swal from 'sweetalert2'
import { mdiAccountPlus } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'

import { useLoading } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

// Destructure the loader functions (available for your entire component)
const { show, hide } = useLoading()

// Import stores
import { useProductCategoryStore } from '@/stores/product/category'
import { useCustomerStore } from '@/stores/customer'
import { useProductSaleStore } from '@/stores/product/sale'

// Initialize stores
const productCategoryStore = useProductCategoryStore()
const customerStore = useCustomerStore()
const productSaleStore = useProductSaleStore()

// Fetch data from stores
productCategoryStore.showAllItems()
customerStore.fetchItems()
productSaleStore.fetchItems()

// ----- State -----
const breadcrumbs = ref([])
const currentCategory = ref(null)
const searchQuery = ref('')
const cart = ref([])

const categories = ref([])
const customers = ref([])
const sales = ref([])

// Sales Modal
const isSalesModalOpen = ref(false)
const salesSearchQuery = ref('')
const salesFromDate = ref('')
const salesToDate = ref('')

const currentPage = ref(1)
const pageSize = ref(10)

const totalPages = computed(() => productSaleStore.totalPages)

watchEffect(() => {
  categories.value = productCategoryStore.items?.data?.categories || []
})

watchEffect(() => {
  customers.value = customerStore.items?.data || []
})

watchEffect(() => {
  sales.value = productSaleStore.items?.data || []
})

watch(
  [salesSearchQuery, salesFromDate, salesToDate, currentPage],
  () => {
    productSaleStore.fetchItems({
      page: currentPage.value,
      limit: pageSize.value,
      filters: {
        start_date: salesFromDate.value || null,
        end_date: salesToDate.value || null,
        query: salesSearchQuery.value.trim() || null
      }
    })
  },
  { immediate: true }
)

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// Customer Data
const customerId = ref('')
const customerName = ref('')
const filteredCustomers = ref([])
const isCustomerModalOpen = ref(false)
const newCustomer = reactive({
  name: '',
  email: '',
  phone: ''
})

// Global Discounts
const discountAllItemsPercent = ref(0)
const discountEntireSale = ref(0)

// Item Discount / Price Modals
const isItemDiscountModalOpen = ref(false)
const itemDiscountModalIndex = ref(null)
const itemDiscountModalValue = ref(0)

const isItemPriceModalOpen = ref(false)
const itemPriceModalIndex = ref(null)
const itemPriceModalValue = ref(0)

// Payment
const paymentTypes = ref(['Cash', 'Check', 'Debit Card', 'Credit Card', 'E-Wallet', 'Bank'])
const selectedPaymentType = ref('')

// Instead of a manual ref for amountDue, we make it automatically reflect totalCartAmount
const amountDue = computed(() => totalCartAmount.value)

const checkNumber = ref('')
const bankName = ref('')
const walletReference = ref('')
const cardAuthCode = ref('')
const bankReference = ref('')

// Receipt Modal
const isReceiptModalOpen = ref(false)
const transactionId = ref('')
// We'll store the entire sale's info in an object for the receipt
const receiptData = reactive({
  id: '',
  date: '',
  customerName: '',
  items: [],
  total: 0,
  paymentType: '',
  status: ''
})

// Print plugin options
const printOptions = {
  id: 'receiptContainer',
  style: `
    @page {
      size: A4;
      margin: 20mm;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      html, body {
        margin: 0;
        padding: 0;
        width: 210mm;
      }
      #receiptContainer {
        width: 100%;
        margin: 0 auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      thead {
        display: table-header-group;
      }
      tfoot {
        display: table-footer-group;
      }
      tr {
        page-break-inside: avoid;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
        vertical-align: middle;
      }
    }
  `
}

// ----- Computed -----

/**
 * If exactly one product matches the search (and no cat/subcat name match),
 * show it directly.
 */
const singleGlobalSingleMatch = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return null
  if (catOrSubcatNameMatches(query)) return null

  const allProducts = []
  const gatherAllProducts = (cat) => {
    if (cat.products?.length) allProducts.push(...cat.products)
    if (cat.subcategories?.length) cat.subcategories.forEach(gatherAllProducts)
  }
  categories.value.forEach(gatherAllProducts)

  const matched = allProducts.filter((p) => p.name.toLowerCase().includes(query))
  return matched.length === 1 ? matched[0] : null
})

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  const q = searchQuery.value.toLowerCase()
  return categories.value.filter((cat) => shouldIncludeCategory(cat, q))
})

const filteredProducts = computed(() => {
  if (!currentCategory.value && !searchQuery.value) return []

  const category = findCategoryByBreadcrumbs()
  if (!category) return []

  // Gather products from the category and its subcategories
  let products = category.products?.slice() || []
  if (category.subcategories?.length) {
    category.subcategories.forEach((sub) => {
      if (sub.products?.length) {
        products = products.concat(sub.products)
      }
    })
  }

  // Deduplicate products by their unique id
  const uniqueProductsMap = new Map()
  products.forEach((product) => {
    if (!uniqueProductsMap.has(product.id)) {
      uniqueProductsMap.set(product.id, product)
    }
  })
  const uniqueProducts = Array.from(uniqueProductsMap.values())

  // If there's no search query, return the deduplicated products
  if (!searchQuery.value) return uniqueProducts

  // Otherwise, filter the unique products based on the search query
  const q = searchQuery.value.toLowerCase()
  return uniqueProducts.filter((p) => p.name.toLowerCase().includes(q))
})

const visibleSubcategories = computed(() => {
  const category = findCategoryByBreadcrumbs()
  if (!category || !category.subcategories) return []
  const q = searchQuery.value.toLowerCase()
  return category.subcategories.filter((sub) => sub.name.toLowerCase().includes(q))
})

const subTotalBeforeGlobalDiscount = computed(() => {
  return cart.value.reduce((sum, item) => {
    const line = (item.price - item.discount) * item.quantity
    return sum + line
  }, 0)
})

const totalCartAmount = computed(() => {
  let total = subTotalBeforeGlobalDiscount.value
  if (discountAllItemsPercent.value > 0) {
    total *= 1 - discountAllItemsPercent.value / 100
  }
  if (discountEntireSale.value > 0) {
    total -= discountEntireSale.value
  }
  return total < 0 ? 0 : total
})

// Filtered sales for the Sales Modal
const filteredSales = computed(() => {
  // Convert from/to dates
  const from = salesFromDate.value ? new Date(salesFromDate.value) : null
  const to = salesToDate.value ? new Date(salesToDate.value) : null
  const q = salesSearchQuery.value.toLowerCase().trim()

  return sales.value.filter((sale) => {
    // Filter by date range
    const saleDate = new Date(sale.created_at)
    if (from && saleDate < from) return false
    if (to) {
      let toEnd = new Date(to)
      toEnd.setHours(23, 59, 59, 999)
      if (saleDate > toEnd) return false
    }

    // Filter by search query in ID or customerName or status
    if (q) {
      const combined = `${sale.id} ${sale.customer_name} ${sale.status}`.toLowerCase()
      if (!combined.includes(q)) return false
    }
    return true
  })
})

// ----- Functions -----

function catOrSubcatNameMatches(query) {
  const checkCat = (cat) => {
    if (cat.name.toLowerCase().includes(query)) return true
    if (cat.subcategories?.length) return cat.subcategories.some(checkCat)
    return false
  }
  return categories.value.some(checkCat)
}

function shouldIncludeCategory(cat, query) {
  if (cat.name.toLowerCase().includes(query)) return true
  if (cat.products?.some((p) => p.name.toLowerCase().includes(query))) return true
  if (cat.subcategories?.some((sub) => shouldIncludeCategory(sub, query))) return true
  return false
}

function findCategoryByBreadcrumbs() {
  let currentLevel = categories.value
  let foundCategory = null
  for (const crumb of breadcrumbs.value) {
    foundCategory = currentLevel.find((c) => c.name === crumb)
    if (!foundCategory) return {}
    currentLevel = foundCategory.subcategories || []
  }
  return foundCategory || {}
}

// Navigation
function selectCategory(category) {
  breadcrumbs.value.push(category.name)
  currentCategory.value = category.name
}

function goBack() {
  breadcrumbs.value.pop()
  currentCategory.value = breadcrumbs.value[breadcrumbs.value.length - 1] || null
}

function navigateToBreadcrumb(index) {
  breadcrumbs.value.splice(index + 1)
  currentCategory.value = breadcrumbs.value[breadcrumbs.value.length - 1] || null
}

function resetCategories() {
  breadcrumbs.value = []
  currentCategory.value = null
}

// Cart
function isInCart(product) {
  return cart.value.some((i) => i.id === product.id)
}

function toggleProductSelection(product) {
  const found = cart.value.find((i) => i.id === product.id)
  if (found) {
    const idx = cart.value.indexOf(found)
    removeFromCart(idx)
  } else {
    cart.value.push({ ...product, quantity: 1, discount: 0 })
  }
}

function removeFromCart(index) {
  cart.value.splice(index, 1)
}

async function checkout() {
  if (!selectedPaymentType.value) {
    Swal.fire({
      title: 'Error',
      text: 'Please select a payment type.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
    return
  }

  // Show full-screen loader with optional configuration.
  show({
    isFullPage: true, // Ensures the overlay covers the entire screen
    color: '#b51919', // Customize the loader color
    loader: 'dots' // Choose a loader style (optional)
  })

  try {
    const saleId = Date.now().toString()
    const newSale = {
      user_id: 1,
      branch_id: 1,
      warehouse_id: 1,
      customer_id: customerId.value || null,
      customer_name: customerName.value,
      status: 'completed',
      sale_date: new Date().toISOString(),
      total_amount: totalCartAmount.value,
      discount_total: discountEntireSale.value || 0.0,
      remarks: 'Sale transaction',
      payment_type: selectedPaymentType.value,
      checkNumber: checkNumber.value || null,
      bankName: bankName.value || null,
      walletReference: walletReference.value || null,
      cardAuthCode: cardAuthCode.value || null,
      bankReference: bankReference.value || null,
      items: cart.value.map((item) => ({
        item_id: item.id,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
        total: (item.price - item.discount) * item.quantity
      }))
    }

    const result = await productSaleStore.createItem(newSale)

    if (!result || result.error) {
      throw new Error(result?.error || 'Unknown error occurred')
    }

    Swal.fire({
      title: 'Checkout successful!',
      html: `
        <div style="text-align: left">
          <p><strong>Payment:</strong> ${selectedPaymentType.value}</p>
          <p><strong>Due:</strong> ₱${amountDue.value.toFixed(2)}</p>
          <p><strong>Cart:</strong> ₱${totalCartAmount.value.toFixed(2)}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#b51919'
    }).then(() => {
      transactionId.value = saleId
      openReceiptModal(result)
    })
  } catch (error) {
    console.error('Checkout error:', error)
    Swal.fire({
      title: 'Checkout Failed',
      text: error.message || 'An error occurred while processing your sale.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
  } finally {
    // Hide the loader regardless of success or error.
    hide()
  }
}

// Receipt Modal
async function openReceiptModal(sale) {
  receiptData.id = sale.id
  receiptData.date = sale.sale_date
  receiptData.customerName = sale.customer_name
  receiptData.items = sale.saleItems || cart.value
  receiptData.total = sale.total_amount
  receiptData.paymentType = sale.payment_type
  receiptData.status = sale.status

  isReceiptModalOpen.value = true

  await nextTick()
  const barcodeEl = document.getElementById('barcodeElement')
  if (barcodeEl) {
    JsBarcode(barcodeEl, sale.id, {
      format: 'CODE128',
      lineColor: '#000',
      width: 2,
      height: 40,
      displayValue: false
    })
  }
}

function closeReceiptModal() {
  isReceiptModalOpen.value = false
  clearPos()
}

function clearPos() {
  cart.value = []
  searchQuery.value = ''
  breadcrumbs.value = []
  currentCategory.value = null
  discountAllItemsPercent.value = 0
  discountEntireSale.value = 0
  customerName.value = ''
  selectedPaymentType.value = ''
  checkNumber.value = ''
  bankName.value = ''
  walletReference.value = ''
  cardAuthCode.value = ''
  bankReference.value = ''
}

// Item Discount Modal
function openItemDiscountModal(index) {
  itemDiscountModalIndex.value = index
  itemDiscountModalValue.value = cart.value[index].discount
  isItemDiscountModalOpen.value = true
}

function closeItemDiscountModal() {
  isItemDiscountModalOpen.value = false
  itemDiscountModalIndex.value = null
  itemDiscountModalValue.value = 0
}

function saveItemDiscount() {
  if (itemDiscountModalIndex.value !== null) {
    cart.value[itemDiscountModalIndex.value].discount = itemDiscountModalValue.value
  }
  closeItemDiscountModal()
}

// Item Price Modal
function openItemPriceModal(index) {
  itemPriceModalIndex.value = index
  itemPriceModalValue.value = cart.value[index].price
  isItemPriceModalOpen.value = true
}

function closeItemPriceModal() {
  isItemPriceModalOpen.value = false
  itemPriceModalIndex.value = null
  itemPriceModalValue.value = 0
}

function saveItemPrice() {
  if (itemPriceModalIndex.value !== null) {
    cart.value[itemPriceModalIndex.value].price = itemPriceModalValue.value
  }
  closeItemPriceModal()
}

// Customer Modal
function openCustomerModal() {
  isCustomerModalOpen.value = true
}

function closeCustomerModal() {
  isCustomerModalOpen.value = false
  newCustomer.name = ''
  newCustomer.email = ''
  newCustomer.phone = ''
}

function saveCustomer() {
  if (newCustomer.name) {
    customers.value.push({
      ...newCustomer,
      id: customers.value.length + 1
    })
    customerName.value = newCustomer.name
  }
  closeCustomerModal()
}

function filterCustomers() {
  if (customerName.value) {
    const lower = customerName.value.toLowerCase()
    filteredCustomers.value = customers.value.filter((c) =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(lower)
    )
  } else {
    filteredCustomers.value = []
  }
}

function selectCustomer(c) {
  customerId.value = c.id
  customerName.value = `${c.first_name} ${c.last_name}`
  filteredCustomers.value = []
}

// Sales Modal
function openSalesModal() {
  productSaleStore.fetchItems()
  isSalesModalOpen.value = true
}

function closeSalesModal() {
  isSalesModalOpen.value = false
}

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString()
}

// Suspend Sale
function suspendSale() {
  if (!cart.value.length) return

  const saleId = Date.now().toString()
  const newSale = {
    id: saleId,
    date: new Date().toISOString(),
    customerName: customerName.value,
    items: cart.value.map((item) => ({ ...item })),
    subTotal: subTotalBeforeGlobalDiscount.value,
    discountAllItemsPercent: discountAllItemsPercent.value,
    discountEntireSale: discountEntireSale.value,
    total: totalCartAmount.value,
    paymentType: selectedPaymentType.value || 'N/A',
    checkNumber: checkNumber.value,
    bankName: bankName.value,
    walletReference: walletReference.value,
    cardAuthCode: cardAuthCode.value,
    bankReference: bankReference.value,
    status: 'Suspended'
  }

  sales.value.push(newSale)

  Swal.fire({
    title: 'Sale Suspended',
    text: `Sale #${saleId} has been suspended.`,
    icon: 'info',
    confirmButtonColor: '#b51919'
  })

  clearPos()
}

// Cancel Sale
function cancelSale() {
  if (!cart.value.length) return

  const saleId = Date.now().toString()
  const voidedSale = {
    id: saleId,
    date: new Date().toISOString(),
    customerName: customerName.value,
    items: cart.value.map((item) => ({ ...item })),
    subTotal: subTotalBeforeGlobalDiscount.value,
    discountAllItemsPercent: discountAllItemsPercent.value,
    discountEntireSale: discountEntireSale.value,
    total: totalCartAmount.value,
    paymentType: selectedPaymentType.value || 'N/A',
    checkNumber: checkNumber.value,
    bankName: bankName.value,
    walletReference: walletReference.value,
    cardAuthCode: cardAuthCode.value,
    bankReference: bankReference.value,
    status: 'Voided'
  }
  sales.value.push(voidedSale)

  clearPos()
}

// Unsuspend Sale
function unsuspendSale(sale) {
  clearPos()
  cart.value = sale.items.map((item) => ({ ...item }))
  customerName.value = sale.customerName
  discountAllItemsPercent.value = sale.discountAllItemsPercent
  discountEntireSale.value = sale.discountEntireSale
  selectedPaymentType.value = sale.paymentType
  checkNumber.value = sale.checkNumber
  bankName.value = sale.bankName
  walletReference.value = sale.walletReference
  cardAuthCode.value = sale.cardAuthCode
  bankReference.value = sale.bankReference

  sale.status = 'Re-Opened'

  Swal.fire({
    title: 'Sale Unsuspended',
    text: `Loaded sale #${sale.id} back into the cart.`,
    icon: 'success',
    confirmButtonColor: '#b51919'
  })

  closeSalesModal()
}

// Void Sale
function voidSale(sale) {
  sale.status = 'Voided'
  Swal.fire({
    title: 'Sale Voided',
    text: `Sale #${sale.id} is now voided.`,
    icon: 'success',
    confirmButtonColor: '#b51919'
  })
}

// Print an existing sale from the sales list
function printExistingSale(sale) {
  openReceiptModal(sale)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fixed {
  z-index: 50;
}

.sticky {
  align-self: flex-start;
}

@media print {
  :deep(.no-print) {
    display: none !important;
  }
}
</style>
