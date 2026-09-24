<script setup>
import { useProductImages } from '@/composables/useProductImages'
import { computed } from 'vue'

const props = defineProps(['categoryDetails'])

// Convert props to ref for the composable
const categoryRef = computed(() => props.categoryDetails)
const { primaryImage, handleImageError } = useProductImages(categoryRef)
</script>

<template>
  <div
    class="flex w-48 flex-col items-center rounded-xl border border-blue-200/80 bg-blue-100/80 shadow-sm shadow-blue-900/5 transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:border-blue-300 hover:bg-blue-100 hover:shadow-lg hover:shadow-blue-900/10"
  >
    <!-- Long names wrap inside the card's padding. Room for two lines keeps the images of a row level. -->
    <h2
      class="mt-3 flex min-h-12 w-full items-center justify-center px-4 text-center leading-snug font-semibold break-words"
    >
      {{ categoryDetails.categoryName }}
    </h2>
    <div class="m-4 flex h-72 max-h-72 w-40 max-w-40 justify-center rounded-lg bg-white/70 p-2">
      <img
        :src="primaryImage"
        @error="handleImageError"
        class="max-h-full w-full self-center"
        alt=""
      />
    </div>
  </div>
</template>
