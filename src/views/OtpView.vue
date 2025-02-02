<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { mdiShieldKey } from '@mdi/js'
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'

const form = reactive({ otp: '' })
const router = useRouter()
const authStore = useAuthStore()
const errorMessage = ref('')

const submitOtp = async () => {
  try {
    await authStore.verify2FA(form.otp)
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.message || 'Invalid OTP'
  }
}
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="blueGray">
      <CardBox :class="cardClass" is-form @submit.prevent="submitOtp">
        <h2 class="text-center text-lg font-bold mb-4">Enter OTP</h2>
        <FormField label="OTP Code">
          <FormControl v-model="form.otp" :icon="mdiShieldKey" type="text" name="otp" />
        </FormField>
        <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
        <BaseButton type="submit" color="info" label="Verify OTP" />
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
