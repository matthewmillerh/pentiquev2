<script setup>
// A tile on the admin home page: a link to another admin page, or (without a link) a button, e.g. for a download
defineProps({
  imageSrc: String,
  text: String,
  link: String,
  busy: { type: Boolean, default: false }, // button only: the action is running
  busyText: { type: String, default: 'Working…' },
})
const emit = defineEmits(['activate'])

const imageClass =
  'h-36 w-36 rounded-md border border-blue-300 object-contain p-4 shadow-md shadow-black/40 transition-all hover:shadow-lg hover:shadow-blue-500/50'
</script>
<template>
  <div class="flex flex-col items-center gap-2 p-4">
    <RouterLink v-if="link" :to="link">
      <img :src="imageSrc" alt="" :class="imageClass" />
    </RouterLink>
    <button
      v-else
      type="button"
      class="cursor-pointer rounded-md disabled:cursor-wait"
      :aria-label="text"
      :disabled="busy"
      @click="emit('activate')"
    >
      <img :src="imageSrc" alt="" :class="[imageClass, busy ? 'animate-pulse opacity-60' : '']" />
    </button>

    <p>{{ busy ? busyText : text }}</p>
  </div>
</template>
