<template>
  <!-- We wrap the entire table in a container <div> with ref="tableContainer".
       This container is where the loading overlay will appear. -->
  <div
    ref="tableContainer"
    class="table-container relative rounded-lg border border-gray-200 shadow-sm bg-white"
  >
    <!-- The actual table -->
    <table class="w-full border-collapse bg-white">
      <thead class="bg-white text-gray-700 text-sm border-b">
        <tr>
          <!-- Checkbox column if checkable -->
          <th v-if="checkable" class="p-2 w-10 text-center">
            <TableCheckboxCell :modelValue="allSelected" @update:modelValue="toggleSelectAll" />
          </th>

          <!-- Table columns -->
          <th v-for="col in columns" :key="col.key" class="px-4 py-2 text-left">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ col.label }}</span>
              <div class="flex items-center gap-2">
                <!-- Sorting button -->
                <BaseButton
                  v-if="col.sortable"
                  :icon="
                    internalSortKey === col.key
                      ? internalSortOrder === 'asc'
                        ? mdiChevronUp
                        : mdiChevronDown
                      : mdiChevronDown
                  "
                  small
                  @click="toggleSort(col.key)"
                />
                <!-- Filter button -->
                <BaseButton
                  v-if="col.filterable"
                  :icon="mdiMagnify"
                  small
                  @click="toggleFilterDropdown(col.key)"
                />
              </div>
            </div>
            <!-- Filter dropdown -->
            <transition name="fade">
              <div v-if="showFilters[col.key]" class="mt-1 p-2 border rounded bg-white shadow-md">
                <input
                  v-model="internalFilters[col.key]"
                  class="w-full px-2 py-1 text-xs border rounded"
                  placeholder="Filter..."
                  @input="setFilter(col.key, $event.target.value)"
                />
              </div>
            </transition>
          </th>

          <!-- Action column header -->
          <th class="px-4 py-2">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in safeData.data" :key="item.id" class="border-t text-sm hover:bg-gray-50">
          <!-- Checkbox cell if checkable -->
          <td v-if="checkable" class="p-2 w-10 text-center">
            <TableCheckboxCell
              :modelValue="selectedRows.has(item.id)"
              @update:modelValue="toggleSelectRow($event, item)"
            />
          </td>

          <!-- Data cells (with optional formatter) -->
          <td v-for="col in columns" :key="col.key" class="px-4 py-2">
            <span v-if="col.formatter">
              {{ col.formatter(item[col.key], item) }}
            </span>
            <span v-else>
              {{ item[col.key] || '-' }}
            </span>
          </td>

          <!-- Edit button in the Action column -->
          <td class="px-4 py-2">
            <BaseButtons>
              <BaseButton :icon="mdiPencil" small @click="editRow(item)" />
            </BaseButtons>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination Footer -->
    <div class="p-3 border-t bg-white text-sm flex justify-between items-center">
      <span>
        {{ (internalPage - 1) * internalPageSize + 1 }} -
        {{ Math.min(internalPage * internalPageSize, safeData.total) }} of
        {{ safeData.total }} items
      </span>
      <BaseButtons>
        <BaseButton
          :icon="mdiChevronLeft"
          small
          :disabled="internalPage === 1"
          @click="goToPage(internalPage - 1)"
        />
        <BaseButton
          v-for="(page, index) in paginationPages"
          :key="index"
          :active="page !== '...' && page === internalPage"
          :label="page"
          small
          :disabled="page === '...'"
          @click="page !== '...' && goToPage(page)"
        />
        <BaseButton
          :icon="mdiChevronRight"
          small
          :disabled="internalPage === totalPages"
          @click="goToPage(internalPage + 1)"
        />
      </BaseButtons>
      <select class="border p-1 text-sm rounded" @change="updatePageSize">
        <option :selected="internalPageSize === 5" value="5">5 / page</option>
        <option :selected="internalPageSize === 10" value="10">10 / page</option>
        <option :selected="internalPageSize === 20" value="20">20 / page</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, defineProps, defineEmits } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css' // import overlay styles

import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'

import {
  mdiPencil,
  mdiChevronUp,
  mdiChevronDown,
  mdiMagnify,
  mdiChevronLeft,
  mdiChevronRight
} from '@mdi/js'

