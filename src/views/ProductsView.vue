<script setup>
import { onMounted, ref, watch } from 'vue'
import { axios_api } from '@/scripts/global'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/shared/ProductCard.vue'

const products = ref(null)
const filteredProducts = ref(null)
const route = useRoute()
const currentCategory = ref(null)

onMounted(() => {
  setTimeout(() => getProductsByCategory(), 500)
  currentCategory.value = route.params.category
})

//get all products for the current level 1 category
async function getProductsByCategory() {
  try {
    const response = await axios_api.get('/products-by-category/' + route.params.category1ID)
    products.value = response.data
    filteredProducts.value = products.value.filter(filterProducts)
  } catch (err) {
    console.log(err)
  }
}

//Change which level 1 category products are shown when the route params change categoryID
watch(
  () => route.params.category1ID,
  () => {
    setTimeout(() => getProductsByCategory(), 500)
  },
)

//Change which category products are shown when the route params change
watch(
  () => route.params.category,
  () => {
    currentCategory.value = route.params.category

    filteredProducts.value = products.value.filter(filterProducts)
  },
)

const filterProducts = (product) => {
  return (
    product.category1Name === currentCategory.value ||
    product.category2Name === currentCategory.value ||
    product.category3Name === currentCategory.value
  )
}
</script>
<template>
  <div>
    <h1 class="p-3 text-center text-lg font-semibold">{{ currentCategory }}</h1>
    <div class="flex flex-wrap justify-center gap-5 p-4">
      <div v-for="product in filteredProducts" :key="product.productID">
        <RouterLink :to="`/product/${product.productID}/${product.category1ID}`">
          <ProductCard :productDetails="product"></ProductCard>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style></style>
