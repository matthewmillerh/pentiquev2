<script setup>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { formatter } from '@/scripts/global'

// Compact list of products with a checkbox, quick actions and an inline stock field on every row
const props = defineProps({
  products: { type: Array, required: true },
  selectedIDs: { type: Set, required: true },
  busyIDs: { type: Set, default: () => new Set() }, // products with a quick action in progress
})

const emit = defineEmits(['toggle', 'toggle-all', 'edit', 'toggle-hidden', 'delete', 'update-stock'])

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'
const NO_IMAGE_URL = `${API_BASE_URL}/images/no-image.png`

const allSelected = computed(
  () => props.products.length > 0 && props.products.every((p) => props.selectedIDs.has(p.productID)),
)
const someSelected = computed(() => !allSelected.value && props.products.some((p) => props.selectedIDs.has(p.productID)))

// The thumbnail if there is one, otherwise the full image
const thumbnail = (product) => {
  const urls = product.imageUrls || []
  const url = urls[4] || urls[0] || NO_IMAGE_URL
  return product.cacheKey ? `${url}${url.includes('?') ? '&' : '?'}_t=${product.cacheKey}` : url
}

// Save the stock when the field is left or Enter is pressed, put the old value back if it is not a valid count
const commitStock = (product, event) => {
  const raw = event.target.value
  const stock = Number(raw)
  if (raw === '' || !Number.isInteger(stock) || stock < 0) {
    event.target.value = product.productStock
    return
  }
  if (stock !== product.productStock) emit('update-stock', product, stock)
}
</script>
<template>
  <div class="mx-4 overflow-x-auto rounded-xl border border-blue-300 bg-white shadow">
    <table class="w-full text-left text-sm">
      <thead class="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase">
        <tr>
          <th class="w-10 px-3 py-2">
            <input
              type="checkbox"
              class="h-4 w-4 cursor-pointer accent-blue-600"
              :checked="allSelected"
              :indeterminate.prop="someSelected"
              aria-label="Select all products"
              @change="emit('toggle-all', !allSelected)"
            />
          </th>
          <th class="px-2 py-2">Product</th>
          <th class="hidden px-2 py-2 sm:table-cell">Price</th>
          <th class="px-2 py-2">Stock</th>
          <th class="px-3 py-2 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr
          v-for="product in products"
          :key="product.productID"
          class="transition-colors hover:bg-blue-50/60"
          :class="[
            selectedIDs.has(product.productID) ? 'bg-blue-50' : '',
            busyIDs.has(product.productID) ? 'opacity-50' : '',
          ]"
        >
          <td class="px-3 py-2">
            <input
              type="checkbox"
              class="h-4 w-4 cursor-pointer accent-blue-600"
              :checked="selectedIDs.has(product.productID)"
              :aria-label="`Select ${product.productName}`"
              @change="emit('toggle', product.productID)"
            />
          </td>

          <!-- Thumbnail, name, code and badges. Clicking opens the full editor -->
          <td class="px-2 py-2">
            <button
              type="button"
              class="flex cursor-pointer items-center gap-3 text-left"
              @click="emit('edit', product)"
            >
              <img
                :src="thumbnail(product)"
                :alt="product.productName"
                class="h-11 w-11 shrink-0 rounded border border-gray-200 bg-white object-contain"
                :class="product.productHidden ? 'opacity-40' : ''"
                loading="lazy"
                @error="(e) => (e.target.src = NO_IMAGE_URL)"
              />
              <span class="min-w-0">
                <span class="block font-medium text-gray-900 hover:underline">
                  {{ product.productName }}
                </span>
                <span class="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                  <span v-if="product.productCode">{{ product.productCode }}</span>
                  <span
                    v-if="product.productHidden"
                    class="rounded-full bg-gray-200 px-1.5 text-[11px] font-medium text-gray-700"
                  >
                    Hidden
                  </span>
                  <span
                    v-if="product.productFeatured"
                    class="rounded-full bg-yellow-100 px-1.5 text-[11px] font-medium text-yellow-800"
                  >
                    Featured
                  </span>
                  <span
                    v-if="product.productSpecial"
                    class="rounded-full bg-red-100 px-1.5 text-[11px] font-medium text-red-700"
                  >
                    On special
                  </span>
                </span>
              </span>
            </button>
          </td>

          <td class="hidden px-2 py-2 whitespace-nowrap sm:table-cell">
            <template v-if="product.productSpecial">
              <span class="font-medium text-red-700">{{ formatter.format(product.productSpecialPrice) }}</span>
              <span class="ml-1 text-xs text-gray-400 line-through">
                {{ formatter.format(product.productPrice) }}
              </span>
            </template>
            <span v-else>{{ formatter.format(product.productPrice) }}</span>
          </td>

          <!-- Stock, saved when the field is left or Enter is pressed -->
          <td class="px-2 py-2">
            <input
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              class="w-20 rounded-md border px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              :class="product.productStock > 0 ? 'border-gray-300' : 'border-red-300 bg-red-50 text-red-700'"
              :value="product.productStock"
              :disabled="busyIDs.has(product.productID)"
              :aria-label="`Stock for ${product.productName}`"
              :title="product.productStock > 0 ? 'In stock' : 'Out of stock'"
              @change="(e) => commitStock(product, e)"
              @keydown.enter="(e) => e.target.blur()"
            />
          </td>

          <td class="px-3 py-2">
            <div class="flex items-center justify-end gap-0.5">
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-1.5 text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                title="Edit"
                :aria-label="`Edit ${product.productName}`"
                @click="emit('edit', product)"
              >
                <font-awesome-icon :icon="['fas', 'pen']" />
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-1.5 text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm disabled:cursor-default disabled:opacity-40"
                :title="product.productHidden ? 'Show to customers' : 'Hide from customers'"
                :aria-label="`${product.productHidden ? 'Show' : 'Hide'} ${product.productName}`"
                :disabled="busyIDs.has(product.productID)"
                @click="emit('toggle-hidden', product)"
              >
                <font-awesome-icon :icon="['fas', product.productHidden ? 'eye' : 'eye-slash']" />
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-1.5 text-gray-500 hover:bg-white hover:text-red-600 hover:shadow-sm disabled:cursor-default disabled:opacity-40"
                title="Delete"
                :aria-label="`Delete ${product.productName}`"
                :disabled="busyIDs.has(product.productID)"
                @click="emit('delete', product)"
              >
                <font-awesome-icon :icon="['fas', 'trash-can']" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
