<!-- src/views/POSPage.vue -->
<template>
  <div class="pos-page bg-[#f8f8f8] min-h-screen flex flex-col md:flex-row p-4 md:p-8">
    <!-- Main Content -->
    <div class="container mx-auto py-8 flex-1">
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

      <!-- Product Grid Component -->
      <ProductGrid
        :searchQuery="searchQuery"
        :categories="categories"
        :currentCategory="currentCategory"
        :breadcrumbs="breadcrumbs"
        :singleGlobalSingleMatch="singleGlobalSingleMatch"
        :filteredCategories="filteredCategories"
        :filteredProducts="filteredProducts"
        :visibleSubcategories="visibleSubcategories"
        :isInCart="isInCart"
        @selectCategory="selectCategory"
        @toggleProduct="toggleProductSelection"
      />
    </div>

    <!-- Cart Sidebar Component -->
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

    <!-- Sales Modal now no longer requires passing sales or filter props -->
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
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
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

// Import and set up loading overlay
import { useLoading } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
const $loading = useLoading()

// Import stores (using Pinia)
import { useProductCategoryStore } from '@/stores/product/category'
import { useCustomerStore } from '@/stores/customer'
import { useProductSaleStore } from '@/stores/product/sale'
import { mdiFullscreen } from '@mdi/js'
const productCategoryStore = useProductCategoryStore()
const customerStore = useCustomerStore()
const productSaleStore = useProductSaleStore()
// (The sale store is used inside SalesModal, so we don’t use it here)

// Fetch initial data for categories and customers
productCategoryStore.showAllItems()
customerStore.fetchItems()

// ----- State & Data -----
const breadcrumbs = ref([])
const currentCategory = ref(null)
const searchQuery = ref('')
const cart = ref([])

const categories = ref([])
const customers = ref([])

// Watch for changes in categories and customers from their respective stores
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
const isReceiptModalOpen = ref(false)
const transactionId = ref('')
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

document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
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

// ----- Cart Operations -----
function isInCart(product) {
  return cart.value.some((i) => i.id === product.id)
}
function toggleProductSelection(product) {
  const found = cart.value.find((i) => i.id === product.id)
  if (found) {
    removeFromCart(cart.value.indexOf(found))
  } else {
    cart.value.push({ ...product, quantity: 1, discount: 0 })
  }
}
function removeFromCart(index) {
  cart.value.splice(index, 1)
}

// ----- Checkout (with Loader) -----
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
  const loaderInstance = $loading.show({
    container: document.body,
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
  try {
    const result = await productSaleStore.createItem(newSale)
    if (!result || result.error) throw new Error(result?.error || 'Unknown error occurred')
    loaderInstance.hide()
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
function voidSale(sale) {
  sale.status = 'Voided'
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

// Optionally, handle edit sale events from the SalesModal if needed
function handleEditSale(sale) {
  // Implement editing logic if required
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
