<!-- src/components/ProductGrid.vue -->
<template>
  <div>
    <!-- Sticky Header for toggles and letter filter -->
    <div class="sticky top-0 z-50 bg-white shadow p-2">
      <!-- Toggle to choose view mode -->
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

      <!-- Toggle Button for Product Grid Visibility -->
      <div class="mb-2 text-center">
        <button
          @click="toggleGrid"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg text-lg focus:outline-none"
        >
          {{ showGrid ? 'Hide Products' : 'Show Products' }}
        </button>
      </div>

      <!-- Letter Filter Row for Product View -->
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

    <!-- Product Grid Content -->
    <div v-if="showGrid">
      <!-- Category View -->
      <template v-if="openBy === 'category'">
        <!-- If exactly one product matches -->
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

        <!-- Otherwise show subcategories, products, or top-level categories -->
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
import { ref, computed, defineProps } from 'vue'
import { useItemStore } from '@/stores/product/item'

const props = defineProps({
  searchQuery: String,
  categories: Array,
  currentCategory: String,
  breadcrumbs: Array,
  singleGlobalSingleMatch: Object,
  filteredCategories: Array,
  filteredProducts: Array,
  visibleSubcategories: Array,
  isInCart: Function
})

// Toggle to show/hide the entire product grid
const showGrid = ref(true)
function toggleGrid() {
  showGrid.value = !showGrid.value
}

// New toggle for view mode: 'category' (default) or 'product'
const openBy = ref('category')
function setOpenBy(mode) {
  openBy.value = mode
  if (mode === 'product') {
    // Fetch products from the product store if not already loaded
    if (!itemStore.isLoaded) {
      itemStore.fetchItems()
    }
  }
}

// Import the product store for "open by product" mode
const itemStore = useItemStore()
const productItems = computed(() =>
  itemStore.items.data.slice().sort((a, b) => a.name.localeCompare(b.name))
)

// --- Letter Filter for Product Store View ---
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
