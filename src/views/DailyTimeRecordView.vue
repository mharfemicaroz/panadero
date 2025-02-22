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
      <!-- Left Side: Timelog Table -->
      <div class="w-full md:w-2/3 p-4">
        <div class="bg-white rounded shadow p-4 h-full">
          <NotificationBar v-if="timeLogStore.error" :icon="mdiAlertCircle" color="danger">
            {{ timeLogStore.error }}
          </NotificationBar>

          <SectionTitleLineWithButton :icon="mdiTableBorder" title="Timelogs" main>
            <div class="flex items-center gap-2">
              <!-- Delete selected timelogs button (if needed) -->
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
          <div class="relative flex flex-col items-center mb-4">
            <!-- Video element -->
            <video
              ref="videoRef"
              class="border border-gray-300 rounded"
              width="640"
              height="320"
              autoplay
              playsinline
            ></video>

            <!-- Canvas overlay (for face landmarks, bounding box, and info) -->
            <canvas ref="canvasRef" class="absolute top-0 left-0" width="640" height="320"></canvas>
          </div>

          <div class="mt-2">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              @click="startCamera"
            >
              Start Camera
            </button>
          </div>

          <!-- Removed the extra div for face data -->
          <!-- Now all face info is drawn on the canvas -->

          <!-- Time In/Out Button Panel -->
          <div class="flex flex-col items-center md:items-start mt-4">
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
/* 
  1) Ensure you have face-api.js installed: npm install face-api.js
  2) Place face-api.js model folders (tiny_face_detector, face_landmark_68, 
     face_recognition, face_expression, age_gender) inside /public/models/ or 
     adjust the loadFromUri path below.
*/

import { ref, onMounted, computed, watch } from 'vue'
import * as faceapi from 'face-api.js'

// Import your Pinia store for timelogs
import { useTimeLogStore } from '@/stores/hr/timeLogStore'

// Import any components used in the template
import BaseTable from '@/components/BaseTable.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'

// Import icons from @mdi/js
import { mdiAlertCircle, mdiTableBorder, mdiDelete } from '@mdi/js'

// Hard-coded employee ID for demonstration
const employeeId = ref(1)
const timeLogStore = useTimeLogStore()

// Reactive states
const timeString = ref('')
const dateString = ref('')
const mode = ref('time_in') // or 'time_out'
const matchedEmployee = ref(null)
const matchedDistance = ref(0)
const selectedTimelogs = ref([])

// Face detection references
const videoRef = ref(null)
const canvasRef = ref(null)
// Removed faceData display div; info will be drawn on the canvas

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
onMounted(async () => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
  setDefaultMode()
  fetchDailyLogs()

  // Load face-api models from the specified subfolders
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector')
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68')
  await faceapi.nets.faceExpressionNet.loadFromUri('/models/face_expression')
  await faceapi.nets.ageGenderNet.loadFromUri('/models/age_gender_model')
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition')

  console.log('face-api.js models loaded (client-side).')
})

// Auto-hide matched employee notification after 10 seconds
watch(matchedEmployee, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      matchedEmployee.value = null
      matchedDistance.value = 0
    }, 10000)
  }
})

/* --------------- Table & Timelog Methods --------------- */
const handleQueryChange = async (query) => {
  await timeLogStore.getDailyLogs(employeeId.value, query, true)
}

const handleSelected = (selectedItems) => {
  selectedTimelogs.value = selectedItems
}

const handleEditTimelog = (item) => {
  console.log('Edit timelog:', item)
}

async function deleteSelectedTimelogs() {
  if (!selectedTimelogs.value.length) return
  alert(`Deleting ${selectedTimelogs.value.length} selected timelogs`)
}

async function fetchDailyLogs() {
  await timeLogStore.getDailyLogs(employeeId.value, { page: 1, limit: 5 }, true)
}

/* --------------- Mode & Time Helpers --------------- */
function setDefaultMode() {
  const now = new Date()
  const totalMinutes = now.getHours() * 60 + now.getMinutes()

  if (totalMinutes === 0) {
    mode.value = 'time_in'
  } else if (totalMinutes >= 1 && totalMinutes <= 30) {
    mode.value = 'time_out'
  } else if (totalMinutes >= 31 && totalMinutes < 480) {
    mode.value = 'time_in'
  } else if (totalMinutes >= 480 && totalMinutes <= 720) {
    mode.value = 'time_in'
  } else if (totalMinutes >= 721 && totalMinutes <= 750) {
    mode.value = 'time_out'
  } else if (totalMinutes >= 751 && totalMinutes <= 1020) {
    mode.value = 'time_in'
  } else if (totalMinutes >= 1021 && totalMinutes <= 1050) {
    mode.value = 'time_out'
  } else if (totalMinutes >= 1051 && totalMinutes < 1440) {
    mode.value = 'time_in'
  } else {
    mode.value = 'time_in'
  }
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

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

const modeLabel = computed(() => (mode.value === 'time_in' ? 'Time In' : 'Time Out'))

/* --------------- Face Detection & Camera --------------- */
function startCamera() {
  if (videoRef.value) {
    videoRef.value.setAttribute('crossOrigin', 'anonymous')
  }
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoRef.value.srcObject = stream
      videoRef.value.play()
      videoRef.value.onloadedmetadata = () => {
        const { videoWidth, videoHeight } = videoRef.value
        const canvas = canvasRef.value
        canvas.width = videoWidth
        canvas.height = videoHeight
        detectFacesLoop()
      }
    })
    .catch((err) => {
      console.error('Error accessing camera:', err)
    })
}

