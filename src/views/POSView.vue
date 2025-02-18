<!-- src/views/POSPage.vue -->
<template>
  <div class="pos-page bg-[#f8f8f8] min-h-screen flex flex-col">
    <!-- Loading Overlay for Initial Load or Async Operations -->
    <div
      v-if="isInitialLoad || isLoading"
      class="loading-screen flex flex-col items-center justify-center h-screen"
    >
      <h1 class="text-3xl font-bold">Loading...</h1>
    </div>

    <!-- Main Content: Shown only when not loading -->
    <div v-else>
      <!-- Start Menu: shown if no active shift -->
      <div
        v-if="!activeShift"
        class="start-menu flex flex-col items-center justify-center h-screen"
      >
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold">Welcome to the POS System</h1>
          <p class="text-xl mt-2">{{ currentDateTime }}</p>
          <p class="text-xl mt-2 text-blue-500">
            {{ authStore.user.first_name }} {{ authStore.user.last_name }}
          </p>
        </div>
        <div class="flex space-x-4">
          <button
            @click="startNewTransaction"
            class="px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700"
          >
            Start New Transaction
          </button>
          <button
            @click="closePOS"
            class="px-6 py-3 bg-red-600 text-white rounded shadow hover:bg-red-700"
          >
            Close POS
          </button>
        </div>
      </div>

      <!-- Main POS UI: shown once an active shift is present -->
      <div v-else class="pos-ui flex flex-col">
        <!-- Header with active shift details and control buttons -->
        <header class="bg-white shadow-md p-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">Transaction In Progress</h2>
            <p class="text-sm text-gray-500">
              Started at: {{ formatDateTime(activeShift.start_time) }}
            </p>
            <p class="text-sm text-gray-500">
              User: {{ authStore.user.first_name }} {{ authStore.user.last_name }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Fullscreen Toggle Button -->
            <button
              @click="toggleFullscreen"
              class="flex items-center justify-center w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition duration-150"
            >
              <BaseIcon v-if="!isFullscreen" :path="mdiFullscreen" size="18" />
              <BaseIcon v-else :path="mdiFullscreenExit" size="18" />
            </button>

            <button
              @click="toggleGrid"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg text-lg focus:outline-none"
            >
              {{ showGrid ? 'Show Products' : 'Hide Products' }}
            </button>
            <!-- Add Cash Button -->
            <button
              @click="addCash"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-150 font-semibold"
            >
              Add Cash
            </button>
            <!-- Remove Cash Button -->
            <button
              @click="removeCash"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-150 font-semibold"
            >
              Remove Cash
            </button>
            <!-- Open Cash Drawer Button -->
            <button
              @click="openCashDrawer"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-150 font-semibold"
            >
              Open Cash Drawer
            </button>

            <button
              @click="openSalesModal"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-150 font-semibold"
            >
              Sales
            </button>
            <button
              v-if="cart.length > 0"
              @click="suspendSale"
              class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition duration-150 font-semibold"
            >
              Suspend
            </button>
            <button
              v-if="cart.length > 0"
              @click="cancelSale"
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition duration-150 font-semibold"
            >
              Cancel
            </button>

            <!-- End Transaction Button -->
            <button
              @click="endTransaction"
              class="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-150"
            >
              <BaseIcon :path="mdiLogout" size="18" />
            </button>
          </div>
        </header>

        <!-- Main Content -->
        <div class="w-full mx-auto py-8 flex-1 flex flex-col md:flex-row p-4 md:p-8">
          <!-- Left: Categories & Products -->
          <div class="flex-1">
            <div v-if="!showGrid">
              <BreadcrumbNavigation
                :breadcrumbs="breadcrumbs"
                @reset="resetCategories"
                @navigate="navigateToBreadcrumb"
              />

              <div v-if="currentCategory" class="mb-4">
                <h2
                  class="text-lg font-bold text-[#b51919] cursor-pointer hover:underline flex items-center gap-2"
                  @click="goBack"
                >
                  ← Back to Categories
                </h2>
              </div>

              <h1 class="text-2xl font-bold mb-4">
                {{ currentCategory ? currentCategory : 'All Categories' }}
              </h1>

              <div class="mb-6">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search categories or products..."
                  class="w-full p-2 border rounded"
                />
              </div>
            </div>

            <!-- Product Grid Component -->
            <ProductGrid
              :show-grid="showGrid"
              :searchQuery="searchQuery"
              :categories="categories"
              :currentCategory="currentCategory"
              :breadcrumbs="breadcrumbs"
              :singleGlobalSingleMatch="singleGlobalSingleMatch"
              :filteredCategories="filteredCategories"
              :filteredProducts="filteredProducts"
              :visibleSubcategories="visibleSubcategories"
              :isInCart="isInCart"
              :cart="cart"
              :discountAllItemsPercent="discountAllItemsPercent"
              :discountEntireSale="discountEntireSale"
              :subTotalBeforeGlobalDiscount="subTotalBeforeGlobalDiscount"
              :totalCartAmount="totalCartAmount"
              @selectCategory="selectCategory"
              @toggleProduct="toggleProductSelection"
              @openItemPriceModal="openItemPriceModal"
              @openItemDiscountModal="openItemDiscountModal"
              @removeFromCart="removeFromCart"
              @update:discountAllItemsPercent="(val) => (discountAllItemsPercent = val)"
              @update:discountEntireSale="(val) => (discountEntireSale = val)"
            />
          </div>

          <!-- Right: Cart Sidebar -->
          <CartSidebar
            :cart="cart"
            v-model:customerName="customerName"
            v-model:discountAllItemsPercent="discountAllItemsPercent"
            v-model:discountEntireSale="discountEntireSale"
            :totalCartAmount="totalCartAmount"
            :paymentTypes="paymentTypes"
            v-model:selectedPaymentType="selectedPaymentType"
            :amountDue="amountDue"
            v-model:checkNumber="checkNumber"
            v-model:bankName="bankName"
            v-model:walletReference="walletReference"
            v-model:cardAuthCode="cardAuthCode"
            v-model:bankReference="bankReference"
            :subTotalBeforeGlobalDiscount="subTotalBeforeGlobalDiscount"
            :filteredCustomers="filteredCustomers"
            :showCartTable="showGrid"
            @filterCustomers="filterCustomers"
            @selectCustomer="selectCustomer"
            @openCustomerModal="openCustomerModal"
            @openItemPriceModal="openItemPriceModal"
            @openItemDiscountModal="openItemDiscountModal"
            @removeFromCart="removeFromCart"
            @checkout="checkout"
            @suspendSale="suspendSale"
            @cancelSale="cancelSale"
            @openSalesModal="openSalesModal"
          />
        </div>

        <!-- Modals -->
        <CustomerModal
          v-if="isCustomerModalOpen"
          @saveCustomer="saveCustomer"
          @close="closeCustomerModal"
        />

        <EditItemModal
          v-if="isItemDiscountModalOpen"
          type="discount"
          :value="itemDiscountModalValue"
          @save="saveItemDiscount"
          @close="closeItemDiscountModal"
        />

        <EditItemModal
          v-if="isItemPriceModalOpen"
          type="price"
          :value="itemPriceModalValue"
          @save="saveItemPrice"
          @close="closeItemPriceModal"
        />

        <SalesModal
          v-if="isSalesModalOpen"
          @close="closeSalesModal"
          @unsuspendSale="unsuspendSale"
          @voidSale="voidSale"
          @printSale="printExistingSale"
          @edit="handleEditSale"
        />

        <ReceiptModal
          v-if="isReceiptModalOpen"
          :transactionId="transactionId"
          :receiptData="receiptData"
          :printOptions="printOptions"
          @close="closeReceiptModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import JsBarcode from 'jsbarcode'
import Swal from 'sweetalert2'

// Import child components
import BreadcrumbNavigation from '@/components/pos/BreadcrumbNavigation.vue'
import ProductGrid from '@/components/pos/ProductGrid.vue'
import CartSidebar from '@/components/pos/CartSidebar.vue'
import CustomerModal from '@/components/pos/CustomerModal.vue'
import EditItemModal from '@/components/pos/EditItemModal.vue'
import SalesModal from '@/components/pos/SalesModal.vue'
import ReceiptModal from '@/components/pos/ReceiptModal.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiFullscreen, mdiFullscreenExit, mdiLogout } from '@mdi/js'

// Import and set up loading overlay
import { useLoading } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
const $loading = useLoading()

// Import stores (using Pinia)
import { useProductCategoryStore } from '@/stores/product/category'
import { useCustomerStore } from '@/stores/customer'
import { useProductSaleStore } from '@/stores/product/sale'
import { useShiftStore } from '@/stores/product/shift'
import { useCashRegisterStore } from '@/stores/product/cashRegister'
import { useAuthStore } from '@/stores/auth'

const productCategoryStore = useProductCategoryStore()
const customerStore = useCustomerStore()
const productSaleStore = useProductSaleStore()
const shiftStore = useShiftStore()
const cashRegisterStore = useCashRegisterStore()
const authStore = useAuthStore()

// Fetch initial data for categories and customers
productCategoryStore.showAllItems()
customerStore.fetchItems()

// ----- Loading State -----
const isLoading = ref(false)
// New: Track initial page load
const isInitialLoad = ref(true)

// ----- Shift Management -----
const activeShift = ref(null)

const ProductGridRef = ref(null)

const startNewTransaction = async () => {
  isLoading.value = true
  try {
    const { value: openingCash } = await Swal.fire({
      title: 'Enter Opening Cash Amount',
      input: 'number',
      inputLabel: 'Opening Cash Amount',
      inputPlaceholder: 'Enter amount (e.g., 100.00)',
      inputAttributes: { min: 0, step: '0.01' },
      showCancelButton: true,
      confirmButtonText: 'Start Transaction',
      cancelButtonText: 'Cancel'
    })
    if (openingCash === undefined || openingCash === '') {
      isLoading.value = false
      return
    }

    const shiftData = {
      userId: 1,
      branchId: 1,
      start_time: new Date(),
      status: 'open',
      opening_cash_amount: openingCash
    }
    const newShift = await shiftStore.createItem(shiftData)
    activeShift.value = newShift
    Swal.fire({
      title: 'Transaction Started',
      text: 'New transaction has been started.',
      icon: 'success',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.message || 'Failed to start transaction.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
  } finally {
    isLoading.value = false
  }
}

const endTransaction = async () => {
  if (!activeShift.value) return
  isLoading.value = true
  try {
    const { value: closingCash } = await Swal.fire({
      title: 'Enter Closing Cash Amount',
      input: 'number',
      inputLabel: 'Closing Cash Amount',
      inputPlaceholder: 'Enter amount (e.g., 150.00)',
      inputAttributes: { min: 0, step: '0.01' },
      showCancelButton: true,
      confirmButtonText: 'End Transaction',
      cancelButtonText: 'Cancel'
    })
    if (closingCash === undefined || closingCash === '') {
      isLoading.value = false
      return
    }

    const salesTotal = await productSaleStore.getTotalForShift(activeShift.value.id)
    await shiftStore.updateItem(activeShift.value.id, {
      end_time: new Date(),
      status: 'closed',
      closing_cash_amount: closingCash,
      cash_sales_total: salesTotal
    })

    activeShift.value = null
    Swal.fire({
      title: 'Transaction Ended',
      text: 'The current transaction has been ended.',
      icon: 'success',
      confirmButtonColor: '#3085d6'
    })
    clearPos()
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.message || 'Failed to end transaction.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
  } finally {
    isLoading.value = false
  }
}

const closePOS = () => {
  Swal.fire({
    title: 'Close POS',
    text: 'Are you sure you want to close the POS?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, close it!'
  }).then((result) => {
    if (result.isConfirmed) {
      window.close()
    }
  })
}

// ----- Cash Register Operations -----
const addCash = async () => {
  if (!activeShift.value) {
    Swal.fire({
      title: 'Error',
      text: 'No active shift found.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
    return
  }
  const { value: cashAmount } = await Swal.fire({
    title: 'Add Cash',
    input: 'number',
    inputLabel: 'Enter cash amount to add',
    inputPlaceholder: 'e.g., 50.00',
    inputAttributes: { min: 0, step: '0.01' },
    showCancelButton: true,
    confirmButtonText: 'Add',
    cancelButtonText: 'Cancel'
  })
  if (cashAmount === undefined || cashAmount === '') return
  try {
    await cashRegisterStore.createItem({
      shift_id: activeShift.value.id,
      cash: Number(cashAmount),
      type: 'in',
      remarks: 'Cash added manually'
    })
    Swal.fire({
      title: 'Cash Added',
      text: `Successfully added ₱${Number(cashAmount).toFixed(2)} to the register.`,
      icon: 'success',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.message || 'Failed to add cash.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
  }
}

const removeCash = async () => {
  if (!activeShift.value) {
    Swal.fire({
      title: 'Error',
      text: 'No active shift found.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
    return
  }
  const { value: cashAmount } = await Swal.fire({
    title: 'Remove Cash',
    input: 'number',
    inputLabel: 'Enter cash amount to remove',
    inputPlaceholder: 'e.g., 50.00',
    inputAttributes: { min: 0, step: '0.01' },
    showCancelButton: true,
    confirmButtonText: 'Remove',
    cancelButtonText: 'Cancel'
  })
  if (cashAmount === undefined || cashAmount === '') return
  try {
    await cashRegisterStore.createItem({
      shift_id: activeShift.value.id,
      cash: Number(cashAmount),
      type: 'out',
      remarks: 'Cash removed manually'
    })
    Swal.fire({
      title: 'Cash Removed',
      text: `Successfully removed ₱${Number(cashAmount).toFixed(2)} from the register.`,
      icon: 'success',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.message || 'Failed to remove cash.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
  }
}

// New: Open Cash Drawer function
const openCashDrawer = () => {
  Swal.fire({
    title: 'Cash Drawer Command Sent',
    text: 'The cash drawer has been opened.',
    icon: 'success',
    confirmButtonColor: '#3085d6'
  }).then(() => {
    window.print()
  })
}

// ----- Current DateTime for Start Menu -----
const currentDateTime = ref(new Date().toLocaleString())
let timer = null

onMounted(async () => {
  timer = setInterval(() => {
    currentDateTime.value = new Date().toLocaleString()
  }, 1000)

  try {
    await shiftStore.fetchItems({ filters: { userId: 1, status: 'open' } })
    if (shiftStore.items.data.length > 0) {
      activeShift.value = shiftStore.items.data[0]
    }
  } catch (err) {
    console.error('Error checking existing shift:', err)
  } finally {
    // End initial loading once shift data is fetched
    isInitialLoad.value = false
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ----- POS State & Data -----
const breadcrumbs = ref([])
const currentCategory = ref(null)
const searchQuery = ref('')
const cart = ref([])

const categories = ref([])
const customers = ref([])

watch(
  () => productCategoryStore.items?.data?.categories,
  (newVal) => {
    categories.value = newVal || []
  },
  { immediate: true }
)
watch(
  () => customerStore.items?.data,
  (newVal) => {
    customers.value = newVal || []
  },
  { immediate: true }
)

// Toggle to show/hide the grid
const showGrid = ref(true)
function toggleGrid() {
  showGrid.value = !showGrid.value
}

// ----- Sales Modal State -----
const isSalesModalOpen = ref(false)

// ----- Customer Data -----
const customerId = ref('')
const customerName = ref('')
const filteredCustomers = ref([])
const isCustomerModalOpen = ref(false)

// Global Discounts & Payment Data
const discountAllItemsPercent = ref(0)
const discountEntireSale = ref(0)
const paymentTypes = ref(['Cash', 'Check', 'Debit Card', 'Credit Card', 'E-Wallet', 'Bank'])
const selectedPaymentType = ref('')
const amountDue = computed(() => totalCartAmount.value)
const checkNumber = ref('')
const bankName = ref('')
const walletReference = ref('')
const cardAuthCode = ref('')
const bankReference = ref('')

// Receipt Modal Data
const isItemDiscountModalOpen = ref(false)
const isItemPriceModalOpen = ref(false)
const isReceiptModalOpen = ref(false)
const transactionId = ref('')
const selectedCartItemIndex = ref(-1)
const itemDiscountModalValue = ref(0)
const itemPriceModalValue = ref(0)

const receiptData = reactive({
  id: '',
  date: '',
  customerName: '',
  items: [],
  total: 0,
  paymentType: '',
  status: ''
})
const printOptions = {
  id: 'receiptContainer',
  style: `
    @page { size: A4; margin: 20mm; }
    @media print {
      .no-print { display: none !important; }
      html, body { margin: 0; padding: 0; width: 210mm; }
      #receiptContainer { width: 100%; margin: 0 auto; }
      table { width: 100%; border-collapse: collapse; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      tr { page-break-inside: avoid; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: middle; }
    }
  `
}

// ----- Computed Properties for Products, Categories, etc. -----
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
  let products = category.products?.slice() || []
  if (category.subcategories?.length) {
    category.subcategories.forEach((sub) => {
      if (sub.products?.length) products = products.concat(sub.products)
    })
  }
  const uniqueProducts = Array.from(new Map(products.map((p) => [p.id, p])).values())
  if (!searchQuery.value) return uniqueProducts
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
  return cart.value.reduce((sum, item) => sum + (item.price - item.discount) * item.quantity, 0)
})
const totalCartAmount = computed(() => {
  let total = subTotalBeforeGlobalDiscount.value
  if (discountAllItemsPercent.value > 0) total *= 1 - discountAllItemsPercent.value / 100
  if (discountEntireSale.value > 0) total -= discountEntireSale.value
  return total < 0 ? 0 : total
})

// ----- Helper Functions -----
function catOrSubcatNameMatches(query) {
  const checkCat = (cat) => {
    if (cat.name.toLowerCase().includes(query)) return true
    if (cat.subcategories?.length) return cat.subcategories.some(checkCat)
    return false
  }
  return categories.value.some(checkCat)
}
function shouldIncludeCategory(cat, query) {
  return (
    cat.name.toLowerCase().includes(query) ||
    (cat.products && cat.products.some((p) => p.name.toLowerCase().includes(query))) ||
    (cat.subcategories && cat.subcategories.some((sub) => shouldIncludeCategory(sub, query)))
  )
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

// ----- Navigation Functions -----
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

// ----- Cart Operations -----
function cancelSale() {
  clearPos()
}

function suspendSale() {
  checkout('suspend')
}

function isInCart(product) {
  return cart.value.some((i) => i.id === product.id)
}
function toggleProductSelection(product) {
  const found = cart.value.find((i) => i.id === product.id)
  if (found) {
    found.quantity += 1
  } else {
    cart.value.push({ ...product, quantity: 1, discount: 0 })
  }
}
function removeFromCart(index) {
  cart.value.splice(index, 1)
}

// ----- Checkout (with Loader) -----
async function checkout(action = 'complete') {
  // Only validate payment type if completing the sale
  if (!selectedPaymentType.value) {
    Swal.fire({
      title: 'Error',
      text: 'Please select a payment type.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
    return
  }

  const loaderInstance = $loading.show({
    isFullPage: true,
    canCancel: false,
    color: '#3b82f6',
    opacity: 0.8
  })

  const saleId = Date.now().toString()
  const newSale = {
    user_id: 1,
    branch_id: 1,
    warehouse_id: 1,
    shift_id: activeShift.value.id,
    customer_id: customerId.value || null,
    customer_name: customerName.value,
    status: action === 'complete' ? 'completed' : 'suspended',
    sale_date: new Date().toISOString(),
    total_amount: totalCartAmount.value,
    discount_total: discountEntireSale.value || 0.0,
    remarks: action === 'complete' ? 'Sale transaction' : 'Suspended sale',
    // Only include payment details if completing the sale
    payment_type: selectedPaymentType.value,
    checkNumber: action === 'complete' ? checkNumber.value || null : null,
    bankName: action === 'complete' ? bankName.value || null : null,
    walletReference: action === 'complete' ? walletReference.value || null : null,
    cardAuthCode: action === 'complete' ? cardAuthCode.value || null : null,
    bankReference: action === 'complete' ? bankReference.value || null : null,
    items: cart.value.map((item) => ({
      item_id: item.id,
      price: item.price,
      quantity: item.quantity,
      discount: item.discount,
      total: (item.price - item.discount) * item.quantity
    }))
  }

  try {
    const result = await productSaleStore.createItem(newSale)
    if (!result || result.error) throw new Error(result?.error || 'Unknown error occurred')
    loaderInstance.hide()

    const successTitle = action === 'complete' ? 'Checkout successful!' : 'Sale suspended!'
    const successMessage =
      action === 'complete'
        ? `
        <div style="text-align: left">
          <p><strong>Payment:</strong> ${selectedPaymentType.value}</p>
          <p><strong>Due:</strong> ₱${amountDue.value.toFixed(2)}</p>
          <p><strong>Cart:</strong> ₱${totalCartAmount.value.toFixed(2)}</p>
        </div>
      `
        : `
        <div style="text-align: left">
          <p><strong>Cart Total:</strong> ₱${totalCartAmount.value.toFixed(2)}</p>
          <p>This sale has been suspended and can be resumed later.</p>
        </div>
      `

    Swal.fire({
      title: successTitle,
      html: successMessage,
      icon: 'success',
      confirmButtonColor: '#b51919'
    }).then(() => {
      if (action === 'complete') {
        transactionId.value = saleId
        openReceiptModal(result)
      }
      clearPos()
    })
  } catch (error) {
    loaderInstance.hide()
    console.error('Checkout error:', error)
    Swal.fire({
      title: 'Checkout Failed',
      text: error.message || 'An error occurred while processing your sale.',
      icon: 'error',
      confirmButtonColor: '#b51919'
    })
  }
}

// ----- Receipt Modal Functions -----
function openItemDiscountModal(index) {
  selectedCartItemIndex.value = index
  itemDiscountModalValue.value = cart.value[index].discount || 0
  isItemDiscountModalOpen.value = true
}

function closeItemDiscountModal() {
  isItemDiscountModalOpen.value = false
  selectedCartItemIndex.value = -1
}

function saveItemDiscount(newDiscount) {
  if (selectedCartItemIndex.value >= 0) {
    cart.value[selectedCartItemIndex.value].discount = newDiscount
  }
  closeItemDiscountModal()
}

function openItemPriceModal(index) {
  selectedCartItemIndex.value = index
  itemPriceModalValue.value = cart.value[index].price || 0
  isItemPriceModalOpen.value = true
}

function closeItemPriceModal() {
  isItemPriceModalOpen.value = false
  selectedCartItemIndex.value = -1
}

function saveItemPrice(newPrice) {
  if (selectedCartItemIndex.value >= 0) {
    cart.value[selectedCartItemIndex.value].price = newPrice
  }
  closeItemPriceModal()
}

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

// ----- Customer Modal Functions -----
function openCustomerModal() {
  isCustomerModalOpen.value = true
}
function closeCustomerModal() {
  isCustomerModalOpen.value = false
}
function saveCustomer(newCust) {
  if (newCust.name) {
    customers.value.push({ ...newCust, id: customers.value.length + 1 })
    customerName.value = newCust.name
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

// ----- Sales Modal Functions -----
function openSalesModal() {
  isSalesModalOpen.value = true
}
function closeSalesModal() {
  isSalesModalOpen.value = false
}
function unsuspendSale(sale) {
  clearPos()
  console.log(sale.saleItems)
  cart.value = sale.saleItems.map((item) => ({
    ...item,
    id: item.item_id,
    name: item.item.name,
    price: Number(item.price) || 0,
    discount: Number(item.discount) || 0
  }))

  customerName.value = sale.customerName
  discountAllItemsPercent.value = sale.discountAllItemsPercent
  discountEntireSale.value = sale.discountEntireSale
  selectedPaymentType.value = sale.payment_type
  checkNumber.value = sale.checkNumber
  bankName.value = sale.bankName
  walletReference.value = sale.walletReference
  cardAuthCode.value = sale.cardAuthCode
  bankReference.value = sale.bankReference
  sale.status = 'Re-Opened'
  productSaleStore.updateItem(sale.id, { status: sale.status })
  Swal.fire({
    title: 'Sale Unsuspended',
    text: `Loaded sale #${sale.id} back into the cart.`,
    icon: 'success',
    confirmButtonColor: '#b51919'
  })
  closeSalesModal()
}
function voidSale(sale) {
  sale.status = 'voided'
  productSaleStore.updateItem(sale.id, { status: sale.status })
  Swal.fire({
    title: 'Sale Voided',
    text: `Sale #${sale.id} is now voided.`,
    icon: 'success',
    confirmButtonColor: '#b51919'
  })
}
function printExistingSale(sale) {
  openReceiptModal(sale)
}
function handleEditSale(sale) {
  // Implement editing logic if required
}

// ----- Utility: Format DateTime -----
function formatDateTime(date) {
  return new Date(date).toLocaleString()
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
.start-menu {
  text-align: center;
}
.loading-screen {
  text-align: center;
}
@media print {
  :deep(.no-print) {
    display: none !important;
  }
}
</style>
