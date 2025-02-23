<template>
  <div class="app-container bg-[#f8f8f8] min-h-screen flex flex-col">
    <!-- Header with Logo and Current Time/Date -->
    <header class="bg-red-500 text-white py-4" role="banner">
      <div class="container mx-auto flex items-center justify-between px-4">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <img src="../../public/logo.png" alt="Panadero Logo" class="mx-2" width="45" />
          <b class="font-black text-2xl">Panadero</b>
        </div>
        <!-- Current Time and Date -->
        <div class="text-right">
          <div class="text-3xl font-bold">{{ timeString }}</div>
          <div class="text-sm">{{ dateString }}</div>
        </div>
      </div>
    </header>

    <div class="flex-1 flex flex-col md:flex-row">
      <!-- Left Side: Timelog Table -->
      <div class="w-full md:w-2/3 p-4" ref="tableContainer">
        <div class="bg-white rounded shadow p-4 h-full">
          <NotificationBar v-if="timeLogStore.error" :icon="mdiAlertCircle" color="danger">
            {{ timeLogStore.error }}
          </NotificationBar>

          <SectionTitleLineWithButton :icon="mdiTableBorder" title="Timelogs" main>
            <div class="flex items-center gap-2">
              <BaseButton
                v-if="selectedTimelogs.length"
                :icon="mdiDelete"
                color="danger"
                label="Delete"
                @click="deleteSelectedTimelogs"
                aria-label="Delete selected timelogs"
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

      <!-- Right Side: Camera & Live Liveness Check Panel -->
      <div class="w-full md:w-1/3 p-4">
        <!-- Camera Container with Fullscreen Support -->
        <div
          ref="cameraContainerRef"
          class="bg-white rounded shadow p-4 h-full flex flex-col"
          role="region"
          aria-label="Camera Feed"
        >
          <div class="relative w-full mb-4" style="padding-top: 75%">
            <!-- Video Element -->
            <video
              ref="videoRef"
              class="absolute inset-0 w-full h-full border border-gray-300 rounded"
              autoplay
              playsinline
            ></video>
            <!-- Canvas Overlay -->
            <canvas
              ref="canvasRef"
              class="absolute inset-0 w-full h-full pointer-events-none"
            ></canvas>
          </div>

          <!-- Current Mode Display -->
          <div class="flex justify-center mt-2">
            <div class="text-xl font-semibold">{{ modeLabel }}</div>
          </div>

          <!-- Verification Button -->
          <div class="flex justify-center mt-2">
            <button
              @click="verifyAttendance"
              :disabled="isProcessing"
              aria-label="Verify My Attendance"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-300 flex items-center"
            >
              <span v-if="isProcessing" class="spinner mr-2"></span>
              Verify My Attendance
            </button>
          </div>
          <!-- New Manual Time In/Out Buttons -->
          <div class="flex justify-center mt-4 space-x-2">
            <button
              @click="manualTimeIn"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
              aria-label="Manual Time In"
            >
              Manual Time In
            </button>
            <button
              @click="manualTimeOut"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
              aria-label="Manual Time Out"
            >
              Manual Time Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Matched Employee Notification -->
    <transition name="fade">
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
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import * as faceapi from '@vladmandic/face-api'
import { useTimeLogStore } from '@/stores/hr/timeLogStore'
import BaseTable from '@/components/BaseTable.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiAlertCircle, mdiTableBorder, mdiDelete } from '@mdi/js'
import { useLoading } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

// Global store and reactive variables
const timeLogStore = useTimeLogStore()
const employeeId = ref(1)
const timeString = ref('')
const dateString = ref('')
const mode = ref('time_in')
const matchedEmployee = ref(null)
const matchedDistance = ref(0)
const selectedTimelogs = ref([])

