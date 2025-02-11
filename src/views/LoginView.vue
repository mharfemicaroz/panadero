<script setup>
import { reactive, ref, watch, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { mdiAccount, mdiAsterisk } from '@mdi/js'
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'

// Import vue-loading-overlay
import { useLoading } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

// Reactive form object
const form = reactive({
  login: '',
  pass: ''
})

const authStore = useAuthStore()
const loading = ref(false)

// Create loader instance refs
const loaderInstance = ref(null)
const $loading = useLoading()

// Watch the "loading" ref to show/hide the loader overlay
watch(
  () => loading.value,
  (newVal) => {
    if (newVal) {
      if (!loaderInstance.value) {
        loaderInstance.value = $loading.show({
          canCancel: false,
          isFullPage: true,
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

// Clean up the loader when the component is unmounted
onBeforeUnmount(() => {
  if (loaderInstance.value) {
    loaderInstance.value.hide()
    loaderInstance.value = null
  }
})

// Submit handler for login
const submit = async () => {
  try {
    loading.value = true
    await authStore.login(form.login, form.pass)
    console.log(authStore.user)
  } catch (error) {
    alert(error.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="pinkRed">
      <CardBox :class="cardClass" is-form @submit.prevent="submit">
        <div class="flex items-center justify-center mb-4">
          <img src="../../public/logo.png" alt="Logo" class="mx-2" width="25" />
          <b class="font-black text-lg">Panadero</b>
        </div>

        <FormField label="Login" help="Enter your login">
          <FormControl
            v-model="form.login"
            :icon="mdiAccount"
            name="login"
            autocomplete="username"
          />
        </FormField>

        <FormField label="Password" help="Enter your password">
          <FormControl
            v-model="form.pass"
            :icon="mdiAsterisk"
            type="password"
            name="password"
            autocomplete="current-password"
          />
        </FormField>

        <template #footer>
          <BaseButtons>
            <BaseButton type="submit" color="info" label="Login" :disabled="loading" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
