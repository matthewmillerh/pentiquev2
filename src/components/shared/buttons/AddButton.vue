<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({
  text: String,
})
</script>
<template>
  <button
    class="cursor-pointer rounded-lg bg-blue-300 px-4 py-2 text-sm font-semibold shadow-md transition-shadow duration-300 hover:shadow-lg hover:shadow-black/30"
    @click="$emit('add')"
  >
    <font-awesome-icon :icon="['fas', 'square-plus']" style="color: black" />
    <span v-if="text" class="ml-1">{{ text }}</span>
  </button>
</template>
<style scoped></style>
