<script setup>
import { ref } from 'vue'

defineProps({
  imageUrl: String,
  imageIndex: Number,
})

const emit = defineEmits(['change', 'error'])

const imageLoading = ref(true)
const imageError = ref(false)

const onImageLoad = () => {
  imageLoading.value = false
  imageError.value = false
}

const onImageError = (event) => {
  imageLoading.value = false
  imageError.value = true
  emit('error', event)
}
</script>
<template>
  <label class="flex h-full max-w-full cursor-pointer items-center justify-center self-center">
    <img
      :src="imageUrl"
      @load="onImageLoad"
      @error="onImageError"
      class="max-w-full self-center rounded-md border border-blue-300 p-2 shadow-md shadow-black/20"
      :class="imageIndex === 0 ? 'max-h-60' : 'max-h-44'"
      alt=""
    />
    <input
      type="file"
      accept="image/*"
      class="hidden"
      @change="$emit('change', $event, imageIndex)"
    />
  </label>
</template>
