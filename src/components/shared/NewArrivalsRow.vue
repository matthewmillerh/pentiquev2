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
  <div v-if="isLoading || products.length" class="px-4 pt-4">
    <!-- Its own card, spanning the full row, so it reads as a section rather than blending into the category
    grid below (which looks the same shade of blue as every product card). The whole header opens the full page. -->
    <section
      class="overflow-hidden rounded-2xl border border-pink-200/70 bg-gradient-to-br from-pink-50/80 via-amber-50/50 to-blue-50/70 shadow-md shadow-pink-900/5"
    >
      <RouterLink
        to="/new-arrivals"
        class="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-200 hover:bg-white/35 sm:px-5"
      >
        <h1 class="flex min-w-0 items-center gap-2 text-lg font-semibold text-gray-900 sm:text-xl">
          <font-awesome-icon icon="star" class="shrink-0 text-base text-amber-500" />
          <span class="truncate">New Arrivals</span>
        </h1>
        <span class="flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600">
          See all
          <font-awesome-icon icon="chevron-right" class="text-xs" />
        </span>
      </RouterLink>

      <!-- the padding lives here, not on the measured row itself, so its clientWidth is exactly the space cards
      have to lay out in -->
      <div class="px-4 pb-4 sm:px-5">
        <div ref="row" class="flex justify-center gap-5 overflow-hidden">
          <template v-if="isLoading">
            <div
              v-for="n in fitCount"
              :key="n"
              class="h-[15.5rem] w-52 max-w-52 shrink-0 animate-pulse rounded-xl bg-white/50"
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
      </div>
    </section>
  </div>
</template>
