<script setup>
import { computed } from 'vue'
import { colorsBgLight, colorsOutline } from '@/colors.js'
import PillTagPlain from '@/components/PillTagPlain.vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: null
  },
  small: Boolean,
  outline: Boolean,
  huge: Boolean  // Add huge prop
})

const componentClass = computed(() => [
  props.small ? 'py-1 ' : props.huge ? 'py-3 ' : 'py-1.5 ',  // Adjust padding for huge
  props.outline ? colorsOutline[props.color] : colorsBgLight[props.color]
])
</script>

<template>
  <PillTagPlain
    class="border rounded-full opacity-15"
    :class="componentClass"
    :icon="icon"
    :label="label"
    :small="small"
    :huge="huge" 
  />
</template>
