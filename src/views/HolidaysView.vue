<script setup>
import { ref, getCurrentInstance, onMounted, watch, onBeforeUnmount } from 'vue'
import LayoutAuthenticated from '../layouts/LayoutAuthenticatedX.vue'
import SectionMain from '../components/SectionMain.vue'
import NotificationBar from '../components/NotificationBar.vue'
import CardBox from '../components/CardBox.vue'
import SectionTitleLineWithButton from '../components/SectionTitleLineWithButton.vue'
import BaseButton from '../components/BaseButton.vue'

// Import and configure the loading overlay
import { useLoading } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
const $loading = useLoading()
const loaderInstance = ref(null)
const tableContainer = ref(null)

const holidays = ref([])
const loading = ref(false)
const error = ref(null)
const selectedYear = ref(new Date().getFullYear())

const { appContext } = getCurrentInstance()
const API_URL = appContext.config.globalProperties.API_URL || ''

// --- FUNCTION: Fetch Holidays ---
async function fetchHolidays() {
  error.value = null
  loading.value = true
  try {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${selectedYear.value}/PH`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`)
    }
    holidays.value = await res.json()
  } catch (err) {
    error.value = err.message || 'Failed to fetch holidays'
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  fetchHolidays()
}

onMounted(() => {
  fetchHolidays()
})

// --- Loading Overlay Watch ---
// When `loading` changes, display or hide the loading overlay.
watch(
  () => loading.value,
  (newVal) => {
    if (newVal) {
      if (!loaderInstance.value) {
        loaderInstance.value = $loading.show({
          container: tableContainer.value,
          canCancel: false,
          isFullPage: false,
          color: '#3b82f6',
          opacity: 0.8
        })
      }
    } else {
      if (loaderInstance.value) {
        loaderInstance.value.hide()
        loaderInstance.value = null
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (loaderInstance.value) {
    loaderInstance.value.hide()
    loaderInstance.value = null
  }
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <NotificationBar v-if="error" color="danger">
        {{ error }}
      </NotificationBar>

      <SectionTitleLineWithButton title="Public Holidays" main>
        <!-- Read-only view: no add/edit/delete actions -->
      </SectionTitleLineWithButton>

      <!-- Filters Section -->
      <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              v-model.number="selectedYear"
              class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <BaseButton label="Load Holidays" color="blue" class="px-4 py-2" @click="applyFilters" />
        </div>
      </div>

      <!-- Holidays Table wrapped in a container with a ref for the loader -->
      <CardBox class="mb-6" ref="tableContainer">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Holiday
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(holiday, index) in holidays" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ holiday.date }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ holiday.localName }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="holidays.length === 0 && !loading" class="p-4 text-center text-gray-500">
          No holidays found.
        </div>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
