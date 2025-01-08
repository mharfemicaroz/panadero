<!-- Dropdown.vue -->
<template>
  <Dropdown @visible-change="change">
    <!-- Trigger element, passed from parent -->
    <template #trigger>
      <slot name="trigger"></slot> <!-- Slot for the trigger button -->
    </template>

    <!-- Slot for the dropdown contents -->
    <slot></slot>
  </Dropdown>
</template>

<script setup>
import Dropdown from 'v-dropdown'  // Import the external dropdown component

function change(val) {
  console.log(val);  // Handle dropdown visibility change
}
</script>
