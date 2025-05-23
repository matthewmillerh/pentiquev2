<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({
  text: String,
})
</script>
<template>
  <button class="cursor-pointer rounded-lg bg-red-300 px-2 py-1 text-sm font-semibold shadow-md">
    <font-awesome-icon :icon="['fas', 'trash']" style="color: black" />
    <span v-if="text" class="ml-1">{{ text }}</span>
  </button>
</template>
<style scoped></style>
