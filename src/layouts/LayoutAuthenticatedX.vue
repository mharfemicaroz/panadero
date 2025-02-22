<script setup>
import { useAuthStore } from '@/stores/auth'
import { mdiForwardburger, mdiBackburger, mdiMenu } from '@mdi/js'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import menuAside from '@/menuAsideX.js'
import menuNavBar from '@/menuNavBarX.js'
import { useDarkModeStore } from '@/stores/darkMode.js'
import BaseIcon from '@/components/BaseIcon.vue'
import FormControl from '@/components/FormControl.vue'
import NavBar from '@/components/NavBar.vue'
import NavBarItemPlain from '@/components/NavBarItemPlain.vue'
import AsideMenu from '@/components/AsideMenu.vue'
import FooterBar from '@/components/FooterBar.vue'

// This class applies aside padding for larger screens only.
const layoutAsidePadding = 'xl:pl-72 2xl:pl-80'

const darkModeStore = useDarkModeStore()
const router = useRouter()
const authStore = useAuthStore()

const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(false)

router.beforeEach(() => {
  // Close any expanded aside when navigating
  isAsideMobileExpanded.value = false
  isAsideLgActive.value = false
})

const menuClick = (event, item) => {
  if (item.isToggleLightDark) darkModeStore.set()
  if (item.isLogout) logout()
  if (item.issettings) settings()
  if (item.isPOS) openNewTab('/pos')
  if (item.isDTR) openNewTab('/dtr')
}

const openNewTab = (route) => {
  const routeUrl = router.resolve(route)
  window.open(routeUrl.href, '_blank')
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const settings = () => {
  router.push('/security')
}
</script>

<template>
  <div :class="{ 'overflow-hidden lg:overflow-visible': isAsideMobileExpanded }">
    <div
      :class="[layoutAsidePadding, { 'ml-72 lg:ml-0': isAsideMobileExpanded }]"
      class="pt-16 min-h-screen w-full transition-all bg-gray-50 dark:bg-slate-800 dark:text-slate-100"
    >
      <NavBar
        :menu="menuNavBar"
        :class="[layoutAsidePadding, { 'ml-72 lg:ml-0': isAsideMobileExpanded }]"
        @menu-click="menuClick"
      >
        <!-- Mobile aside toggle -->
        <NavBarItemPlain
          display="flex lg:hidden"
          @click.prevent="isAsideMobileExpanded = !isAsideMobileExpanded"
        >
          <BaseIcon :path="isAsideMobileExpanded ? mdiBackburger : mdiForwardburger" size="24" />
        </NavBarItemPlain>
        <!-- Tablet aside toggle -->
        <NavBarItemPlain display="hidden lg:flex xl:hidden" @click.prevent="isAsideLgActive = true">
          <BaseIcon :path="mdiMenu" size="24" />
        </NavBarItemPlain>
        <!-- Search input -->
        <NavBarItemPlain use-margin>
          <FormControl placeholder="Search (ctrl+k)" ctrl-k-focus transparent borderless />
        </NavBarItemPlain>
      </NavBar>

      <!-- Aside Menu -->
      <AsideMenu
        :is-aside-mobile-expanded="isAsideMobileExpanded"
        :is-aside-lg-active="isAsideLgActive"
        :menu="menuAside"
        class="w-72 2xl:w-80"
        @menu-click="menuClick"
        @aside-lg-close-click="isAsideLgActive = false"
      />

      <!-- Main content area with responsive horizontal padding -->
      <div class="px-4 sm:px-6 xl:px-8 2xl:px-12">
        <slot />
      </div>

      <!-- Footer -->
      <FooterBar class="text-center text-sm py-4">
        Get more with
        <a href="https://area51.ph/" target="_blank" class="text-blue-600 font-semibold">
          Area51 Systems Solutions
        </a>
        – Your partner for innovative technology solutions.
      </FooterBar>
    </div>
  </div>
</template>
