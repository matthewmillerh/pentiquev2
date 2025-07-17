<script setup>
import { nextTick, onMounted, ref } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'
import CancelButton from '../shared/buttons/CancelButton.vue'
import ConfirmButton from '../shared/buttons/ConfirmButton.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'

const categoryName = ref('')
const categoryInput = ref(null)
const showError = ref(false) // used to show an error message when the input field is empty
const modalWrapper = ref(null)

const emit = defineEmits(['create', 'close'])

const props = defineProps({
  title: String,
  isLoading: {
    type: Boolean,
    default: false,
  },
})

onMounted(() => {
  // Set focus on the input field for the new category name
  nextTick(() => {
    if (categoryInput.value) {
      categoryInput.value.focus()
    }
  })
})

// Triggers the update function in the parent component and then closes the modal
const confirm = () => {
  if (!categoryName.value.trim()) {
    showError.value = true
  } else if (!props.isLoading) {
    emit('create', categoryName.value)
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
    message="Enter the new category name:"
    @close="unMount()"
    ref="modalWrapper"
  >
    <div>
      <input
        type="text"
        class="w-72 rounded-lg border border-blue-300 px-2 py-1 shadow-md focus:outline-1 focus:outline-blue-700"
        v-model="categoryName"
        @keyup.enter.prevent="confirm()"
        ref="categoryInput"
        required
      />
    </div>
    <div v-if="showError" class="text-sm">
      <span class="text-red-500">This field cannot be empty.</span>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="py-2">
      <LoadingSpinner text="Creating category..." />
    </div>

    <div class="flex gap-2">
      <CancelButton @close="closeWrapper()" :disabled="isLoading"></CancelButton>
      <ConfirmButton @confirm="confirm()" :disabled="isLoading"></ConfirmButton>
    </div>
  </ModalWrapper>
</template>
