<script setup>
import { computed, ref } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'
import CancelButton from '../shared/buttons/CancelButton.vue'
import ConfirmButton from '../shared/buttons/ConfirmButton.vue'
import CategoryCascadeSelect from '../shared/CategoryCascadeSelect.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'

const props = defineProps({
  // 'move' puts the category under a new parent, 'merge' empties it into another category
  mode: { type: String, default: 'move' },
  category: { type: Object, required: true }, // { id, name }
  categories: { type: Array, required: true }, // the full category tree
  // The category currently selected in the picker, null is the top level (move only)
  initialTarget: { type: Number, default: null },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'close'])

const modalWrapper = ref(null)
const target = ref(props.initialTarget)
const showError = ref(false)

const isMerge = computed(() => props.mode === 'merge')

const title = computed(() =>
  isMerge.value ? `Merge "${props.category.name}" into another category` : `Move "${props.category.name}"`,
)
const message = computed(() =>
  isMerge.value
    ? `Choose the category to merge "${props.category.name}" into. All of its products and subcategories are moved there, then "${props.category.name}" is removed.`
    : `Choose the new parent for "${props.category.name}". Its subcategories and all of its products move with it.`,
)

const confirm = () => {
  if (props.isLoading) return
  if (isMerge.value && !target.value) {
    showError.value = true
    return
  }
  emit('confirm', target.value)
}

// Trigger the exit transition in the modal wrapper component
const closeWrapper = () => {
  if (!props.isLoading && modalWrapper.value) modalWrapper.value.close()
}
</script>
<template>
  <ModalWrapper :title="title" :message="message" @close="emit('close')" ref="modalWrapper">
    <div class="w-full min-w-[320px] max-w-[520px]">
      <!-- A category cannot go into itself or one of its own subcategories, so those are left out -->
      <CategoryCascadeSelect
        v-model="target"
        :categories="categories"
        :excludeID="category.id"
        :top-level-label="isMerge ? '' : '(Top level)'"
        :placeholder="isMerge ? 'Select the category to merge into' : ''"
      />
    </div>
    <div v-if="showError" class="text-sm">
      <span class="text-red-500">Please choose a category.</span>
    </div>

    <p v-if="error" class="max-w-md text-center text-sm text-red-600">{{ error }}</p>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="py-2">
      <LoadingSpinner :text="isMerge ? 'Merging categories...' : 'Moving category...'" />
    </div>

    <div class="flex gap-2">
      <CancelButton @close="closeWrapper()" :disabled="isLoading"></CancelButton>
      <ConfirmButton @confirm="confirm()" :disabled="isLoading"></ConfirmButton>
    </div>
  </ModalWrapper>
</template>
