<template>
  <div class="bg-[#f8f8f8] min-h-screen flex flex-col">
    <!-- Header with Current Time and Date -->
    <div class="bg-red-500 text-white text-center py-4">
      <div class="text-3xl font-bold">{{ timeString }}</div>
      <div class="text-sm">{{ dateString }}</div>
    </div>

    <!-- Matched Employee Notification (auto-hidden after 10 seconds) -->
    <div class="p-4" v-if="matchedEmployee">
      <div
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
      >
        <strong class="font-bold">Match Found!</strong>
        <span class="block">
          Employee: {{ matchedEmployee.first_name }} {{ matchedEmployee.last_name }} (ID:
          {{ matchedEmployee.id }})
        </span>
        <span class="block">Distance: {{ matchedDistance.toFixed(2) }}</span>
      </div>
    </div>

    <div class="flex-1 flex flex-col md:flex-row">
      <!-- Left Side: Timelog Table using BaseTable -->
      <div class="w-full md:w-2/3 p-4">
        <div class="bg-white rounded shadow p-4 h-full">
          <NotificationBar v-if="timeLogStore.error" :icon="mdiAlertCircle" color="danger">
            {{ timeLogStore.error }}
          </NotificationBar>

          <SectionTitleLineWithButton :icon="mdiTableBorder" title="Timelogs" main>
            <div class="flex items-center gap-2">
              <!-- (Optional) Add a New Timelog button if needed -->
              <BaseButton
                v-if="selectedTimelogs.length"
                :icon="mdiDelete"
                color="danger"
                label="Delete"
                @click="deleteSelectedTimelogs"
              />
            </div>
          </SectionTitleLineWithButton>

          <CardBox class="mb-6">
            <BaseTable
              :columns="tableColumns"
              :data="timelogsData"
              :loading="timeLogStore.isLoading"
              checkable
              :show-action="false"
              @query-change="handleQueryChange"
              @selected="handleSelected"
              @edit="handleEditTimelog"
            />
          </CardBox>
        </div>
      </div>

      <!-- Right Side: Camera & Time In/Out Panel -->
      <div class="w-full md:w-1/3 p-4">
        <div class="bg-white rounded shadow p-4 h-full flex flex-col">
          <!-- Webcam / Face Capture -->
          <div class="flex flex-col items-center md:items-start mb-4">
            <video
              ref="videoRef"
              class="border border-gray-300 rounded"
              width="560"
              height="240"
              autoplay
              playsinline
            ></video>
            <div class="mt-2">
              <button
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                @click="startCamera"
              >
                Start Camera
              </button>
            </div>
          </div>

          <!-- Time In/Out Button Panel -->
          <div class="flex flex-col items-center md:items-start">
            <div class="text-xl font-semibold mb-2">
              {{ modeLabel }}: {{ formatTime(new Date()) }}
            </div>
            <button
              :class="[
                mode === 'time_in'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700',
                'text-white px-4 py-2 rounded font-semibold'
              ]"
              @click="recordTime"
            >
              {{ modeLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useTimeLogStore } from '@/stores/hr/timeLogStore'
import BaseTable from '@/components/BaseTable.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiAlertCircle, mdiTableBorder, mdiDelete } from '@mdi/js'

// Hard-coded employee ID for demo purposes
const employeeId = ref(1)
const timeLogStore = useTimeLogStore()

// Reactive state
const timeString = ref('')
const dateString = ref('')
const mode = ref('time_in') // or 'time_out'
const matchedEmployee = ref(null)
const matchedDistance = ref(0)
const qrCodeInput = ref('')
const selectedTimelogs = ref([])

// Refs
const videoRef = ref(null)

// Table columns for timelogs
const tableColumns = [
  {
    key: 'employee_id',
    label: "Employee's Name",
    sortable: true,
    formatter: (value, row) =>
      row.employee ? row.employee.first_name + ' ' + row.employee.last_name : ''
  },
  { key: 'type', label: 'Type', sortable: true },
  {
    key: 'log_time',
    label: 'Log Time',
    sortable: true,
    formatter: (value) => formatTime(value)
  }
]

// Computed: timelogs data from store
const timelogsData = computed(() => ({
  total: timeLogStore.items?.total || 0,
  totalPages: timeLogStore.items?.totalPages || 1,
  currentPage: timeLogStore.items?.currentPage || 1,
  pageSize: timeLogStore.items?.pageSize || 5,
  data: timeLogStore.items?.data || []
}))

// Lifecycle
onMounted(() => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
  setDefaultMode()
  fetchDailyLogs()
})

