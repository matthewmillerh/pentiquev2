<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({
  text: String,
})
</script>
<template>
  <button
    class="cursor-pointer rounded-lg bg-green-300 px-4 py-2 text-sm font-semibold shadow-md transition-shadow duration-300 hover:shadow-lg hover:shadow-black/30"
    @click="$emit('edit')"
  >
    <font-awesome-icon :icon="['fas', 'edit']" style="color: black" />
    <span v-if="text" class="ml-1">{{ text }}</span>
  </button>
</template>
<style scoped></style>
