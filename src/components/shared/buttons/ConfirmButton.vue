<script setup></script>
<template>
  <button
    class="inline-flex cursor-pointer items-center justify-center rounded-md bg-green-300 px-2 py-1 shadow-md"
    @click="$emit('confirm')"
  >
    <span>Confirm</span>
  </button>
</template>
