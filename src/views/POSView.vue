<template>
  <div class="bg-[#f8f8f8] min-h-screen flex">
    <!-- MAIN CONTENT -->
    <div class="container mx-auto py-8 flex-1">
      <!-- BREADCRUMB NAVIGATION -->
      <div class="mb-6 flex items-center gap-2">
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
    <div class="w-1/3 bg-white shadow-lg p-6 border-l sticky top-0 h-screen overflow-y-auto">
      <!-- Customer Section -->
      <div class="mb-6">
        <h2 class="text-xl font-bold mb-4">Customer</h2>
        <div class="relative">
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
              {{ customer.name }}
            </li>
          </ul>
        </div>
        <button
          @click="openCustomerModal"
          class="mt-2 p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
        >
          Add New Customer
        </button>
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

        <!-- Amount Due (defaults to totalCartAmount) -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Amount Due</label>
          <div class="flex">
            <input
              type="number"
              class="p-2 border rounded flex-1"
              v-model.number="amountDue"
              min="0"
              step="0.01"
            />
            <button
              class="ml-2 p-2 bg-gray-200 hover:bg-gray-300 rounded"
              @click="setAmountDueToTotal"
              title="Set to computed total"
            >
              Use Total
            </button>
          </div>
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

    <!-- Customer Modal -->
    <div
      v-if="isCustomerModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg w-1/3">
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

    <!-- Item Discount Modal -->
    <div
      v-if="isItemDiscountModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg w-1/3">
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

    <!-- Item Price Modal -->
    <div
      v-if="isItemPriceModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg w-1/3">
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

    <!-- Receipt Modal -->
    <div
      v-if="isReceiptModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg w-1/3" id="receiptContainer">
        <h2 class="text-xl font-bold mb-4">Transaction Receipt</h2>
        <p><strong>Transaction ID:</strong> {{ transactionId }}</p>

        <!-- Barcode placeholder -->
        <div class="my-4 flex justify-center">
          <svg ref="barcode"></svg>
        </div>

        <!-- Basic purchase summary -->
        <div class="text-sm mb-4">
          <p><strong>Customer:</strong> {{ customerName || 'N/A' }}</p>
          <p><strong>Payment Type:</strong> {{ selectedPaymentType }}</p>
          <p><strong>Amount Due:</strong> ₱{{ amountDue.toFixed(2) }}</p>
          <p><strong>Cart Total:</strong> ₱{{ totalCartAmount.toFixed(2) }}</p>
        </div>

        <!-- List of items in the cart -->
        <table v-if="cart.length" class="w-full text-sm mb-4">
          <thead>
            <tr class="border-b">
              <th class="text-left py-1">Item</th>
              <th class="text-right py-1">Qty</th>
              <th class="text-right py-1">Price</th>
              <th class="text-right py-1">Discount</th>
              <th class="text-right py-1">Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cart" :key="item.id" class="border-b">
              <td>{{ item.name }}</td>
              <td class="text-right">{{ item.quantity }}</td>
              <td class="text-right">₱{{ item.price.toFixed(2) }}</td>
              <td class="text-right">₱{{ item.discount.toFixed(2) }}</td>
              <td class="text-right">
                ₱{{ ((item.price - item.discount) * item.quantity).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Grand Total -->
        <p class="text-lg font-bold mb-4">Grand Total: ₱{{ totalCartAmount.toFixed(2) }}</p>

        <!-- Action buttons -->
        <div class="flex justify-end gap-2">
          <!-- Print -->
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

<script>
import JsBarcode from 'jsbarcode'
// Example data
import categoriesData from '../../public/data-sources/categories.json'
import customersData from '../../public/data-sources/customers2.json'

export default {
  data() {
    return {
      // Navigation
      breadcrumbs: [],
      currentCategory: null,

      // Search & Cart
      searchQuery: '',
      cart: [],

      // Categories
      categories: categoriesData.categories,

      // Customer Data
      customerName: '',
      customers: customersData.customers,
      filteredCustomers: [],
      isCustomerModalOpen: false,
      newCustomer: {
        name: '',
        email: '',
        phone: ''
      },

      // Global Discounts
      discountAllItemsPercent: 0,
      discountEntireSale: 0,

      // Item Discount / Price Modals
      isItemDiscountModalOpen: false,
      itemDiscountModalIndex: null,
      itemDiscountModalValue: 0,

      isItemPriceModalOpen: false,
      itemPriceModalIndex: null,
      itemPriceModalValue: 0,

      // Payment
      paymentTypes: ['Cash', 'Check', 'Debit Card', 'Credit Card', 'E-Wallet', 'Bank'],
      selectedPaymentType: '',
      amountDue: 0,

      checkNumber: '',
      bankName: '',
      walletReference: '',
      cardAuthCode: '',
      bankReference: '',

      // Receipt Modal
      isReceiptModalOpen: false,
      transactionId: '',

      // Print plugin options
      printOptions: {
        id: 'receiptContainer',
        style: `
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
            }
            #receiptContainer {
              width: 100%;
              margin: 0 auto;
            }
          }
        `
      }
    }
  },

  computed: {
    /**
     * If exactly one product matches the search (and no cat/subcat name match),
     * show it directly.
     */
    singleGlobalSingleMatch() {
      const query = this.searchQuery.trim().toLowerCase()
      if (!query) return null
      if (this.catOrSubcatNameMatches(query)) return null

      const allProducts = []
      const gatherAllProducts = (cat) => {
        if (cat.products?.length) allProducts.push(...cat.products)
        if (cat.subcategories?.length) cat.subcategories.forEach(gatherAllProducts)
      }
      this.categories.forEach(gatherAllProducts)

      const matched = allProducts.filter((p) => p.name.toLowerCase().includes(query))
      return matched.length === 1 ? matched[0] : null
    },

    filteredCategories() {
      if (!this.searchQuery) return this.categories
      const q = this.searchQuery.toLowerCase()
      return this.categories.filter((cat) => this.shouldIncludeCategory(cat, q))
    },
    filteredProducts() {
      if (!this.currentCategory && !this.searchQuery) return []
      const category = this.findCategoryByBreadcrumbs()
      if (!category) return []
      let products = category.products?.slice() || []
      if (category.subcategories?.length) {
        category.subcategories.forEach((sub) => {
          if (sub.products?.length) products = products.concat(sub.products)
        })
      }
      if (!this.searchQuery) return products

      const q = this.searchQuery.toLowerCase()
      return products.filter((p) => p.name.toLowerCase().includes(q))
    },
    visibleSubcategories() {
      const category = this.findCategoryByBreadcrumbs()
      if (!category || !category.subcategories) return []
      const q = this.searchQuery.toLowerCase()
      return category.subcategories.filter((sub) => sub.name.toLowerCase().includes(q))
    },

    subTotalBeforeGlobalDiscount() {
      return this.cart.reduce((sum, item) => {
        const line = (item.price - item.discount) * item.quantity
        return sum + line
      }, 0)
    },
    totalCartAmount() {
      let total = this.subTotalBeforeGlobalDiscount
      if (this.discountAllItemsPercent > 0) {
        total *= 1 - this.discountAllItemsPercent / 100
      }
      if (this.discountEntireSale > 0) {
        total -= this.discountEntireSale
      }
      return total < 0 ? 0 : total
    }
  },

  methods: {
    catOrSubcatNameMatches(query) {
      const checkCat = (cat) => {
        if (cat.name.toLowerCase().includes(query)) return true
        if (cat.subcategories?.length) return cat.subcategories.some(checkCat)
        return false
      }
      return this.categories.some(checkCat)
    },
    shouldIncludeCategory(cat, query) {
      if (cat.name.toLowerCase().includes(query)) return true
      if (cat.products?.some((p) => p.name.toLowerCase().includes(query))) return true
      if (cat.subcategories?.some((sub) => this.shouldIncludeCategory(sub, query))) return true
      return false
    },
    findCategoryByBreadcrumbs() {
      let currentLevel = this.categories
      let foundCategory = null
      for (const crumb of this.breadcrumbs) {
        foundCategory = currentLevel.find((c) => c.name === crumb)
        if (!foundCategory) return {}
        currentLevel = foundCategory.subcategories || []
      }
      return foundCategory || {}
    },

    // Navigation
    selectCategory(category) {
      this.breadcrumbs.push(category.name)
      this.currentCategory = category.name
    },
    goBack() {
      this.breadcrumbs.pop()
      this.currentCategory = this.breadcrumbs[this.breadcrumbs.length - 1] || null
    },
    navigateToBreadcrumb(index) {
      this.breadcrumbs.splice(index + 1)
      this.currentCategory = this.breadcrumbs[this.breadcrumbs.length - 1] || null
    },
    resetCategories() {
      this.breadcrumbs = []
      this.currentCategory = null
    },

    // Cart
    isInCart(product) {
      return this.cart.some((i) => i.id === product.id)
    },
    toggleProductSelection(product) {
      const found = this.cart.find((i) => i.id === product.id)
      if (found) {
        const idx = this.cart.indexOf(found)
        this.removeFromCart(idx)
      } else {
        this.cart.push({ ...product, quantity: 1, discount: 0 })
      }
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },

    // Payment / Checkout
    setAmountDueToTotal() {
      this.amountDue = this.totalCartAmount
    },
    checkout() {
      if (!this.selectedPaymentType) {
        alert('Please select a payment type.')
        return
      }
      let extra = {}
      if (this.selectedPaymentType === 'Check') {
        extra.checkNumber = this.checkNumber
        extra.bankName = this.bankName
      } else if (this.selectedPaymentType === 'E-Wallet') {
        extra.walletReference = this.walletReference
      } else if (
        this.selectedPaymentType === 'Credit Card' ||
        this.selectedPaymentType === 'Debit Card'
      ) {
        extra.cardAuthCode = this.cardAuthCode
      } else if (this.selectedPaymentType === 'Bank') {
        extra.bankReference = this.bankReference
      }

      alert(
        'Checkout successful!\n\n' +
          `Payment: ${this.selectedPaymentType}\n` +
          `Due: ₱${this.amountDue.toFixed(2)}\n` +
          `Cart: ₱${this.totalCartAmount.toFixed(2)}\n` +
          `Extra: ${JSON.stringify(extra, null, 2)}`
      )
      // Generate a transaction ID
      this.transactionId = Date.now().toString()
      // Open the receipt modal while cart is intact
      this.openReceiptModal()
    },

    // Receipt Modal
    openReceiptModal() {
      this.isReceiptModalOpen = true
      this.$nextTick(() => {
        if (this.$refs.barcode) {
          JsBarcode(this.$refs.barcode, this.transactionId, {
            format: 'CODE128',
            lineColor: '#000',
            width: 2,
            height: 40,
            displayValue: true
          })
        }
      })
    },
    closeReceiptModal() {
      this.isReceiptModalOpen = false
      // Clear cart and reset everything AFTER the user closes the receipt
      this.cart = []
      this.searchQuery = ''
      this.breadcrumbs = []
      this.currentCategory = null
      this.discountAllItemsPercent = 0
      this.discountEntireSale = 0
      this.customerName = ''

      this.selectedPaymentType = ''
      this.amountDue = 0
      this.checkNumber = ''
      this.bankName = ''
      this.walletReference = ''
      this.cardAuthCode = ''
      this.bankReference = ''
    },

    // Item Discount Modal
    openItemDiscountModal(index) {
      this.itemDiscountModalIndex = index
      this.itemDiscountModalValue = this.cart[index].discount
      this.isItemDiscountModalOpen = true
    },
    closeItemDiscountModal() {
      this.isItemDiscountModalOpen = false
      this.itemDiscountModalIndex = null
      this.itemDiscountModalValue = 0
    },
    saveItemDiscount() {
      if (this.itemDiscountModalIndex !== null) {
        this.cart[this.itemDiscountModalIndex].discount = this.itemDiscountModalValue
      }
      this.closeItemDiscountModal()
    },

    // Item Price Modal
    openItemPriceModal(index) {
      this.itemPriceModalIndex = index
      this.itemPriceModalValue = this.cart[index].price
      this.isItemPriceModalOpen = true
    },
    closeItemPriceModal() {
      this.isItemPriceModalOpen = false
      this.itemPriceModalIndex = null
      this.itemPriceModalValue = 0
    },
    saveItemPrice() {
      if (this.itemPriceModalIndex !== null) {
        this.cart[this.itemPriceModalIndex].price = this.itemPriceModalValue
      }
      this.closeItemPriceModal()
    },

    // Customer Modal
    openCustomerModal() {
      this.isCustomerModalOpen = true
    },
    closeCustomerModal() {
      this.isCustomerModalOpen = false
      this.newCustomer = { name: '', email: '', phone: '' }
    },
    saveCustomer() {
      if (this.newCustomer.name) {
        this.customers.push({
          ...this.newCustomer,
          id: this.customers.length + 1
        })
        this.customerName = this.newCustomer.name
      }
      this.closeCustomerModal()
    },
    filterCustomers() {
      if (this.customerName) {
        const lower = this.customerName.toLowerCase()
        this.filteredCustomers = this.customers.filter((c) => c.name.toLowerCase().includes(lower))
      } else {
        this.filteredCustomers = []
      }
    },
    selectCustomer(cust) {
      this.customerName = cust.name
      this.filteredCustomers = []
    }
  }
}
</script>

<style scoped>
/* 
  We only replaced Tailwind color classes with red-themed classes 
  to match the sample screenshot's color palette. No layout changes.
*/
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
</style>
