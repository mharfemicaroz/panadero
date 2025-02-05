<script setup>
import { computed, ref, watch, defineProps, defineEmits } from 'vue'
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
   * NEW: `loading` prop to indicate when data is being fetched
   */
  loading: {
    type: Boolean,
    default: false
  }
})

// Emit events to the parent
const emit = defineEmits(['query-change', 'selected', 'sort', 'filter', 'edit'])

// --- Internal state for table controls ---
const internalPage = ref(props.data.currentPage || 1)
const internalPageSize = ref(props.data.pageSize || 10)
const internalSortKey = ref(null)
const internalSortOrder = ref('desc')
const internalFilters = ref({})

// Object to control display of filter inputs per column
const showFilters = ref({})

// Watch data changes
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

const safeData = computed(() => props.data)

// --- Selection state ---
const selectedRows = ref(new Set())

// Filtering: apply internalFilters to data
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

// --- Pagination logic ---
const totalPages = computed(() => {
  return safeData.value.totalPages || Math.ceil(safeData.value.total / internalPageSize.value) || 1
})

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

// --- Emit updated query ---
const updateQuery = () => {
  emit('query-change', {
    page: internalPage.value,
    limit: internalPageSize.value,
    sort: internalSortKey.value,
    order: internalSortOrder.value,
    filters: internalFilters.value
  })
}

// --- Methods ---
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

const setFilter = (key, value) => {
  internalFilters.value[key] = value
  emit('filter', internalFilters.value)
  updateQuery()
}

const toggleFilterDropdown = (key) => {
  showFilters.value[key] = !showFilters.value[key]
}

// --- Selection methods ---
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

// --- Edit Row ---
const editRow = (item) => {
  emit('edit', item)
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 shadow-sm bg-white relative">
    <!-- Overlay or placeholder when loading is true -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10"
    >
      <Loading
        :active="loading"
        :can-cancel="false"
        :is-full-page="false"
        :color="'#3b82f6'"
        :height="64"
        :width="64"
        class="z-10"
      >
      </Loading>
    </div>

    <!-- You can also dim the table with opacity if loading, up to your preference -->
    <table class="w-full border-collapse bg-white" :class="{ 'opacity-50': loading }">
      <thead class="bg-white text-gray-700 text-sm border-b">
        <tr>
          <th v-if="checkable" class="p-2 w-10 text-center">
            <TableCheckboxCell :modelValue="allSelected" @update:modelValue="toggleSelectAll" />
          </th>

          <th v-for="col in columns" :key="col.key" class="px-4 py-2 text-left">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ col.label }}</span>
              <div class="flex items-center gap-2">
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
          <th class="px-4 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <!-- Render table rows as usual -->
        <tr v-for="item in safeData.data" :key="item.id" class="border-t text-sm hover:bg-gray-50">
          <td v-if="checkable" class="p-2 w-10 text-center">
            <TableCheckboxCell
              :modelValue="selectedRows.has(item.id)"
              @update:modelValue="toggleSelectRow($event, item)"
            />
          </td>
          <td v-for="col in columns" :key="col.key" class="px-4 py-2">
            <span v-if="col.formatter">
              {{ col.formatter(item[col.key], item) }}
            </span>
            <span v-else>
              {{ item[col.key] || '-' }}
            </span>
          </td>

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
