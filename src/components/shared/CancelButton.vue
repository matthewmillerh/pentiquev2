<script setup></script>
<template>
  <button
    class="inline-flex cursor-pointer items-center justify-center rounded-md bg-red-300 px-2 py-1 shadow-md"
    @click="$emit('close')"
  >
    <span>Cancel</span>
  </button>
</template>
