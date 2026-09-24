<script setup>
import { computed, ref } from 'vue'
import { count, editLink, money } from './statsFormat'

// The ten products that lead on stock value, units or price
const props = defineProps({
  top: { type: Object, required: true }, // { value: [], units: [], price: [] }
})

const LISTS = [
  { key: 'value', label: 'Highest stock value' },
  { key: 'units', label: 'Most units' },
  { key: 'price', label: 'Most expensive' },
]
const current = ref('value')
const products = computed(() => props.top[current.value] || [])
</script>
<template>
  <div>
    <div class="flex flex-wrap gap-1 px-5 pb-3" role="tablist" aria-label="Top products by">
      <button
        v-for="list in LISTS"
        :key="list.key"
        type="button"
        role="tab"
        :aria-selected="current === list.key"
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors"
        :class="
          current === list.key
            ? 'bg-blue-600 font-semibold text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        "
        @click="current = list.key"
      >
        {{ list.label }}
      </button>
    </div>
    <div class="soft-scrollbar overflow-x-auto">
      <table class="w-full min-w-[36rem] text-sm">
        <thead>
          <tr class="border-y border-gray-200 bg-gray-50 text-left text-gray-600">
            <th scope="col" class="w-10 py-2 pl-5 font-medium">#</th>
            <th scope="col" class="px-3 py-2 font-medium">Product</th>
            <th scope="col" class="px-3 py-2 text-right font-medium">Price</th>
            <th scope="col" class="px-3 py-2 text-right font-medium">Stock</th>
            <th scope="col" class="px-3 py-2 pr-5 text-right font-medium">Stock value</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(product, i) in products" :key="product.id" class="hover:bg-blue-50/60">
            <td class="py-2 pl-5 text-gray-400 tabular-nums">{{ i + 1 }}</td>
            <td class="px-3 py-2">
              <RouterLink
                :to="editLink(product.categoryID, product.category)"
                class="font-medium text-gray-900 hover:text-blue-700 hover:underline"
              >
                {{ product.name }}
              </RouterLink>
              <span
                v-if="product.hidden"
                class="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
              >
                Hidden
              </span>
              <p class="text-xs text-gray-500">
                {{ product.category }}
                <template v-if="product.code">· {{ product.code }}</template>
              </p>
            </td>
            <td class="px-3 py-2 text-right whitespace-nowrap tabular-nums">
              {{ money(product.selling) }}
              <p
                v-if="product.selling !== product.price"
                class="text-xs text-gray-400 line-through"
              >
                {{ money(product.price) }}
              </p>
            </td>
            <td class="px-3 py-2 text-right tabular-nums">{{ count(product.stock) }}</td>
            <td class="px-3 py-2 pr-5 text-right font-medium whitespace-nowrap tabular-nums">
              {{ money(product.value) }}
            </td>
          </tr>
          <tr v-if="!products.length">
            <td colspan="5" class="px-5 py-8 text-center text-gray-500">Nothing to list yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
