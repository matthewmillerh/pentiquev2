<script setup>
import { computed, ref } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'
import CancelButton from '../shared/buttons/CancelButton.vue'
import ConfirmButton from '../shared/buttons/ConfirmButton.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'
import { flattenCategories } from '@/utils/categoryTree'

const modalWrapper = ref(null)

const emit = defineEmits(['delete', 'close'])

const props = defineProps({
  // The category node from the admin tree: { id, name, productCount, subcategories }
  category: { type: Object, required: true },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: { type: String, default: '' },
})

const subcategoryCount = computed(() => flattenCategories(props.category.subcategories).length)

// A category that still holds products (anywhere beneath it) cannot be deleted, so say so straight away
const hasProducts = computed(() => props.category.productCount > 0)

const message = computed(() => {
  const name = `“${props.category.name}”`
  if (hasProducts.value) {
    const n = props.category.productCount
    return `${name} still contains ${n} product${n === 1 ? '' : 's'}. Move or merge ${n === 1 ? 'it' : 'them'} into another category before deleting.`
  }
  const subs = subcategoryCount.value
  return subs
    ? `Delete ${name} and its ${subs} subcategor${subs === 1 ? 'y' : 'ies'}? This cannot be undone.`
    : `Delete ${name}? This cannot be undone.`
})

// Triggers the delete function in the parent component, the parent closes the modal when it is done
const confirm = () => {
  if (!props.isLoading && !hasProducts.value) {
    emit('delete')
  }
}

// Trigger the exit transition in the modal wrapper component
const closeWrapper = () => {
  if (!props.isLoading && modalWrapper.value) {
    modalWrapper.value.close()
  }
}

// Unmount the modal and emit the close event
const unMount = () => {
  emit('close')
}
</script>
<template>
  <ModalWrapper
    :title="hasProducts ? 'This category cannot be deleted yet' : 'Delete category'"
    :message="message"
    @close="unMount()"
    ref="modalWrapper"
  >
    <p v-if="error" class="max-w-md text-center text-sm text-red-600">{{ error }}</p>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="py-2">
      <LoadingSpinner text="Deleting category..." />
    </div>

    <div class="flex gap-2">
      <CancelButton @close="closeWrapper()" :disabled="isLoading"></CancelButton>
      <ConfirmButton v-if="!hasProducts" @confirm="confirm()" :disabled="isLoading"></ConfirmButton>
    </div>
  </ModalWrapper>
</template>
