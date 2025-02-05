<script setup>
import { ref } from 'vue'

import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'

// Import the two new separate views
import CategoryView from './CategoryView.vue'
import CategoryGroupView from './CategoryGroupView.vue'

const activeTab = ref('category')
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- Top Bar / Tabs -->
      <div class="flex space-x-4 border-b mb-4">
        <button
          class="px-4 py-2 font-semibold"
          :class="
            activeTab === 'category' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          "
          @click="activeTab = 'category'"
        >
          Category
        </button>
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
      </div>

      <!-- Conditionally Render Each View -->
      <CategoryView v-if="activeTab === 'category'" />
      <CategoryGroupView v-else />
    </SectionMain>
  </LayoutAuthenticated>
</template>