// Loader for timelog table
const tableContainer = ref(null)
const $loading = useLoading()
const loaderInstance = ref(null)
watch(
  () => timeLogStore.isLoading,
  (newVal) => {
    if (newVal) {
      if (!loaderInstance.value && tableContainer.value) {
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

// Global error state
const globalError = ref('')

// Liveness & Face Detection State
const livenessState = ref('idle')
const currentChallengeIndex = ref(0)
const challengeStartTime = ref(0)
const baselineAngle = ref(null)
const neutralStartTime = ref(0)
const livenessChallenges = [
  {
    instruction: 'Please turn your head to the left',
    condition: (angle, baseline) => baseline && angle && angle.yaw < baseline.yaw - 60
  },
  {
    instruction: 'Please turn your head to the right',
    condition: (angle, baseline) => baseline && angle && angle.yaw > baseline.yaw + 60
  },
  {
    instruction: 'Please nod your head',
    condition: (angle, baseline) => baseline && angle && angle.pitch > baseline.pitch + 10
  }
]
function isNeutral(angle, baseline) {
  if (!baseline || !angle) return false
  const yawTolerance = 10,
    pitchTolerance = 5
  return (
    Math.abs(angle.yaw - baseline.yaw) < yawTolerance &&
    Math.abs(angle.pitch - baseline.pitch) < pitchTolerance
  )
}

// Simulated Web Worker for heavy computations
let detectionWorker
if (window.Worker) {
  const workerBlob = new Blob(
    [
      `
    self.onmessage = function(e) {
      setTimeout(() => {
        self.postMessage({ processed: true });
      }, 50);
    }
  `
    ],
    { type: 'application/javascript' }
  )
  detectionWorker = new Worker(URL.createObjectURL(workerBlob))
}

// Composable: Face Detection & Liveness Check
function useFaceDetection() {
  const videoRef = ref(null)
  const canvasRef = ref(null)
  const cameraContainerRef = ref(null)
  let lastDetectionTime = 0

  function startCamera() {
    if (videoRef.value) {
      videoRef.value.setAttribute('crossOrigin', 'anonymous')
    }
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.value) {
          videoRef.value.srcObject = stream
          videoRef.value.play()
        }
      })
      .catch((err) => {
        globalError.value = 'Error accessing camera.'
        console.error('Error accessing camera:', err)
      })
  }

  function updateCanvasDimensions() {
    if (videoRef.value && canvasRef.value) {
      const container = videoRef.value.parentElement
      if (container) {
        canvasRef.value.width = container.clientWidth
        canvasRef.value.height = container.clientHeight
      }
    }
  }

  async function detectFacesLoop() {
    if (!videoRef.value || videoRef.value.paused || videoRef.value.ended) {
      requestAnimationFrame(detectFacesLoop)
      return
    }
    const now = performance.now()
    if (now - lastDetectionTime > 200) {
      lastDetectionTime = now
      if (detectionWorker) {
        detectionWorker.postMessage({ timestamp: now })
        await new Promise((resolve) => {
          detectionWorker.onmessage = () => resolve()
        })
      }
      let detections = []
      try {
        detections = await faceapi
          .detectAllFaces(videoRef.value, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender()
      } catch (error) {
        globalError.value = 'Face detection error.'
        console.error(error)
      }

      updateCanvasDimensions()
      const canvas = canvasRef.value
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const displaySize = { width: canvas.width, height: canvas.height }
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      for (const person of resizedDetections) {
        const box = person.detection.box
        ctx.lineWidth = 3
        ctx.strokeStyle = 'deepskyblue'
        ctx.fillStyle = 'deepskyblue'
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.rect(box.x, box.y, box.width, box.height)
        ctx.stroke()
        ctx.globalAlpha = 1
        const sortedExpr = Object.entries(person.expressions).sort((a, b) => b[1] - a[1])
        const topExpr = sortedExpr[0]
        const genderLine = `Gender: ${Math.round(person.genderProbability * 100)}% ${person.gender}`
        const expressionLine = `Expression: ${Math.round(topExpr[1] * 100)}% ${topExpr[0]}`
        const ageLine = `Age: ${Math.round(person.age)} years`
        const angleLine = `roll: ${person.angle.roll}° pitch: ${person.angle.pitch}° yaw: ${person.angle.yaw}°`
        ctx.fillStyle = 'black'
        ctx.font = '16px "Segoe UI"'
        ctx.fillText(genderLine, box.x, box.y - 59)
        ctx.fillText(expressionLine, box.x, box.y - 41)
        ctx.fillText(ageLine, box.x, box.y - 23)
        ctx.fillStyle = 'lightblue'
        ctx.fillText(genderLine, box.x, box.y - 60)
        ctx.fillText(expressionLine, box.x, box.y - 42)
        ctx.fillText(ageLine, box.x, box.y - 24)
        ctx.fillStyle = 'black'
        ctx.fillText(angleLine, box.x, box.y + box.height + 20)
        ctx.fillStyle = 'lightblue'
        ctx.fillText(angleLine, box.x, box.y + box.height + 19)
        ctx.globalAlpha = 0.8
        ctx.fillStyle = 'lightblue'
        person.landmarks.positions.forEach(({ x, y }) => {
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, 2 * Math.PI)
          ctx.fill()
        })
      }

      // Liveness Check & Auto-Attendance
      const isFullscreen = document.fullscreenElement === cameraContainerRef.value
      if (isFullscreen && !isProcessing.value && !autoAttendanceCooldown.value) {
        if (detections.length > 0) {
          const face = detections[0]
          if (livenessState.value === 'idle') {
            livenessState.value = 'challenge'
            currentChallengeIndex.value = 0
            challengeStartTime.value = Date.now()
            baselineAngle.value = face.angle
          }
          if (livenessState.value === 'challenge') {
            const challengeDuration = 5 // seconds
            const elapsed = (Date.now() - challengeStartTime.value) / 1000
            const remaining = Math.max(0, Math.ceil(challengeDuration - elapsed))
            const progressPercent = Math.min((elapsed / challengeDuration) * 100, 100)
            const progressWidth = canvas.width * (progressPercent / 100)
            // Draw progress bar at the bottom of the canvas
            ctx.fillStyle = 'rgba(59,130,246,0.8)'
            ctx.fillRect(0, canvas.height - 10, progressWidth, 10)
            // Display instruction and countdown
            ctx.fillStyle = 'rgba(0,0,0,0.5)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = 'white'
            ctx.font = '24px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(
              livenessChallenges[currentChallengeIndex.value].instruction,
              canvas.width / 2,
              canvas.height / 2 - 20
            )
            ctx.font = '48px Arial'
            ctx.fillText(remaining.toString(), canvas.width / 2, canvas.height / 2 + 30)
            if (
              livenessChallenges[currentChallengeIndex.value].condition(
                face.angle,
                baselineAngle.value
              )
            ) {
              livenessState.value = 'neutral'
              neutralStartTime.value = Date.now()
            } else if (elapsed >= challengeDuration) {
              livenessState.value = 'failed'
              ctx.fillStyle = 'rgba(128,0,0,0.5)'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.fillStyle = 'white'
              ctx.font = '32px Arial'
              ctx.textAlign = 'center'
              ctx.fillText('Challenge Failed', canvas.width / 2, canvas.height / 2)
              setTimeout(() => {
                livenessState.value = 'idle'
                currentChallengeIndex.value = 0
                challengeStartTime.value = 0
                baselineAngle.value = null
                autoAttendanceCooldown.value = true
                setTimeout(() => {
                  autoAttendanceCooldown.value = false
                }, 10000)
              }, 1500)
            }
          } else if (livenessState.value === 'neutral') {
            if (isNeutral(face.angle, baselineAngle.value)) {
              if (neutralStartTime.value === 0) neutralStartTime.value = Date.now()
              const neutralElapsed = (Date.now() - neutralStartTime.value) / 1000
              ctx.fillStyle = 'rgba(0,0,0,0.5)'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.fillStyle = 'white'
              ctx.font = '28px Arial'
              ctx.textAlign = 'center'
              ctx.fillText('Neutral Position Achieved', canvas.width / 2, canvas.height / 2 - 10)
              ctx.font = '24px Arial'
              ctx.fillText(
                `Hold for ${Math.ceil(1 - neutralElapsed)}s`,
                canvas.width / 2,
                canvas.height / 2 + 30
              )
              if (neutralElapsed >= 1) {
                currentChallengeIndex.value++
                if (currentChallengeIndex.value >= livenessChallenges.length) {
                  livenessState.value = 'complete'
                } else {
                  livenessState.value = 'challenge'
                  challengeStartTime.value = Date.now()
                  baselineAngle.value = face.angle
                  neutralStartTime.value = 0
                }
              }
            } else {
              neutralStartTime.value = 0
              ctx.fillStyle = 'rgba(0,0,0,0.5)'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.fillStyle = 'white'
              ctx.font = '28px Arial'
              ctx.textAlign = 'center'
              ctx.fillText('Please return to neutral position', canvas.width / 2, canvas.height / 2)
            }
          } else if (livenessState.value === 'complete') {
            isProcessing.value = true
            recordTime().then(() => {
              attendanceMessage.value = 'Attendance successfully recorded!'
              isProcessing.value = false
              livenessState.value = 'idle'
              currentChallengeIndex.value = 0
              challengeStartTime.value = 0
              baselineAngle.value = null
              autoAttendanceCooldown.value = true
              if (document.fullscreenElement) document.exitFullscreen()
              setTimeout(() => {
                attendanceMessage.value = ''
              }, 3000)
              setTimeout(() => {
                autoAttendanceCooldown.value = false
              }, 10000)
            })
          }
        } else {
          livenessState.value = 'idle'
          currentChallengeIndex.value = 0
          challengeStartTime.value = 0
          baselineAngle.value = null
        }
      } else {
        livenessState.value = 'idle'
        currentChallengeIndex.value = 0
        challengeStartTime.value = 0
        baselineAngle.value = null
      }
      if (isProcessing.value) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.font = '32px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Processing attendance...', canvas.width / 2, canvas.height / 2)
      }
      if (attendanceMessage.value) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.font = '32px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(attendanceMessage.value, canvas.width / 2, canvas.height / 2)
      }
    }
    requestAnimationFrame(detectFacesLoop)
  }

  return {
    videoRef,
    canvasRef,
    cameraContainerRef,
    startCamera,
    detectFacesLoop,
    updateCanvasDimensions
  }
}