// Props
const props = defineProps({
  columns: Array,
  data: {
    type: Object,
    default: () => ({
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
      data: []
    })
  },
  checkable: Boolean,
  /**
   * Pass a boolean from the parent to show/hide the loading overlay.
   */
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['query-change', 'selected', 'sort', 'filter', 'edit'])

// A reference to the table container div
const tableContainer = ref(null)

// Use the useLoading() composable from vue-loading-overlay
const $loading = useLoading()
const loaderInstance = ref(null)

// Watch the `loading` prop. Show or hide the overlay accordingly.
watch(
  () => props.loading,
  (newVal) => {
    if (newVal) {
      // Show loader if not already shown
      if (!loaderInstance.value) {
        loaderInstance.value = $loading.show({
          container: tableContainer.value, // Over the table container only
          canCancel: false,
          isFullPage: false, // set `true` if you want the entire page
          color: '#3b82f6',
          opacity: 0.8
          // ...other options see docs
        })
      }
    } else {
      // Hide loader if it was showing
      if (loaderInstance.value) {
        loaderInstance.value.hide()
        loaderInstance.value = null
      }
    }
  },
  { immediate: true }
)

// Hide any active loader on unmount
onBeforeUnmount(() => {
  if (loaderInstance.value) {
    loaderInstance.value.hide()
    loaderInstance.value = null
  }
})

/* ------------------
   TABLE LOGIC BELOW
------------------ */
// Internal pagination state
const internalPage = ref(props.data.currentPage || 1)
const internalPageSize = ref(props.data.pageSize || 10)

// Sort and Filter
const internalSortKey = ref(null)
const internalSortOrder = ref('desc')
const internalFilters = ref({})

// Show filter dropdown
const showFilters = ref({})

// Keep track of selected rows
const selectedRows = ref(new Set())

// Whenever props.data's currentPage/pageSize changes, sync our internal state
watch(
  () => props.data.currentPage,
  (newVal) => {
    internalPage.value = newVal || 1
  }
)
watch(
  () => props.data.pageSize,
  (newVal) => {
    internalPageSize.value = newVal || 10
  }
)

// Safe data fallback
const safeData = computed(
  () =>
    props.data || {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
      data: []
    }
)

// Filtered items (if you also do client-side filtering)
const filteredItems = computed(() => {
  return safeData.value.data.filter((item) => {
    return Object.keys(internalFilters.value).every((key) => {
      if (!internalFilters.value[key]) return true
      return item[key]?.toString().toLowerCase().includes(internalFilters.value[key].toLowerCase())
    })
  })
})

const allSelected = computed(
  () => selectedRows.value.size === filteredItems.value.length && filteredItems.value.length > 0
)

// Calculate total pages (in case you also do client-side pagination)
const totalPages = computed(() => {
  return safeData.value.totalPages || Math.ceil(safeData.value.total / internalPageSize.value) || 1
})

// Pagination pages with ellipses
const paginationPages = computed(() => {
  const total = totalPages.value
  const current = internalPage.value
  const delta = 2
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    let left = Math.max(2, current - delta)
    let right = Math.min(total - 1, current + delta)
    if (left > 2) {
      pages.push('...')
    }
    for (let i = left; i <= right; i++) {
      pages.push(i)
    }
    if (right < total - 1) {
      pages.push('...')
    }
    pages.push(total)
  }
  return pages
})

// Emit query changes to parent
const updateQuery = () => {
  emit('query-change', {
    page: internalPage.value,
    limit: internalPageSize.value,
    sort: internalSortKey.value,
    order: internalSortOrder.value,
    filters: internalFilters.value
  })
}

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    internalPage.value = page
    updateQuery()
  }
}

const updatePageSize = (event) => {
  internalPageSize.value = Number(event.target.value)
  internalPage.value = 1
  updateQuery()
}

// Sorting
const toggleSort = (key) => {
  if (internalSortKey.value === key) {
    internalSortOrder.value = internalSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    internalSortKey.value = key
    internalSortOrder.value = 'desc'
  }
  emit('sort', { key: internalSortKey.value, order: internalSortOrder.value })
  updateQuery()
}

// Filtering
const toggleFilterDropdown = (key) => {
  showFilters.value[key] = !showFilters.value[key]
}

const setFilter = (key, value) => {
  internalFilters.value[key] = value
  emit('filter', internalFilters.value)
  updateQuery()
}

// Selection
const toggleSelectAll = (checked) => {
  if (checked) {
    selectedRows.value = new Set(filteredItems.value.map((item) => item.id))
  } else {
    selectedRows.value.clear()
  }
  emit('selected', Array.from(selectedRows.value))
}

const toggleSelectRow = (checked, row) => {
  if (checked) {
    selectedRows.value.add(row.id)
  } else {
    selectedRows.value.delete(row.id)
  }
  emit('selected', Array.from(selectedRows.value))
}

// Edit Row
const editRow = (item) => {
  emit('edit', item)
}
</script>

<style scoped>
/* Example fade transition (optional) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
