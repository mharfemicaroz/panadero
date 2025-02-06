<script setup>
import { ref } from 'vue'

import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'

// Import views
import CategoryView from './CategoryView.vue'
import CategoryGroupView from './CategoryGroupView.vue'
import SubcategoryView from './SubCategoryView.vue'

const activeTab = ref('category_group')
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- Top Bar / Tabs -->
      <div class="flex space-x-4 border-b mb-4">
        <!-- Category Group Tab -->
        <button
          class="px-4 py-2 font-semibold"
          :class="
            activeTab === 'category_group'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          "
          @click="activeTab = 'category_group'"
        >
          Category Group
        </button>

        <!-- Category Tab -->
        <button
          class="px-4 py-2 font-semibold"
          :class="
            activeTab === 'category' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          "
          @click="activeTab = 'category'"
        >
          Category
        </button>

        <!-- Subcategory Tab -->
        <button
          class="px-4 py-2 font-semibold"
          :class="
            activeTab === 'subcategory'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          "
          @click="activeTab = 'subcategory'"
        >
          Subcategory
        </button>
      </div>

      <!-- Conditionally Render Each View -->
      <CategoryGroupView v-if="activeTab === 'category_group'" />
      <CategoryView v-else-if="activeTab === 'category'" />
      <SubcategoryView v-else-if="activeTab === 'subcategory'" />
    </SectionMain>
  </LayoutAuthenticated>
</template>