const {
  videoRef,
  canvasRef,
  cameraContainerRef,
  startCamera,
  detectFacesLoop,
  updateCanvasDimensions
} = useFaceDetection()

// Auto-attendance and cooldown variables
const isProcessing = ref(false)
const attendanceMessage = ref('')
const autoAttendanceCooldown = ref(false)

// Table columns and data
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
const timelogsData = computed(() => ({
  total: timeLogStore.items?.total || 0,
  totalPages: timeLogStore.items?.totalPages || 1,
  currentPage: timeLogStore.items?.currentPage || 1,
  pageSize: timeLogStore.items?.pageSize || 5,
  data: timeLogStore.items?.data || []
}))

onMounted(async () => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
  setDefaultMode()
  fetchDailyLogs()
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector')
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68')
  await faceapi.nets.faceExpressionNet.loadFromUri('/models/face_expression')
  await faceapi.nets.ageGenderNet.loadFromUri('/models/age_gender_model')
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition')
  console.log('face-api.js models loaded (client-side).')
  await nextTick()
  startCamera()
  if (videoRef.value) {
    videoRef.value.onloadedmetadata = () => {
      if (canvasRef.value && updateCanvasDimensions) {
        updateCanvasDimensions()
      }
      detectFacesLoop()
    }
  }
  window.addEventListener('resize', () => {
    if (updateCanvasDimensions) updateCanvasDimensions()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasDimensions)
})

