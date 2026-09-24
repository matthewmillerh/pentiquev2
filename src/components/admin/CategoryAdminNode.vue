<script setup>
import { computed, inject } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// One category in the admin tree, with its subcategories nested beneath it (recursively, any depth).
// Which categories are expanded, the search and the highlighted category live in EditCategoryList.
const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

const emit = defineEmits(['add', 'rename', 'move', 'merge', 'delete'])

const editor = inject('categoryEditor')

const hasChildren = computed(() => props.node.subcategories.length > 0)
const isOpen = computed(() => hasChildren.value && editor.isOpen(props.node.id))
const isHighlighted = computed(() => editor.highlightID.value === props.node.id)

const actions = [
  { event: 'add', label: 'Add', icon: 'plus', title: 'Add a subcategory' },
  { event: 'rename', label: 'Rename', icon: 'pen', title: 'Rename' },
  { event: 'move', label: 'Move', icon: 'up-down-left-right', title: 'Move to another parent, with its subcategories and products' },
  { event: 'merge', label: 'Merge', icon: 'code-merge', title: 'Merge into another category' },
  { event: 'delete', label: 'Delete', icon: 'trash-can', title: 'Delete' },
]
</script>
<template>
  <li>
    <div
      :id="`category-${node.id}`"
      class="group flex items-center gap-2 rounded-md py-1.5 pr-1 pl-1 transition-colors duration-700 hover:bg-blue-50"
      :class="isHighlighted ? 'bg-yellow-100' : ''"
    >
      <!-- Expand / collapse -->
      <button
        type="button"
        class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-gray-500 hover:bg-blue-100 hover:text-gray-800"
        :class="hasChildren ? '' : 'invisible'"
        :aria-label="isOpen ? `Collapse ${node.name}` : `Expand ${node.name}`"
        :aria-expanded="isOpen"
        @click="editor.toggle(node.id)"
      >
        <font-awesome-icon
          :icon="['fas', 'chevron-right']"
          class="text-xs transition-transform duration-200"
          :class="isOpen ? 'rotate-90' : ''"
        />
      </button>

      <!-- Name, clicking it also expands / collapses -->
      <span
        class="min-w-0 truncate"
        :class="[
          depth === 0 ? 'font-semibold text-gray-900' : 'text-gray-800',
          hasChildren ? 'cursor-pointer' : '',
        ]"
        @click="hasChildren && editor.toggle(node.id)"
      >
        {{ node.name }}
      </span>

      <span
        class="shrink-0 rounded-full bg-gray-100 px-2 text-xs text-gray-500"
        :title="`${node.productCount} product${node.productCount === 1 ? '' : 's'}, including subcategories`"
      >
        {{ node.productCount }}
      </span>

      <!-- Actions, muted until the row is hovered -->
      <div class="ml-auto flex shrink-0 items-center gap-0.5">
        <button
          v-for="action in actions"
          :key="action.event"
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors group-hover:text-gray-600 hover:bg-white hover:shadow-sm focus-visible:text-gray-800"
          :class="action.event === 'delete' ? 'hover:!text-red-600' : 'hover:!text-gray-900'"
          :title="action.title"
          :aria-label="`${action.title}: ${node.name}`"
          @click="emit(action.event, node)"
        >
          <font-awesome-icon :icon="['fas', action.icon]" />
          <span class="hidden md:inline">{{ action.label }}</span>
        </button>
      </div>
    </div>

    <!-- Subcategories, the left border is a guide line under the chevron -->
    <ul v-if="isOpen" class="ml-4 border-l border-blue-100 pl-2">
      <CategoryAdminNode
        v-for="child in node.subcategories"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        @add="(n) => emit('add', n)"
        @rename="(n) => emit('rename', n)"
        @move="(n) => emit('move', n)"
        @merge="(n) => emit('merge', n)"
        @delete="(n) => emit('delete', n)"
      />
    </ul>
  </li>
</template>
