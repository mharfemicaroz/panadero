<!-- src/components/ProductGrid.vue -->
<template>
  <div>
    <!-- Toggle Button for Product Grid Visibility -->
    <div class="mb-2 text-center">
      <button
        @click="toggleGrid"
        class="px-3 py-1 bg-blue-500 text-white rounded text-xs focus:outline-none"
      >
        {{ showGrid ? 'Hide Products' : 'Show Products' }}
      </button>
    </div>

    <div v-if="showGrid">
      <!-- If exactly one product matches -->
      <div v-if="singleGlobalSingleMatch" class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div
          class="p-2 bg-white rounded shadow cursor-pointer hover:shadow-lg flex flex-col items-center"
          :class="{ 'bg-red-100': isInCart(singleGlobalSingleMatch) }"
          @click="$emit('toggleProduct', singleGlobalSingleMatch)"
        >
          <img
            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(
              singleGlobalSingleMatch.name
            )}`"
            alt="Product Image"
            class="w-12 h-12 rounded-full mb-1"
          />
          <h3 class="font-bold text-xs text-center">{{ singleGlobalSingleMatch.name }}</h3>
          <p class="text-xs text-gray-600">₱{{ singleGlobalSingleMatch.price.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Otherwise show subcategories, products, or top-level categories -->
      <transition-group v-else name="fade" tag="div" class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <!-- Subcategories -->
        <div
          v-if="visibleSubcategories.length"
          v-for="subcategory in visibleSubcategories"
          :key="subcategory.name"
          class="p-2 bg-white rounded shadow cursor-pointer hover:shadow-lg text-center"
          @click="$emit('selectCategory', subcategory)"
        >
          <h2 class="text-xs font-bold">{{ subcategory.name }}</h2>
        </div>
        <!-- Products -->
        <div
          v-if="filteredProducts.length"
          v-for="product in filteredProducts"
          :key="product.id"
          class="p-2 bg-white rounded shadow cursor-pointer hover:shadow-lg flex flex-col items-center"
          :class="{ 'bg-red-100': isInCart(product) }"
          @click="$emit('toggleProduct', product)"
        >
          <img
            v-if="product.image"
            :src="product.image"
            alt="Product Image"
            class="w-12 h-12 rounded-full mb-1"
          />
          <img
            v-else
            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}`"
            alt="Product Image"
            class="w-12 h-12 rounded-full mb-1"
          />
          <h3 class="font-bold text-xs text-center">{{ product.name }}</h3>
          <p class="text-xs text-gray-600">₱{{ product.price.toFixed(2) }}</p>
        </div>
        <!-- Top-level Categories if no category is selected -->
        <div
          v-if="!currentCategory"
          v-for="category in filteredCategories"
          :key="category.name"
          class="p-2 bg-white rounded shadow cursor-pointer hover:shadow-lg text-center"
          @click="$emit('selectCategory', category)"
        >
          <h2 class="text-xs font-bold">{{ category.name }}</h2>
        </div>
        <!-- No results found -->
        <div
          v-if="
            searchQuery &&
            !filteredCategories.length &&
            !filteredProducts.length &&
            !visibleSubcategories.length
          "
          class="col-span-full text-center text-gray-500 text-xs"
        >
          No results found for "{{ searchQuery }}"
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

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
