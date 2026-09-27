<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { axios_api } from '@/scripts/global'
import ProductCard from '@/components/shared/ProductCard.vue'

// The home page's "New Arrivals" row: always the first thing on the page, one row that spans however wide the
// screen is, showing as many whole products as fit (never a card cut in half). Hides itself entirely when there
// are no new arrivals.
const CARD_WIDTH = 208 // px, ProductCard's fixed w-52
const GAP = 20 // px, gap-5
// enough that even a very wide monitor can fill its row, without asking the server for the whole catalogue
const FETCH_LIMIT = 24

const products = ref([])
const isLoading = ref(true)
const row = ref(null)
const fitCount = ref(5) // how many whole cards fit the row right now, known before products finish loading too

async function loadNewArrivals() {
  try {
    const response = await axios_api.get('/products/new-arrivals', {
      params: { limit: FETCH_LIMIT },
    })
    products.value = response.data.products
  } catch (err) {
    console.log('Error loading new arrivals:', err)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

// How many whole cards fit across the row's current width (used for the real cards and for how many
// skeletons to show while they are still loading, so the skeleton row is not narrower or wider than the real one)
function fitToWidth() {
  if (!row.value) return
  const perCard = CARD_WIDTH + GAP
  fitCount.value = Math.max(1, Math.floor((row.value.clientWidth + GAP) / perCard))
}

let resizeObserver = null
onMounted(() => {
  fitToWidth()
  resizeObserver = new ResizeObserver(fitToWidth)
  if (row.value) resizeObserver.observe(row.value)
  loadNewArrivals()
})
onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <section v-if="isLoading || products.length" class="px-4 pt-4">
    <h1 class="flex justify-center pb-3">
      <RouterLink
        to="/new-arrivals"
        class="max-w-full rounded-3xl bg-white/40 px-5 py-2 text-center text-xl leading-snug font-semibold text-balance break-words shadow-md transition-colors hover:bg-white/60 sm:px-6 sm:text-2xl"
      >
        New Arrivals
      </RouterLink>
    </h1>

    <div ref="row" class="flex justify-center gap-5 overflow-hidden">
      <template v-if="isLoading">
        <div
          v-for="n in fitCount"
          :key="n"
          class="h-[15.5rem] w-52 max-w-52 shrink-0 animate-pulse rounded-xl bg-blue-100/60"
        ></div>
      </template>
      <RouterLink
        v-else
        v-for="product in products.slice(0, fitCount)"
        :key="product.productID"
        :to="`/product/${product.productID}/${product.categoryID}`"
        class="shrink-0"
      >
        <ProductCard :productDetails="product" />
      </RouterLink>
    </div>
  </section>
</template>
