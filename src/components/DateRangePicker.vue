<template>
    <VueDatePicker v-model="dateRange" range multi-calendars/>
  </template>
  
  <script setup>
    import { ref } from 'vue';
    import VueDatePicker from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css';
  
    // Using an array to hold both start and end date
    const dateRange = ref([null, null]);
  </script>
  