<script setup>
import { containerMaxW } from '@/config.js'
import BaseLevel from '@/components/BaseLevel.vue'
import JustboilLogo from '@/components/JustboilLogo.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="py-2 px-6" :class="containerMaxW">
    <BaseLevel>
      <div class="text-center md:text-left">
        <b>&copy;{{ year }}, <a href="https://area51.ph/" target="_blank">Area51.ph</a>.</b>
        <slot />
      </div>
      <div class="md:py-2">
        <a href="https://area51.ph"> </a>
      </div>
    </BaseLevel>
  </footer>
</template>
