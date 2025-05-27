<script setup>
import { nextTick, onMounted, ref } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'

const categoryName = ref('')
const categoryInput = ref(null)
const showError = ref(false) // used to show an error message when the input field is empty
const modalWrapper = ref(null)

const emit = defineEmits(['update', 'close'])

defineProps({
  title: String,
})

onMounted(() => {
  // Set focus on the input field for the new category name
  nextTick(() => {
    if (categoryInput.value) {
      categoryInput.value.focus()
    }
  })
})

// Triggers the create function in the parent component and then closes the modal
const confirm = () => {
  if (!categoryName.value.trim()) {
    showError.value = true
  } else {
    emit('update', categoryName.value)
    closeWrapper()
  }
}

// Trigger the exit transition in the modal wrapper component
const closeWrapper = () => {
  if (modalWrapper.value) {
    modalWrapper.value.close()
  } else {
    console.warn('Child component ref is not available yet.')
  }
}

// Unmount the modal by emitting the close event
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
    <div class="flex gap-2">
      <button
        class="inline-flex cursor-pointer items-center justify-center rounded-md bg-red-300 px-2 py-1 shadow-md"
        @click="closeWrapper"
      >
        <span>Cancel</span>
      </button>
      <button
        class="inline-flex cursor-pointer items-center justify-center rounded-md bg-green-300 px-2 py-1 shadow-md"
        @click="confirm()"
      >
        <span>Confirm</span>
      </button>
    </div>
  </ModalWrapper>
</template>