watch(matchedEmployee, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      matchedEmployee.value = null
      matchedDistance.value = 0
    }, 10000)
  }
})

const handleQueryChange = async (query) => {
  await timeLogStore.getDailyLogs(employeeId.value, { ...query, date: new Date() }, true)
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
  await timeLogStore.getDailyLogs(employeeId.value, { page: 1, limit: 5, date: new Date() }, true)
}
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
async function captureImage() {
  const canvasElem = document.createElement('canvas')
  if (!videoRef.value) throw new Error('Video element not available')
  canvasElem.width = videoRef.value.videoWidth
  canvasElem.height = videoRef.value.videoHeight
  const ctx = canvasElem.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0)
  const base64Image = canvasElem.toDataURL('image/jpeg')
  if (!base64Image || !base64Image.startsWith('data:image/jpeg;base64,')) {
    throw new Error('Invalid image data captured.')
  }
  return base64Image
}
async function recordTime() {
  let base64Image
  try {
    base64Image = await captureImage()
  } catch (error) {
    console.error('Error capturing image:', error)
    return
  }
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

// Manual Time In/Out simply set the mode and call recordTime()
async function manualTimeIn() {
  mode.value = 'time_in'
  await recordTime()
  attendanceMessage.value = 'Manual Time In recorded!'
  setTimeout(() => {
    attendanceMessage.value = ''
  }, 3000)
  fetchDailyLogs()
}

async function manualTimeOut() {
  mode.value = 'time_out'
  await recordTime()
  attendanceMessage.value = 'Manual Time Out recorded!'
  setTimeout(() => {
    attendanceMessage.value = ''
  }, 3000)
  fetchDailyLogs()
}

async function manualAttendanceVerification() {
  // Existing manual verification via face capture (if needed)
  isProcessing.value = true
  try {
    await recordTime()
    attendanceMessage.value = 'Attendance successfully recorded via manual verification!'
  } catch (error) {
    attendanceMessage.value = 'Manual verification failed.'
    console.error(error)
  } finally {
    isProcessing.value = false
    if (document.fullscreenElement) document.exitFullscreen()
    setTimeout(() => {
      attendanceMessage.value = ''
    }, 3000)
  }
}
function verifyAttendance() {
  if (cameraContainerRef.value) {
    if (cameraContainerRef.value.requestFullscreen) {
      cameraContainerRef.value.requestFullscreen()
    } else if (cameraContainerRef.value.webkitRequestFullscreen) {
      cameraContainerRef.value.webkitRequestFullscreen()
    } else if (cameraContainerRef.value.msRequestFullscreen) {
      cameraContainerRef.value.msRequestFullscreen()
    }
  }
}
const modeLabel = computed(() => (mode.value === 'time_in' ? 'Time In' : 'Time Out'))
</script>

<style scoped>
.app-container {
  transition:
    background-color 0.3s,
    color 0.3s;
}
/* Spinner for button loading */
.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
/* Fade transition for notifications */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* Button hover effects */
button {
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
