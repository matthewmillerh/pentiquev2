<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// The credit the car model's licence (CC-BY) asks for, tucked behind a small info button
const open = ref(false)
const closeOnEscape = (event) => event.key === 'Escape' && (open.value = false)
onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <span class="relative inline-flex">
    <button
      type="button"
      class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/60 hover:text-gray-700"
      :aria-expanded="open"
      aria-controls="car-model-credit"
      aria-label="About the 3D car"
      @click="open = !open"
    >
      <font-awesome-icon icon="circle-info" class="text-xs" />
    </button>
    <span
      v-if="open"
      id="car-model-credit"
      class="absolute bottom-full left-0 z-20 mb-1 w-56 rounded-lg bg-gray-900/90 px-3 py-2 text-left text-[11px] leading-snug font-normal text-white/90 shadow-lg backdrop-blur"
    >
      3D car: "CAR" Model by Ignition Labs
      <a
        href="https://creativecommons.org/licenses/by/3.0/"
        target="_blank"
        rel="noopener noreferrer"
        class="underline"
      >
        [CC-BY]
      </a>
      via
      <a href="https://poly.pizza" target="_blank" rel="noopener noreferrer" class="underline">
        Poly Pizza
      </a>
      <br />
      Textures resized for the web
    </span>
  </span>
</template>
