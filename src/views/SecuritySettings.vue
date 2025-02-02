<script setup>
import { ref, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  mdiLockOpen,
  mdiLockOff,
  mdiTableBorder,
  mdiEmail,
  mdiShieldKey,
  mdiDevices
} from '@mdi/js'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import FormField from '@/components/FormField.vue'

const authStore = useAuthStore()
const userId = ref(null)
const qrCode = ref(null)
const secret = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const requires2FA = ref(false)

const load2FAStatus = () => {
  requires2FA.value = authStore.user?.twoFAEnabled || false
  userId.value = authStore.user?.id || null
}

watchEffect(() => {
  requires2FA.value = authStore.user?.twoFAEnabled || false
})

const enable2FA = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const response = await authStore.enable2FA(userId.value)

    qrCode.value = response.qrCode
    secret.value = response.secret
    requires2FA.value = true
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const disable2FA = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    await authStore.disable2FA(userId.value)
    qrCode.value = null
    secret.value = null
    requires2FA.value = false
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

load2FAStatus()
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Security Settings" main />

      <!-- 2FA Settings -->
      <CardBox class="mb-6">
        <h2 class="text-center text-lg font-bold mb-4">Two-Factor Authentication</h2>

        <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-3">{{ errorMessage }}</p>

        <div class="flex flex-col items-center space-y-4">
          <BaseButton
            :disabled="loading"
            :icon="requires2FA ? mdiLockOff : mdiLockOpen"
            :color="requires2FA ? 'warning' : 'info'"
            :label="requires2FA ? 'Disable 2FA' : 'Enable 2FA'"
            @click="requires2FA ? disable2FA() : enable2FA()"
          />

          <div v-if="qrCode" class="flex flex-col items-center text-center w-full max-w-sm mx-auto">
            <h3 class="font-bold text-lg mt-4">Scan QR Code with Google Authenticator</h3>
            <div class="flex justify-center mt-2">
              <img
                :src="qrCode"
                alt="2FA QR Code"
                class="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border rounded-md p-2 shadow-lg"
              />
            </div>
            <p class="text-sm mt-3">Or enter this secret manually:</p>
            <p class="text-lg font-mono bg-gray-200 p-3 rounded w-full break-all">{{ secret }}</p>
          </div>
        </div>
      </CardBox>

      <!-- Additional Security Settings -->
      <CardBox class="mb-6">
        <h2 class="text-lg font-bold mb-4">Additional Security Settings</h2>

        <FormField label="Email Notifications for Login Attempts">
          <BaseButton :icon="mdiEmail" color="info" label="Manage Email Alerts" disabled />
        </FormField>

        <FormField label="Recovery Codes">
          <BaseButton :icon="mdiShieldKey" color="info" label="Generate Backup Codes" disabled />
        </FormField>

        <FormField label="Trusted Devices">
          <BaseButton :icon="mdiDevices" color="info" label="Manage Trusted Devices" disabled />
        </FormField>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