async function detectFacesLoop() {
  if (!videoRef.value || videoRef.value.paused || videoRef.value.ended) return

  // 1) Detect faces + age/gender/expressions
  const detections = await faceapi
    .detectAllFaces(videoRef.value, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender()

  // 2) Clear the canvas
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 3) Resize results to match the display
  const displaySize = { width: canvas.width, height: canvas.height }
  const resizedDetections = faceapi.resizeResults(detections, displaySize)

  // 4) (Optional) If you want to display FPS, measure time here

  // 5) For each face, draw bounding box, text labels, and landmark points
  for (const person of resizedDetections) {
    const box = person.detection.box

    // --- Draw bounding box (deepskyblue, semi-transparent) ---
    ctx.lineWidth = 3
    ctx.strokeStyle = 'deepskyblue'
    ctx.fillStyle = 'deepskyblue'
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.rect(box.x, box.y, box.width, box.height)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Sort expressions by probability so the first is the highest
    const sortedExpr = Object.entries(person.expressions).sort((a, b) => b[1] - a[1])
    const topExpr = sortedExpr[0] // e.g. ['neutral', 0.99]

    // We'll round age and expression probability for display
    const genderLine = `Gender: ${Math.round(person.genderProbability * 100)}% ${person.gender}`
    const expressionLine = `Expression: ${Math.round(topExpr[1] * 100)}% ${topExpr[0]}`
    const ageLine = `Age: ${Math.round(person.age)} years`
    // If you want angles, you'd have to compute them yourself or remove them:
    // const angleLine = `roll: ? pitch: ? yaw: ?`

    // Draw text in black first (slightly higher Y) for a 'shadow' effect
    ctx.fillStyle = 'black'
    ctx.font = '16px "Segoe UI"'
    ctx.fillText(genderLine, box.x, box.y - 59)
    ctx.fillText(expressionLine, box.x, box.y - 41)
    ctx.fillText(ageLine, box.x, box.y - 23)
    // ctx.fillText(angleLine, box.x, box.y - 5) // if you had angles

    // Draw the same text in lightblue, offset by 1 pixel in Y
    ctx.fillStyle = 'lightblue'
    ctx.fillText(genderLine, box.x, box.y - 60)
    ctx.fillText(expressionLine, box.x, box.y - 42)
    ctx.fillText(ageLine, box.x, box.y - 24)
    // ctx.fillText(angleLine, box.x, box.y - 6)

    // --- Draw landmark points in lightblue ---
    ctx.globalAlpha = 0.8
    ctx.fillStyle = 'lightblue'
    const pointSize = 2
    for (let i = 0; i < person.landmarks.positions.length; i++) {
      const { x, y } = person.landmarks.positions[i]
      ctx.beginPath()
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  // 6) Repeat on next frame
  requestAnimationFrame(detectFacesLoop)
}

function topExpression(expressions) {
  if (!expressions) return ''
  let best = { expression: '', probability: 0 }
  for (const [expr, prob] of Object.entries(expressions)) {
    if (prob > best.probability) best = { expression: expr, probability: prob }
  }
  return `${best.expression} (${(best.probability * 100).toFixed(1)}%)`
}

/* --------------- Time In/Out with Face Verification --------------- */
async function captureImage() {
  const canvasElem = document.createElement('canvas')
  canvasElem.width = videoRef.value.videoWidth
  canvasElem.height = videoRef.value.videoHeight
  const ctx = canvasElem.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0)
  return canvasElem.toDataURL('image/jpeg')
}

async function recordTime() {
  const base64Image = await captureImage()
  const response = await timeLogStore.faceVerifyTimeLog(base64Image, mode.value)
  if (timeLogStore.error) {
    matchedEmployee.value = null
    matchedDistance.value = 0
  } else {
    if (response.message === 'Match found') {
      matchedEmployee.value = response.employee
      matchedDistance.value = response.distance
      employeeId.value = response.employee.id
    } else {
      matchedEmployee.value = null
      matchedDistance.value = 0
    }
    fetchDailyLogs()
  }
}
</script>

<style scoped>
.relative {
  position: relative;
}
canvas {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
