<template>
  <div>
    <!-- Sticky Header for toggles -->
    <div v-if="!showGrid" class="sticky top-0 z-50 bg-white shadow p-2">
      <!-- View mode buttons and letter filter - only show when showGrid is false -->
      <div class="mb-2 text-center">
        <button
          @click="setOpenBy('category')"
          :class="{
            'bg-blue-500 text-white': openBy === 'category',
            'bg-gray-300 text-black': openBy !== 'category'
          }"
          class="px-4 py-2 rounded-lg text-lg mr-2"
        >
          Open by Category
        </button>
        <button
          @click="setOpenBy('product')"
          :class="{
            'bg-blue-500 text-white': openBy === 'product',
            'bg-gray-300 text-black': openBy !== 'product'
          }"
          class="px-4 py-2 rounded-lg text-lg"
        >
          Open by Product
        </button>
      </div>

      <!-- Letter Filter -->
      <template v-if="openBy === 'product' && !itemStore.isLoading">
        <div class="mb-2 text-center overflow-x-auto whitespace-nowrap">
          <button
            v-for="letter in availableLetters"
            :key="letter"
            @click="selectedLetter = letter"
            :class="{
              'bg-blue-500 text-white': selectedLetter === letter,
              'bg-gray-300 text-black': selectedLetter !== letter
            }"
            class="px-4 py-2 rounded-lg text-lg mx-1 inline-block"
          >
            {{ letter }}
          </button>
        </div>
      </template>
    </div>

    <!-- Show barcode input -->
    <div class="relative px-4 mb-3">
      <input
        type="text"
        v-model="barcodeInput"
        placeholder="Enter item name, sku code or scan barcode..."
        class="w-full p-2 border rounded"
      />
      <div
        v-if="barcodeSuggestions.length"
        class="absolute bg-white border rounded mt-1 w-full z-10"
      >
        <div
          v-for="product in barcodeSuggestions"
          :key="product.id"
          class="p-2 hover:bg-gray-100 cursor-pointer"
          @click="handleBarcodeSuggestion(product)"
        >
          {{ product.name }}
        </div>
      </div>
    </div>

    <!-- Cart Table Section (shown when showGrid is false) -->
    <div v-if="showGrid" class="mb-6 mx-4">
      <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
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
    </div>

    <!-- Show full grid view -->
    <div v-if="!showGrid">
      <!-- Category View -->
      <template v-if="openBy === 'category'">
        <div v-if="singleGlobalSingleMatch" class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div
            class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg flex flex-col items-center"
            :class="{ 'bg-red-100': isInCart(singleGlobalSingleMatch) }"
            @click="$emit('toggleProduct', singleGlobalSingleMatch)"
          >
            <img
              :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(
                singleGlobalSingleMatch.name
              )}`"
              alt="Product Image"
              class="w-16 h-16 rounded-full mb-2"
            />
            <h3 class="font-bold text-lg text-center">
              {{ singleGlobalSingleMatch.name }}
            </h3>
            <p class="text-lg text-gray-600">₱{{ singleGlobalSingleMatch.price.toFixed(2) }}</p>
          </div>
        </div>

        <transition-group
          v-else
          name="fade"
          tag="div"
          class="grid grid-cols-2 md:grid-cols-3 gap-2"
        >
          <!-- Subcategories -->
          <div
            v-if="visibleSubcategories.length"
            v-for="subcategory in visibleSubcategories"
            :key="subcategory.name"
            class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg text-center"
            @click="$emit('selectCategory', subcategory)"
          >
            <h2 class="text-lg font-bold">{{ subcategory.name }}</h2>
          </div>
          <!-- Products -->
          <div
            v-if="filteredProducts.length"
            v-for="product in filteredProducts"
            :key="product.id"
            class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg flex flex-col items-center"
            :class="{ 'bg-red-100': isInCart(product) }"
            @click="$emit('toggleProduct', product)"
          >
            <img
              v-if="product.image"
              :src="product.image"
              alt="Product Image"
              class="w-16 h-16 rounded-full mb-2"
            />
            <img
              v-else
              :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}`"
              alt="Product Image"
              class="w-16 h-16 rounded-full mb-2"
            />
            <h3 class="font-bold text-lg text-center">{{ product.name }}</h3>
            <p class="text-lg text-gray-600">₱{{ product.price.toFixed(2) }}</p>
          </div>
          <!-- Top-level Categories if no category is selected -->
          <div
            v-if="!currentCategory"
            v-for="category in filteredCategories"
            :key="category.name"
            class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg text-center"
            @click="$emit('selectCategory', category)"
          >
            <h2 class="text-lg font-bold">{{ category.name }}</h2>
          </div>
          <!-- No results found -->
          <div
            v-if="
              searchQuery &&
              !filteredCategories.length &&
              !filteredProducts.length &&
              !visibleSubcategories.length
            "
            class="col-span-full text-center text-gray-500 text-lg"
          >
            No results found for "{{ searchQuery }}"
          </div>
        </transition-group>
      </template>

      <!-- Product Store View -->
      <template v-else-if="openBy === 'product'">
        <div v-if="itemStore.isLoading" class="text-center text-lg text-gray-500">
          Loading products...
        </div>
        <div v-else>
          <transition-group name="fade" tag="div" class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div
              v-for="product in filteredProductItems"
              :key="product.id"
              class="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg flex flex-col items-center"
              :class="{ 'bg-red-100': isInCart(product) }"
              @click="$emit('toggleProduct', product)"
            >
              <img
                v-if="product.image"
                :src="product.image"
                alt="Product Image"
                class="w-16 h-16 rounded-full mb-2"
              />
              <img
                v-else
                :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}`"
                alt="Product Image"
                class="w-16 h-16 rounded-full mb-2"
              />
              <h3 class="font-bold text-lg text-center">{{ product.name }}</h3>
              <p class="text-lg text-gray-600">₱{{ Number(product.price).toFixed(2) }}</p>
            </div>
            <div
              v-if="searchQuery && filteredProductItems.length === 0"
              class="col-span-full text-center text-gray-500 text-lg"
            >
              No results found for "{{ searchQuery }}"
            </div>
          </transition-group>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, watch, defineEmits } from 'vue'
import { useItemStore } from '@/stores/product/item'
import CartTable from '@/components/pos/CartTable.vue'

const props = defineProps({
  searchQuery: String,
  categories: Array,
  currentCategory: String,
  breadcrumbs: Array,
  singleGlobalSingleMatch: Object,
  filteredCategories: Array,
  filteredProducts: Array,
  visibleSubcategories: Array,
  isInCart: Function,
  showGrid: Boolean,
  cart: Array,
  discountAllItemsPercent: Number,
  discountEntireSale: Number,
  subTotalBeforeGlobalDiscount: Number,
  totalCartAmount: Number
})

const emit = defineEmits([
  'selectCategory',
  'toggleProduct',
  'openItemPriceModal',
  'openItemDiscountModal',
  'removeFromCart',
  'update:discountAllItemsPercent',
  'update:discountEntireSale'
])

// For "open by product" mode
const openBy = ref('category')
function setOpenBy(mode) {
  openBy.value = mode

  if (!itemStore.isLoaded) {
    itemStore.fetchItems()
  }
}

const itemStore = useItemStore()
const productItems = computed(() =>
  itemStore.items.data.slice().sort((a, b) => a.name.localeCompare(b.name))
)

// Existing letter filter and filteredProductItems computed
const selectedLetter = ref('All')
const uniqueLetters = computed(() => {
  const letters = new Set()
  productItems.value.forEach((product) => {
    if (product.name && typeof product.name === 'string') {
      letters.add(product.name.charAt(0).toUpperCase())
    }
  })
  return Array.from(letters).sort()
})
const availableLetters = computed(() => ['All', ...uniqueLetters.value])
const filteredProductItems = computed(() => {
  let items = productItems.value
  if (selectedLetter.value !== 'All') {
    items = items.filter((product) => product.name.charAt(0).toUpperCase() === selectedLetter.value)
  }
  if (props.searchQuery) {
    const q = props.searchQuery.toLowerCase()
    items = items.filter((product) => product.name.toLowerCase().includes(q))
  }
  return items
})

// --- New Barcode/Item Entry Functionality ---
// Local state for barcode or item search when grid is hidden
const barcodeInput = ref('')
const barcodeSuggestions = computed(() => {
  const input = barcodeInput.value.trim().toLowerCase()
  if (!input) return []
  return productItems.value.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(input)
    const barcodeMatch = product.barcode ? product.barcode.toLowerCase().includes(input) : false
    const skuMatch = product.sku ? product.sku.toLowerCase().includes(input) : false
    return nameMatch || barcodeMatch || skuMatch
  })
})

// Watch the barcodeInput: if exactly one suggestion exists, auto-add it.
watch(barcodeInput, (newVal) => {
  if (newVal && barcodeSuggestions.value.length === 1) {
    // Auto-add the unique match
    const product = barcodeSuggestions.value[0]
    emit('toggleProduct', product)
    barcodeInput.value = ''
  }
})

// Also allow manual selection from suggestions
function handleBarcodeSuggestion(product) {
  emit('toggleProduct', product)
  barcodeInput.value = ''
}

onMounted(async () => {
  itemStore.fetchItems()
})
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
</style>
