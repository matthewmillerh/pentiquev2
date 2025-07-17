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
  <div class="flex flex-col items-center justify-center gap-2">
    <div
      class="flex h-full max-w-full cursor-pointer items-center justify-center self-center"
      @click="triggerFileInput"
    >
      <img
        :src="imageUrl"
        @load="onImageLoad"
        @error="onImageError"
        class="w-52 self-center rounded-md border border-blue-300 object-contain p-2 shadow-md shadow-black/20 transition-colors hover:border-blue-500"
        :class="imageIndex === 0 ? 'h-60' : 'h-44'"
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
      text="Delete Image"
      @delete="$emit('delete', imageIndex)"
      v-if="imageIndex > 0"
    ></DeleteButton>
  </div>
</template>
