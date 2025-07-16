<script setup>
import { ref } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'
import CancelButton from '../shared/buttons/CancelButton.vue'
import ConfirmButton from '../shared/buttons/ConfirmButton.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'

const categoryName = ref('')
const modalWrapper = ref(null)

const emit = defineEmits(['delete', 'close'])

const props = defineProps({
  title: String,
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// Triggers the update function in the parent component and then closes the modal
const confirm = () => {
  if (!props.isLoading) {
    emit('delete', categoryName.value)
    // Don't close the modal here anymore - let the parent handle it after loading is complete
  }
}

// Trigger the exit transition in the modal wrapper component
const closeWrapper = () => {
  if (!props.isLoading && modalWrapper.value) {
    modalWrapper.value.close()
  } else if (props.isLoading) {
    console.log('Cannot close modal while operation is in progress')
  } else {
    console.warn('Child component ref is not available yet.')
  }
}

// Unmount the modal and emit the close event
const unMount = () => {
  emit('close')
}
</script>
<template>
  <ModalWrapper
    :title="title"
    message="Confirm that you want to delete this category and all of its subcategories. Products in this category will be moved to uncategorized."
    @close="unMount()"
    ref="modalWrapper"
  >
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="py-2">
      <LoadingSpinner text="Deleting category..." />
    </div>

    <div class="flex gap-2">
      <CancelButton @close="closeWrapper()" :disabled="isLoading"></CancelButton>
      <ConfirmButton @confirm="confirm()" :disabled="isLoading"></ConfirmButton>
    </div>
  </ModalWrapper>
</template>
