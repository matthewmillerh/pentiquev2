<script setup>
import { onMounted, ref } from 'vue'

defineProps({
  title: String,
  message: String,
})

const show = ref(false) // used to trigger the vue transition when the notification component is mounted

// set the value to true only after the component has been mounted in order for the transtion to be triggered
onMounted(() => {
  show.value = true
})

const close = () => {
  show.value = false
}

const confirm = () => {
  close()
}
</script>

<template>
  <Transition name="modal-wrapper" @after-leave="$emit('close-modal')">
    <div
      v-if="show"
      class="fixed top-0 right-0 bottom-0 left-0 z-20 bg-black/10 backdrop-blur-md"
      @click="close"
    >
      <div
        class="modal absolute top-52 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-4 rounded-md bg-white px-8 py-6 text-lg font-semibold shadow-md"
        @click.stop
      >
        <div>{{ title }}</div>
        <div class="font-normal">{{ message }}</div>
        <div>
          <input
            type="text"
            class="w-72 rounded-lg border border-blue-300 px-2 py-1 shadow-md focus:outline-1 focus:outline-blue-700"
            @keyup.enter="confirm"
          />
        </div>
        <div class="flex gap-2">
          <button
            class="inline-flex cursor-pointer items-center justify-center rounded-md bg-red-300 px-2 py-1 shadow-md"
            @click="close"
          >
            <span>Cancel</span>
          </button>
          <button
            class="inline-flex cursor-pointer items-center justify-center rounded-md bg-green-300 px-2 py-1 shadow-md"
            @click="confirm"
          >
            <span>Confirm</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Transition for the entire wrapper */
.modal-wrapper-enter-active,
.modal-wrapper-leave-active {
  transition: opacity 0.3s ease-in-out; /* Fade in/out for the whole thing */
}

.modal-wrapper-enter-from,
.modal-wrapper-leave-to {
  opacity: 0;
}

/* Transitions for the modal content */
.modal-wrapper-enter-active .modal,
.modal-wrapper-leave-active .modal {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease-in;
}

.modal-wrapper-enter-from .modal,
.modal-wrapper-leave-to .modal {
  opacity: 0;
  transform: translateY(-40px);
}
</style>
