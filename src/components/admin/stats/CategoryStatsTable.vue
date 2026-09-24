<script setup>
import { computed, ref } from 'vue'
import { count, money, percent } from './statsFormat'

// Every category with its figures (everything beneath it included). Branches open and close, columns sort.
const props = defineProps({
  categories: { type: Array, required: true },
  totalValue: { type: Number, default: 0 },
})

const COLUMNS = [
  { key: 'name', label: 'Category' },
  { key: 'products', label: 'Products' },
  { key: 'inStock', label: 'In stock' },
  { key: 'units', label: 'Units' },
  { key: 'value', label: 'Stock value' },
]

const sortKey = ref('value')
const descending = ref(true)
const open = ref(new Set())

function sortBy(key) {
  if (sortKey.value === key) {
    descending.value = !descending.value
  } else {
    sortKey.value = key
    descending.value = key !== 'name' // names A-Z, figures biggest first
  }
}

function toggle(id) {
  const next = new Set(open.value)
  next.has(id) ? next.delete(id) : next.add(id)
  open.value = next
}

const sorted = (nodes) => {
  const key = sortKey.value
  const direction = descending.value ? -1 : 1
  return [...nodes].sort((a, b) => {
    const order = key === 'name' ? a.name.localeCompare(b.name) : a[key] - b[key]
    return order * direction || a.name.localeCompare(b.name)
  })
}

// The open part of the tree as a flat list of rows
const rows = computed(() => {
  const list = []
  const add = (nodes, depth) => {
    for (const node of sorted(nodes)) {
      list.push({ node, depth })
      if (open.value.has(node.id)) add(node.subcategories, depth + 1)
    }
  }
  add(props.categories, 0)
  return list
})

const allIDs = computed(() => {
  const ids = []
  const walk = (nodes) =>
    nodes.forEach((node) => {
      if (node.subcategories.length) ids.push(node.id)
      walk(node.subcategories)
    })
  walk(props.categories)
  return ids
})
const expandAll = () => (open.value = new Set(allIDs.value))
const collapseAll = () => (open.value = new Set())
</script>
<template>
  <div>
    <div v-if="allIDs.length" class="flex justify-end gap-1 px-5 pb-2">
      <button
        type="button"
        class="cursor-pointer rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        @click="expandAll"
      >
        Expand all
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        @click="collapseAll"
      >
        Collapse all
      </button>
    </div>
    <div class="soft-scrollbar overflow-x-auto">
      <table class="w-full min-w-[40rem] text-sm">
        <thead>
          <tr class="text-left text-gray-600">
            <th
              v-for="column in COLUMNS"
              :key="column.key"
              scope="col"
              class="sticky top-0 z-[1] bg-gray-50 px-3 py-2 font-medium shadow-[inset_0_-1px_0_#e5e7eb] first:pl-5"
              :class="column.key === 'name' ? '' : 'text-right'"
              :aria-sort="
                sortKey === column.key ? (descending ? 'descending' : 'ascending') : 'none'
              "
            >
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1 hover:text-gray-900"
                @click="sortBy(column.key)"
              >
                {{ column.label }}
                <span class="w-3 text-xs" aria-hidden="true">
                  {{ sortKey === column.key ? (descending ? '▼' : '▲') : '' }}
                </span>
              </button>
            </th>
            <th
              scope="col"
              class="sticky top-0 z-[1] bg-gray-50 px-3 py-2 pr-5 text-right font-medium shadow-[inset_0_-1px_0_#e5e7eb]"
            >
              Share
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="{ node, depth } in rows" :key="node.id" class="hover:bg-blue-50/60">
            <th scope="row" class="py-2 pr-3 pl-5 text-left font-normal">
              <span class="flex items-start gap-1" :style="{ paddingLeft: `${depth * 1.25}rem` }">
                <button
                  v-if="node.subcategories.length"
                  type="button"
                  class="-my-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                  :aria-expanded="open.has(node.id)"
                  :aria-label="`${open.has(node.id) ? 'Hide' : 'Show'} the subcategories of ${node.name}`"
                  @click="toggle(node.id)"
                >
                  <font-awesome-icon
                    icon="chevron-right"
                    class="text-xs transition-transform"
                    :class="open.has(node.id) ? 'rotate-90' : ''"
                  />
                </button>
                <span v-else class="w-6 shrink-0"></span>
                <RouterLink
                  :to="{
                    name: 'edit-products',
                    params: { categoryID: node.id, categoryName: node.name },
                  }"
                  class="text-gray-900 hover:text-blue-700 hover:underline"
                  :class="node.products ? '' : 'text-gray-400'"
                >
                  {{ node.name }}
                </RouterLink>
              </span>
            </th>
            <td class="px-3 py-2 text-right tabular-nums">{{ count(node.products) }}</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ count(node.inStock) }}</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ count(node.units) }}</td>
            <td class="px-3 py-2 text-right font-medium whitespace-nowrap tabular-nums">
              {{ money(node.value) }}
            </td>
            <td class="px-3 py-2 pr-5 text-right text-gray-500 tabular-nums">
              {{ percent(node.value, totalValue) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
