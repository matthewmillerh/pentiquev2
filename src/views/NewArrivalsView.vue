<script setup>
import { onMounted, ref } from 'vue'
import { axios_api } from '@/scripts/global'
import ProductCard from '@/components/shared/ProductCard.vue'

// Every product made visible in the last 7 days, newest first
const products = ref([])
const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await axios_api.get('/products/new-arrivals')
    products.value = response.data.products
  } catch (err) {
    console.log('Error loading new arrivals:', err)
    error.value =
      err.response?.data?.message || 'New arrivals could not be loaded. Please try again.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="flex justify-center px-4 py-3">
      <span
        class="max-w-full rounded-3xl bg-white/40 px-5 py-2 text-center text-xl leading-snug font-semibold text-balance break-words shadow-md sm:px-6 sm:text-2xl"
      >
        New Arrivals
      </span>
    </h1>

    <p v-if="isLoading" class="p-8 text-center">Loading new arrivals…</p>
    <p v-else-if="error" class="p-8 text-center">{{ error }}</p>
    <p v-else-if="!products.length" class="p-8 text-center">
      Nothing has been added in the last 7 days. Check back soon!
    </p>
    <div v-else class="flex flex-wrap justify-center gap-5 p-4">
      <RouterLink
        v-for="product in products"
        :key="product.productID"
        :to="`/product/${product.productID}/${product.categoryID}`"
      >
        <ProductCard :productDetails="product" />
      </RouterLink>
    </div>
  </div>
</template>
