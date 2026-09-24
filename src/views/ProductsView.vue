<script setup>
import { computed, ref, watch } from 'vue'
import { axios_api } from '@/scripts/global'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/shared/ProductCard.vue'
import { useStoreCategoryTree } from '@/composables/useStoreCategoryTree'
import { findNode } from '@/utils/categoryTree'

const route = useRoute()
const category = ref(null) // { id, name, path: [{ id, name }] }
const products = ref([])
const notFound = ref(false)

// The direct subcategories of this category that have products, for the bar under the title
const { tree } = useStoreCategoryTree()
const subcategories = computed(() =>
  category.value ? findNode(tree.value, category.value.id)?.subcategories || [] : [],
)

const categoryLink = (step) => ({
  name: 'category',
  params: { categoryID: step.id, categoryName: step.name },
})

//get all products in the current category, including those in its subcategories
async function getProductsByCategory() {
  try {
    const response = await axios_api.get('/products-by-category/' + route.params.categoryID)
    category.value = response.data.category
    products.value = response.data.products.filter((product) => product.productHidden !== 1)
    notFound.value = false
  } catch (err) {
    console.log('Error fetching products:', err)
    category.value = null
    products.value = []
    notFound.value = err.response?.status === 404
  }
}

//Change which products are shown when the route params change categoryID
watch(() => route.params.categoryID, getProductsByCategory, { immediate: true })
</script>
<template>
  <div>
    <!-- Breadcrumb: where this category sits, every step above it goes back up -->
    <nav v-if="category" aria-label="Breadcrumb" class="-mt-1 mb-1 px-4 text-sm">
      <ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <li>
          <RouterLink to="/" class="text-gray-700 underline-offset-2 hover:underline">
            Home
          </RouterLink>
        </li>
        <li
          v-for="(step, index) in category.path"
          :key="step.id"
          class="flex items-center gap-x-1.5"
        >
          <span class="text-gray-500" aria-hidden="true">›</span>
          <RouterLink
            v-if="index < category.path.length - 1"
            :to="categoryLink(step)"
            class="text-gray-700 underline-offset-2 hover:underline"
          >
            {{ step.name }}
          </RouterLink>
          <span v-else class="font-semibold text-gray-900" aria-current="page">
            {{ step.name }}
          </span>
        </li>
      </ol>
    </nav>

    <!-- The pill is one block, so a long name wraps inside it instead of breaking it up -->
    <h1 v-if="category" class="flex justify-center px-4 py-3">
      <span
        class="max-w-full rounded-3xl bg-white/40 px-5 py-2 text-center text-xl leading-snug font-semibold text-balance break-words shadow-md sm:px-6 sm:text-2xl"
      >
        {{ category.name }}
      </span>
    </h1>

    <!-- The direct subcategories: choosing one makes it the category shown here, with its own subcategories -->
    <nav v-if="subcategories.length" aria-label="Subcategories" class="mt-2 px-4">
      <ul
        class="subcategory-bar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible"
      >
        <li v-for="sub in subcategories" :key="sub.id" class="shrink-0">
          <RouterLink
            :to="categoryLink(sub)"
            class="flex items-center gap-1.5 rounded-full border border-blue-300 bg-white/70 px-3 py-1.5 text-sm whitespace-nowrap shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-200"
          >
            {{ sub.name }}
            <span class="rounded-full bg-blue-100 px-1.5 text-xs text-gray-600">
              {{ sub.productCount }}
            </span>
            <span v-if="sub.subcategories.length" class="text-gray-500" aria-hidden="true">›</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <p v-if="notFound" class="p-8 text-center">This category could not be found.</p>
    <p v-else-if="category && !products.length" class="p-8 text-center">
      There are no products in this category yet.
    </p>
    <div class="flex flex-wrap justify-center gap-5 p-4">
      <div v-for="product in products" :key="product.productID">
        <RouterLink :to="`/product/${product.productID}/${product.categoryID}`">
          <ProductCard :productDetails="product"></ProductCard>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* On phones the subcategories scroll sideways in one row, without a visible scrollbar */
.subcategory-bar {
  scrollbar-width: none;
}
.subcategory-bar::-webkit-scrollbar {
  display: none;
}
</style>
