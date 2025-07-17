<script setup>
defineProps(['imageSrc', 'text', 'link'])
</script>
<template>
  <div class="flex flex-col items-center gap-2 p-4">
    <RouterLink :to="link">
      <img
        :src="imageSrc"
        alt=""
        class="h-36 w-36 rounded-md border border-blue-300 object-contain p-4 shadow-md shadow-black/40 transition-all hover:shadow-lg hover:shadow-blue-500/50"
      />
    </RouterLink>

    <p>{{ text }}</p>
  </div>
</template>
