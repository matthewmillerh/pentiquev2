<script setup>
import { formatter } from '@/scripts/global'

defineProps([
  'category1Name',
  'category2Name',
  'category3Name',
  'imageURL',
  'productName',
  'productPrice',
  'productAvailability',
  'productSpecial',
  'productSpecialPrice',
])
</script>

<template>
  <div
    class="flex w-52 max-w-52 flex-col items-center rounded-lg border border-blue-300 bg-blue-200 p-2 shadow"
  >
    <h2 class="mt-2 mb-1 h-10 max-h-10 overflow-hidden text-center text-sm font-semibold">
      {{ productName }}
    </h2>
    <div class="flex h-60 max-h-60 w-40 max-w-40 justify-center rounded bg-blue-100 p-2">
      <div
        v-if="productSpecialPrice > 0"
        class="bg-opacity-55 absolute mt-2 flex items-center rounded-2xl bg-red-500 px-3 py-1 text-white backdrop-blur"
      >
        <span class="text-sm">On Sale:</span>
        &nbsp;
        <span class="text-sm font-semibold">{{ formatter.format(productSpecialPrice) }}</span>
      </div>
      <img
        :src="`/images/${category1Name ? category1Name + '/' : ''}${category2Name ? category2Name + '/' : ''}${category3Name ? category3Name + '/' : ''}${imageURL}`"
        class="max-h-full max-w-full self-center"
        :alt="`${productName}`"
      />
    </div>
    <div class="text-center">
      <div>
        <span class="mr-0.5 text-sm">Price:</span>
        <span class="text-sm font-semibold" :class="productSpecialPrice > 0 ? 'line-through' : ''">
          {{ formatter.format(productPrice) }}
        </span>
      </div>
      <div>
        <span class="text-sm">{{ productAvailability }}</span>
      </div>
    </div>
  </div>
</template>
