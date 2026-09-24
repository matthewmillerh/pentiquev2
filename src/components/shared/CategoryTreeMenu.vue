<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Recursive list of categories for the side menu. Any depth is supported, a category's subcategories are shown
// while it is on the path to the category currently being viewed. The open top level category becomes a soft card
// with its subcategories indented inside it, the category being viewed is tinted and the ones above it are bold.
const props = defineProps({
  nodes: { type: Array, required: true },
  // ids from the top level category down to the category being viewed
  activePath: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false },
  depth: { type: Number, default: 0 },
})

// Where a category links to
const linkFor = (node) => ({
  name: props.isAdmin ? 'edit-products' : 'category',
  params: { categoryID: node.id, categoryName: node.name },
})

const isOpen = (node) => props.activePath.includes(node.id)
const isCurrent = (node) => props.activePath.at(-1) === node.id
</script>
<template>
  <ul :class="depth === 0 ? 'flex flex-col gap-1 p-2 text-sm' : 'flex flex-col gap-0.5'">
    <li
      v-for="node in nodes"
      :key="node.id"
      class="rounded-xl transition-[background-color,box-shadow] duration-300 ease-out"
      :class="depth === 0 && isOpen(node) ? 'bg-white/75 shadow-sm shadow-blue-900/5' : ''"
    >
      <!-- Clicking the open top level category closes it again by going back to the home page -->
      <RouterLink
        :to="depth === 0 && !isAdmin && isOpen(node) ? '/' : linkFor(node)"
        class="flex items-center gap-2 rounded-xl transition-[background-color,color] duration-200 ease-out"
        :class="[
          depth === 0 ? 'px-3 py-2' : 'px-2.5 py-1.5 text-[13px]',
          isCurrent(node)
            ? 'bg-blue-500/15 font-semibold text-slate-900'
            : isOpen(node)
              ? 'font-semibold text-slate-900 hover:bg-blue-500/10'
              : depth === 0
                ? 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                : 'text-slate-600 hover:bg-blue-500/10 hover:text-slate-900',
        ]"
        :aria-current="isCurrent(node) ? 'page' : undefined"
        :aria-expanded="node.subcategories.length ? isOpen(node) : undefined"
      >
        <span class="min-w-0 flex-1">{{ node.name }}</span>
        <font-awesome-icon
          v-if="node.subcategories.length"
          :icon="['fas', 'chevron-right']"
          class="shrink-0 text-[10px] text-slate-400 transition-transform duration-300 ease-out"
          :class="isOpen(node) ? 'rotate-90' : ''"
        />
      </RouterLink>

      <!-- Subcategories slide and fade open, indented under their category -->
      <Transition v-if="node.subcategories.length">
        <div class="subcategories grid grid-rows-[1fr]" v-show="isOpen(node)">
          <div class="overflow-hidden">
            <div :class="depth === 0 ? 'pr-1.5 pb-1.5 pl-3' : 'pl-3'">
              <CategoryTreeMenu
                :nodes="node.subcategories"
                :active-path="activePath"
                :is-admin="isAdmin"
                :depth="depth + 1"
              />
            </div>
          </div>
        </div>
      </Transition>
    </li>
  </ul>
</template>
<style scoped>
/* Sliding the subcategories open and closed, fading them in and out as they go */
.v-enter-active,
.v-leave-active {
  transition:
    grid-template-rows 0.3s ease,
    opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}
</style>
