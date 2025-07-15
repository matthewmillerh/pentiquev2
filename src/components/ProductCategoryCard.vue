<script setup>
import { useProductImages } from '@/composables/useProductImages'
import { computed } from 'vue'

const props = defineProps(['categoryDetails'])

// Convert props to ref for the composable
const categoryRef = computed(() => props.categoryDetails)
const { primaryImage, handleImageError } = useProductImages(categoryRef)
</script>

<template>
  <div class="flex max-w-60 flex-col items-center rounded-lg bg-blue-200">
    <h2 class="mt-2 text-center font-semibold">{{ categoryDetails.category1Name }}</h2>
    <div class="m-4 flex h-72 max-h-72 w-40 max-w-40 justify-center rounded bg-blue-100 p-2">
      <img
        :src="primaryImage"
        @error="handleImageError"
        class="max-h-full w-full self-center"
        alt=""
      />
    </div>
  </div>
</template>
