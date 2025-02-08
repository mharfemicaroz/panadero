<!-- src/components/ProductGrid.vue -->
<template>
  <div>
    <!-- If exactly one product matches -->
    <div v-if="singleGlobalSingleMatch" class="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <h3 class="font-bold">{{ singleGlobalSingleMatch.name }}</h3>
        <p class="text-sm text-gray-600">₱{{ singleGlobalSingleMatch.price.toFixed(2) }}</p>
      </div>
    </div>
    <!-- Otherwise show subcategories, products, or top-level categories -->
    <transition-group v-else name="fade" tag="div" class="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}`"
          alt="Product Image"
          class="w-16 h-16 rounded-full mb-2"
        />
        <h3 class="font-bold">{{ product.name }}</h3>
        <p class="text-sm text-gray-600">₱{{ product.price.toFixed(2) }}</p>
      </div>
      <!-- Top-level Categories if no category selected -->
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
        class="col-span-full text-center text-gray-500"
      >
        No results found for "{{ searchQuery }}"
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
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
</script>
