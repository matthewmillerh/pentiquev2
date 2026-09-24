<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import CategoryCascadeSelect from '@/components/shared/CategoryCascadeSelect.vue'

// Actions for the selected products, used by both the card and the list view of Edit Products
const props = defineProps({
  selectedCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  categories: { type: Array, required: true }, // the category tree, for "Move to"
  busy: { type: String, default: '' }, // the action in progress, the buttons are disabled meanwhile
  cancellable: { type: Boolean, default: false }, // show a Cancel button (card view selection mode)
  hint: { type: String, default: '' },
})

const emit = defineEmits(['select-all', 'clear', 'move', 'update', 'delete', 'cancel'])

const moveTarget = ref(null)

const move = () => {
  if (!moveTarget.value) return
  emit('move', moveTarget.value)
  moveTarget.value = null
}

const disabled = () => !props.selectedCount || !!props.busy

const buttonClass =
  'cursor-pointer rounded-md px-2.5 py-1.5 text-gray-700 hover:bg-blue-50 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent'
</script>
<template>
  <div
    class="flex w-full max-w-5xl flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm shadow"
  >
    <span class="min-w-[90px] font-semibold text-gray-900">{{ selectedCount }} selected</span>
    <button
      type="button"
      :class="buttonClass"
      :disabled="selectedCount === totalCount || !!busy"
      @click="emit('select-all')"
    >
      Select all
    </button>
    <button type="button" :class="buttonClass" :disabled="disabled()" @click="emit('clear')">
      Clear
    </button>

    <span class="mx-1 hidden h-5 w-px bg-gray-200 sm:inline-block"></span>

    <button
      type="button"
      :class="buttonClass"
      :disabled="disabled()"
      title="Hide from customers"
      @click="emit('update', { productHidden: true }, 'hide')"
    >
      <font-awesome-icon :icon="['fas', 'eye-slash']" class="mr-1" />Hide
    </button>
    <button
      type="button"
      :class="buttonClass"
      :disabled="disabled()"
      title="Show to customers"
      @click="emit('update', { productHidden: false }, 'show')"
    >
      <font-awesome-icon :icon="['fas', 'eye']" class="mr-1" />Show
    </button>
    <button
      type="button"
      :class="buttonClass"
      :disabled="disabled()"
      title="Set the stock to 0"
      @click="emit('update', { productStock: 0 }, 'out-of-stock')"
    >
      Mark out of stock
    </button>
    <button
      type="button"
      :class="[buttonClass, 'hover:!text-red-600']"
      :disabled="disabled()"
      @click="emit('delete')"
    >
      <font-awesome-icon :icon="['fas', 'trash-can']" class="mr-1" />Delete
    </button>

    <div class="flex min-w-[260px] flex-1 items-start gap-2 sm:ml-auto sm:max-w-sm">
      <CategoryCascadeSelect v-model="moveTarget" :categories="categories" placeholder="Move selected to…" />
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-blue-600"
        :disabled="disabled() || !moveTarget"
        @click="move"
      >
        {{ busy === 'move' ? 'Moving…' : 'Move' }}
      </button>
    </div>

    <button
      v-if="cancellable"
      type="button"
      :class="buttonClass"
      :disabled="!!busy"
      @click="emit('cancel')"
    >
      Cancel
    </button>
    <p v-if="busy && busy !== 'move'" class="w-full text-xs text-gray-500">Working…</p>
    <p v-else-if="hint" class="w-full text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>
