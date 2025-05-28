<script setup>
import { ref } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'
import CancelButton from '../shared/CancelButton.vue'
import ConfirmButton from '../shared/ConfirmButton.vue'

const categoryName = ref('')
const modalWrapper = ref(null)

const emit = defineEmits(['delete', 'close'])

defineProps({
  title: String,
})

// Triggers the update function in the parent component and then closes the modal
const confirm = () => {
  emit('delete', categoryName.value)
  closeWrapper()
}

// Trigger the exit transition in the modal wrapper component
const closeWrapper = () => {
  if (modalWrapper.value) {
    modalWrapper.value.close()
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
    message="Confirm that you want to delete this category and all of its subcategories. This will also delete all of the products in this category."
    @close="unMount()"
    ref="modalWrapper"
  >
    <div class="flex gap-2">
      <CancelButton @close="closeWrapper()"></CancelButton>
      <ConfirmButton @confirm="confirm()"></ConfirmButton>
    </div>
  </ModalWrapper>
</template>
