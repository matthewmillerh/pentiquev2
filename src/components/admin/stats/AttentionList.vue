<script setup>
import { computed, ref } from 'vue'
import { count, editLink, money } from './statsFormat'

// Checks on the catalogue: each says how many products (or categories) it found, and opens to list them
const props = defineProps({
  attention: { type: Object, required: true },
  limit: { type: Number, default: 200 }, // the server lists at most this many per check
})

const CHECKS = [
  {
    key: 'missingImageFiles',
    label: 'Image files missing',
    hint: 'An image is set, but its file is not on the server.',
  },
  { key: 'noImage', label: 'No image', hint: 'The shop shows a "no image" picture instead.' },
  { key: 'noDescription', label: 'No description' },
  { key: 'noPrice', label: 'No price', hint: 'The price is R0.' },
  {
    key: 'badSpecial',
    label: 'Special price not lower',
    hint: 'On special, but the special price is R0 or not below the normal price.',
  },
  { key: 'duplicateCodes', label: 'Product code used more than once' },
  { key: 'noCode', label: 'No product code' },
  {
    key: 'hiddenWithStock',
    label: 'Hidden but in stock',
    hint: 'Customers cannot see or buy these.',
  },
  {
    key: 'shownOutOfStock',
    label: 'Shown but out of stock',
    hint: 'Listed in the shop as out of stock.',
  },
  {
    key: 'emptyCategories',
    label: 'Empty categories',
    hint: 'No products in them or beneath them, so the shop menu leaves them out.',
  },
]

const checks = computed(() =>
  CHECKS.map((check) => ({ ...check, ...props.attention[check.key] })).sort(
    (a, b) => (b.count > 0) - (a.count > 0), // the ones that found something first, otherwise in the order above
  ),
)

const open = ref(null)
const toggle = (key) => (open.value = open.value === key ? null : key)
</script>
<template>
  <ul class="divide-y divide-gray-100">
    <li v-for="check in checks" :key="check.key">
      <button
        type="button"
        class="flex w-full items-center gap-3 px-5 py-3 text-left"
        :class="check.count ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'"
        :disabled="!check.count"
        :aria-expanded="check.count ? open === check.key : undefined"
        @click="toggle(check.key)"
      >
        <!-- status: an icon and words, never the colour alone -->
        <font-awesome-icon
          :icon="check.count ? 'triangle-exclamation' : 'circle-check'"
          :class="check.count ? 'text-[#c98500]' : 'text-[#0ca30c]'"
          class="shrink-0"
        />
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-medium text-gray-900">{{ check.label }}</span>
          <span v-if="check.hint" class="block text-xs text-gray-500">{{ check.hint }}</span>
        </span>
        <span
          class="shrink-0 text-sm tabular-nums"
          :class="check.count ? 'font-semibold text-gray-900' : 'text-gray-500'"
        >
          {{ check.count ? count(check.count) : 'None' }}
        </span>
        <font-awesome-icon
          v-if="check.count"
          icon="chevron-right"
          class="shrink-0 text-xs text-gray-400 transition-transform"
          :class="open === check.key ? 'rotate-90' : ''"
        />
        <span v-else class="w-2.5 shrink-0"></span>
      </button>

      <div
        v-if="open === check.key"
        class="soft-scrollbar max-h-80 overflow-y-auto bg-gray-50/70 px-5 pb-3"
      >
        <ul class="divide-y divide-gray-200/70 text-sm">
          <template v-if="check.categories">
            <li v-for="category in check.categories" :key="category.id" class="py-2">
              <RouterLink
                :to="{
                  name: 'edit-products',
                  params: { categoryID: category.id, categoryName: category.name },
                }"
                class="text-gray-900 hover:text-blue-700 hover:underline"
              >
                {{ category.path }}
              </RouterLink>
            </li>
          </template>
          <template v-else>
            <li
              v-for="product in check.products"
              :key="product.id"
              class="flex items-baseline gap-3 py-2"
            >
              <span class="min-w-0 flex-1">
                <RouterLink
                  :to="editLink(product.categoryID, product.category)"
                  class="text-gray-900 hover:text-blue-700 hover:underline"
                >
                  {{ product.name }}
                </RouterLink>
                <span class="block text-xs text-gray-500">
                  {{ product.category }}
                  <template v-if="product.code">· {{ product.code }}</template>
                </span>
              </span>
              <span class="shrink-0 text-xs text-gray-500 tabular-nums">
                {{ money(product.selling) }} · {{ count(product.stock) }} in stock
              </span>
            </li>
          </template>
        </ul>
        <p v-if="check.count > limit" class="pt-2 text-xs text-gray-500">
          Showing the first {{ count(limit) }} of {{ count(check.count) }}.
        </p>
      </div>
    </li>
  </ul>
</template>
