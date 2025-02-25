<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#f5eaea] p-4">
    <h1 class="text-8xl font-extrabold text-[#9b1a1b]">404</h1>
    <p class="mt-4 text-2xl text-[#9b1a1b]">Page Not Found</p>
    <router-link
      to="/"
      class="mt-6 px-6 py-2 text-sm font-medium text-white bg-[#9b1a1b] rounded hover:bg-[#7f1718]"
    >
      Go Back Home
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
/* Add additional styling here if desired. */
</style>
