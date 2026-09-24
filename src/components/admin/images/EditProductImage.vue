<script setup>
import { ref } from 'vue'
import DeleteButton from '@/components/shared/buttons/DeleteButton.vue'

defineProps({
  imageUrl: String,
  imageIndex: Number,
})

const emit = defineEmits(['change', 'error', 'delete'])
const fileInput = ref(null)

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

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>
<template>
  <div class="flex w-full flex-col items-center justify-center gap-2">
    <div
      class="flex h-full w-full cursor-pointer items-center justify-center self-center"
      @click="triggerFileInput"
    >
      <img
        :src="imageUrl"
        @load="onImageLoad"
        @error="onImageError"
        class="w-full max-w-72 self-center rounded-md border border-blue-300 bg-white object-contain p-2 shadow-md shadow-black/20 transition-colors hover:border-blue-500"
        :class="imageIndex === 0 ? 'h-64' : 'h-28 sm:h-32'"
        alt="Click to change image"
      />
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="$emit('change', $event, imageIndex)"
      />
    </div>
    <DeleteButton
      text="Remove"
      title="Remove this image"
      @delete="$emit('delete', imageIndex)"
      v-if="imageIndex > 0"
    ></DeleteButton>
  </div>
</template>
