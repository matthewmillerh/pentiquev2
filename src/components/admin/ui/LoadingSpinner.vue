<template>
  <div class="flex items-center justify-center">
    <div
      class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    >
      <span
        class="!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !p-0 !whitespace-nowrap ![clip:rect(0,0,0,0)]"
      >
        Loading...
      </span>
    </div>
    <span v-if="text" class="ml-2 text-sm">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})
</script>

<style scoped>
/* Small size */
.h-4.w-4 {
  height: 1rem;
  width: 1rem;
}

/* Medium size (default) */
.h-6.w-6 {
  height: 1.5rem;
  width: 1.5rem;
}

/* Large size */
.h-8.w-8 {
  height: 2rem;
  width: 2rem;
}
</style>