// Auto hide the matched employee notification after 10 seconds
watch(matchedEmployee, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      matchedEmployee.value = null
      matchedDistance.value = 0
    }, 10000)
  }
})

// --- Table Events ---
const handleQueryChange = async (query) => {
  await timeLogStore.getDailyLogs(employeeId.value, query, true)
}

const handleSelected = (selectedItems) => {
  selectedTimelogs.value = selectedItems
}

const handleEditTimelog = (item) => {
  // (Optional) Implement editing functionality if needed.
  console.log('Edit timelog:', item)
}

async function deleteSelectedTimelogs() {
  if (!selectedTimelogs.value.length) return
  // (Optional) Implement deletion logic similar to your category view.
  alert(`Deleting ${selectedTimelogs.value.length} selected timelogs`)
}

// Fetch daily logs from the store
async function fetchDailyLogs() {
  await timeLogStore.getDailyLogs(employeeId.value, { page: 1, limit: 5 }, true)
}

// Determine default mode based on time of day using detailed schedule
function setDefaultMode() {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const totalMinutes = hour * 60 + minute
  // mode.value='time_out'
  if (totalMinutes === 0) {
    mode.value = 'time_in'
  }
  // 12:01 AM – 12:30 AM => time out (minutes 1–30)
  else if (totalMinutes >= 1 && totalMinutes <= 30) {
    mode.value = 'time_out'
  }
  // 12:31 AM – 7:59 AM => time in (minutes 31–479)
  else if (totalMinutes >= 31 && totalMinutes < 480) {
    mode.value = 'time_in'
  }
  // 8:00 AM – 12:00 NN => time in (480–720)
  else if (totalMinutes >= 480 && totalMinutes <= 720) {
    mode.value = 'time_in'
  }
  // 12:01 NN – 12:30 NN => time out (721–750)
  else if (totalMinutes >= 721 && totalMinutes <= 750) {
    mode.value = 'time_out'
  }
  // 12:31 PM – 5:00 PM => time in (751–1020)
  else if (totalMinutes >= 751 && totalMinutes <= 1020) {
    mode.value = 'time_in'
  }
  // 5:01 PM – 5:30 PM => time out (1021–1050)
  else if (totalMinutes >= 1021 && totalMinutes <= 1050) {
    mode.value = 'time_out'
  }
  // 5:31 PM – 11:59 PM => time in (1051–1439)
  else if (totalMinutes >= 1051 && totalMinutes < 1440) {
    mode.value = 'time_in'
  } else {
    mode.value = 'time_in'
  }
}

// Format time as HH:MM
function formatTime(date) {
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Format date
function formatDate(date) {
  const d = new Date(date)
  return d.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Derived label for the button
const modeLabel = computed(() => (mode.value === 'time_in' ? 'Time In' : 'Time Out'))

// Update current time and date
function updateDateTime() {
  const now = new Date()
  timeString.value = now.toLocaleTimeString([], { hour12: true })
  dateString.value = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

// Start the webcam
function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoRef.value.srcObject = stream
    })
    .catch((err) => {
      console.error('Error accessing camera:', err)
    })
}

// Capture image from the video as a Base64 string
async function captureImage() {
  const canvasElem = document.createElement('canvas')
  canvasElem.width = videoRef.value.videoWidth
  canvasElem.height = videoRef.value.videoHeight
  const ctx = canvasElem.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0)
  return canvasElem.toDataURL('image/jpeg')
}

// Record time using face verification
async function recordTime() {
  const base64Image = await captureImage()
  const response = await timeLogStore.faceVerifyTimeLog(base64Image, mode.value)

  if (timeLogStore.error) {
    // alert('Error: ' + timeLogStore.error)
    matchedEmployee.value = null
    matchedDistance.value = 0
  } else {
    if (response.message === 'Match found') {
      matchedEmployee.value = response.employee
      matchedDistance.value = response.distance
      employeeId.value = response.employee.id

      //   alert(
      //     `Match found for Employee ID ${
      //       response.employee.id
      //     } with distance ${response.distance.toFixed(2)}. Time log recorded.`
      //   )
    } else {
      matchedEmployee.value = null
      matchedDistance.value = 0
      //   alert(response.message || 'No match found')
    }
    fetchDailyLogs()
  }
}
</script>

<style scoped>
/* Add any extra Tailwind classes or overrides here */
</style>
