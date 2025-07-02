<script setup>
import { formatter } from '@/scripts/global'
import { getProductImageUrl } from '@/utils/imageUtils.js'
import { computed } from 'vue'

const props = defineProps(['productDetails'])

// Computed property to ensure image URL is reactive to product changes
const productImageUrl = computed(() => {
  return getProductImageUrl(props.productDetails, 0, { showPlaceholder: true })
})
</script>

<template>
  <div
    class="flex w-52 max-w-52 flex-col items-center rounded-lg border border-blue-300 bg-blue-200 p-2 shadow"
  >
    <h2 class="mt-2 mb-1 h-10 max-h-10 overflow-hidden text-center text-sm font-semibold">
      {{ productDetails.productName }}
    </h2>
    <div class="flex h-60 max-h-60 w-40 max-w-40 justify-center rounded bg-blue-100 p-2">
      <div
        v-if="productDetails.productSpecial"
        class="absolute mt-2 flex items-center rounded-2xl bg-red-500/55 px-3 py-1 text-white backdrop-blur"
      >
        <span class="text-sm">On Sale:</span>
        &nbsp;
        <span class="text-sm font-semibold">
          {{ formatter.format(productDetails.productSpecialPrice) }}
        </span>
      </div>
      <img
        :src="productImageUrl"
        @error="$event.target.src = '/images/no-image.png'"
        class="max-h-full max-w-full self-center"
        :alt="`${productDetails.productName}`"
        :key="`${productDetails.productID}-${productDetails.cacheKey || 0}`"
      />
    </div>
    <div class="text-center">
      <div>
        <span class="mr-0.5 text-sm">Price:</span>
        <span
          class="text-sm font-semibold"
          :class="productDetails.productSpecial ? 'line-through' : ''"
        >
          {{ formatter.format(productDetails.productPrice) }}
        </span>
      </div>
      <div>
        <span class="text-sm">{{ productDetails.productStockStatus }}</span>
      </div>
    </div>
  </div>
</template>
