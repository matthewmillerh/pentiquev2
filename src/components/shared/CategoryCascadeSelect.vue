<script setup>
import { computed, ref, watch } from 'vue'
import { findPathIDs } from '@/utils/categoryTree'

// Pick a category one level at a time: a select with the top level categories, then, when the chosen category has
// subcategories, another select with those (or leave it on "Directly in ..." to pick the category above), and so on.
// Same interface as CategorySelect: v-model is the chosen category id, or null.
const model = defineModel({ type: [Number, null], default: null })

const props = defineProps({
  // The nested category tree from the API
  categories: { type: Array, required: true },
  // A category (and everything beneath it) that cannot be chosen, e.g. the category being moved
  excludeID: { type: Number, default: null },
  // When set, the first select offers this option, which selects "no category" (null), e.g. "(Top level)"
  topLevelLabel: { type: String, default: '' },
  placeholder: { type: String, default: 'Select a category' },
})

// The categories that can be chosen at a level, without the excluded category
const choosable = (nodes) => nodes.filter((node) => node.id !== props.excludeID)

// The chosen category at each level, from the top level down
const path = ref([])

// Follow the chosen ids down the tree. Stops at an id that is no longer in the tree (e.g. after a refresh).
const pathNodes = computed(() => {
  const nodes = []
  let level = props.categories
  for (const id of path.value) {
    const node = choosable(level).find((n) => n.id === id)
    if (!node) break
    nodes.push(node)
    level = node.subcategories
  }
  return nodes
})

// One select per level: the top level, then one below every chosen category that has subcategories
const levels = computed(() => {
  const result = [{ parent: null, options: choosable(props.categories) }]
  pathNodes.value.forEach((node) => {
    const options = choosable(node.subcategories)
    if (options.length) result.push({ parent: node, options })
  })
  return result
})

// Keep the selects in step when the v-model is set from outside (e.g. the current parent when the modal opens)
watch(
  [model, () => props.categories],
  ([id]) => {
    const current = pathNodes.value.at(-1)?.id ?? null
    if (id !== current) path.value = id == null ? [] : findPathIDs(props.categories, id)
  },
  { immediate: true },
)

const onChange = (levelIndex, value) => {
  path.value = value === '' ? path.value.slice(0, levelIndex) : [...path.value.slice(0, levelIndex), Number(value)]
  model.value = path.value.at(-1) ?? null
}

// What each select currently shows
const selectedAt = (levelIndex) => (path.value[levelIndex] != null ? String(path.value[levelIndex]) : '')

const selectClass =
  'w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
</script>
<template>
  <div class="flex w-full flex-col gap-2">
    <div
      v-for="(level, index) in levels"
      :key="level.parent ? level.parent.id : 'top'"
      class="flex items-center gap-2"
      :style="index > 0 ? { paddingLeft: `${Math.min(index, 4) * 0.75}rem` } : null"
    >
      <span v-if="index > 0" class="shrink-0 text-gray-400" aria-hidden="true">›</span>
      <select
        :class="selectClass"
        :value="selectedAt(index)"
        :aria-label="level.parent ? `Subcategory of ${level.parent.name}` : 'Category'"
        @change="(e) => onChange(index, e.target.value)"
      >
        <template v-if="index === 0">
          <option v-if="topLevelLabel" value="">{{ topLevelLabel }}</option>
          <option v-else value="" disabled>{{ placeholder }}</option>
        </template>
        <option v-else value="">Directly in {{ level.parent.name }}</option>
        <option v-for="option in level.options" :key="option.id" :value="String(option.id)">
          {{ option.name }}{{ choosable(option.subcategories).length ? ' ›' : '' }}
        </option>
      </select>
    </div>
  </div>
</template>
