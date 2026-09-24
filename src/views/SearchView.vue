<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { axios_api } from '@/scripts/global'
import ProductCard from '@/components/shared/ProductCard.vue'

// Search results, for /search?q=...
const route = useRoute()
const query = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
const products = ref([])
const more = ref(false) // there were more results than are shown
const isLoading = ref(false)
const error = ref('')

let latestRequest = 0 // only the newest search may update the page, in case answers arrive out of order

async function search() {
  const request = ++latestRequest
  products.value = []
  more.value = false
  error.value = ''
  if (query.value.length < 2) return

  isLoading.value = true
  try {
    const response = await axios_api.get('/products/search', { params: { q: query.value } })
    if (request !== latestRequest) return
    products.value = response.data.products
    more.value = response.data.more
  } catch (err) {
    if (request !== latestRequest) return
    console.log('Error searching products:', err)
    error.value =
      err.response?.data?.message || 'Search is not available right now, please try again.'
  } finally {
    if (request === latestRequest) isLoading.value = false
  }
}

watch(query, search, { immediate: true })
</script>
<template>
  <div>
    <h1 class="flex justify-center px-4 py-3">
      <span
        class="max-w-full rounded-3xl bg-white/40 px-5 py-2 text-center text-xl leading-snug font-semibold shadow-md sm:px-6 sm:text-2xl"
      >
        Search
      </span>
    </h1>

    <p v-if="query.length < 2" class="p-8 text-center">
      Type at least 2 characters in the search box to find products.
    </p>
    <p v-else-if="isLoading" class="p-8 text-center">Searching for “{{ query }}”…</p>
    <p v-else-if="error" class="p-8 text-center">{{ error }}</p>
    <p v-else-if="!products.length" class="p-8 text-center">
      No products found for “{{ query }}”. Try fewer or different words.
    </p>
    <template v-else>
      <p class="px-4 text-center text-sm">
        {{ products.length }} product{{ products.length === 1 ? '' : 's' }} found for “{{ query }}”
        <span v-if="more">
          (showing the first {{ products.length }}, add more words to narrow it down)
        </span>
      </p>
      <div class="flex flex-wrap justify-center gap-5 p-4">
        <div v-for="product in products" :key="product.productID">
          <RouterLink :to="`/product/${product.productID}/${product.categoryID}`">
            <ProductCard :productDetails="product"></ProductCard>
          </RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>
