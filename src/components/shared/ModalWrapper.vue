<script setup>
import { onMounted, ref } from 'vue'

const show = ref(false) // used to trigger the vue transition when the notification component is mounted

defineProps({
  title: String,
  message: String,
})

// set the value to true only after the component has been mounted in order for the transtion to be triggered
onMounted(() => {
  show.value = true
})

const close = () => {
  show.value = false
}

defineExpose({
  close,
})
</script>

<template>
  <Transition name="modal-wrapper" @after-leave="$emit('close')">
    <div
      v-if="show"
      class="fixed top-0 right-0 bottom-0 left-0 z-20 bg-black/10 backdrop-blur-md"
      @mousedown="show = false"
    >
      <div
        class="modal absolute top-52 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-4 rounded-md bg-white px-8 py-6 shadow-md"
        @click.stop
        @mousedown.stop
      >
        <div class="text-lg font-semibold">{{ title }}</div>
        <div class="font-normal" v-if="message">{{ message }}</div>
        <slot></slot>
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
