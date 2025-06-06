<script setup>
import { axios_api } from '@/scripts/global.js'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/shared/ProductCard.vue'
import EditProductModal from '@/components/admin/EditProductModal.vue'

const products = ref(null)
const filteredProducts = ref(null)
const route = useRoute()
const currentCategory = ref(null)
const showEditModal = ref(false)

// The current product to be edited in the modal
const productToEdit = ref(null)

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

// Show the edit product modal with the selected product
const showEditProductModal = (product) => {
  productToEdit.value = product
  showEditModal.value = true
}

// Reset the modal state after closing it
const resetModal = () => {
  productToEdit.value = null
  showEditModal.value = false
}
</script>
<template>
  <!-- Products display -->
  <h1 class="p-3 text-center text-lg font-semibold">{{ currentCategory }}</h1>
  <div class="flex flex-wrap justify-center gap-5 p-4">
    <div
      v-for="product in filteredProducts"
      :key="product.productID"
      @click="showEditProductModal(product)"
      class="cursor-pointer"
    >
      <ProductCard
        :category1-name="product.category1Name"
        :category2-name="product.category2Name"
        :category3-name="product.category3Name"
        :product-name="product.productName"
        :image-u-r-l="product.productFileName"
        :product-special="product.productSpecial"
        :product-special-price="product.productSpecialPrice"
        :product-price="product.productPrice"
        :product-availability="product.productStockStatus"
      ></ProductCard>
    </div>
  </div>

  <!-- EditProductModal -->
  <EditProductModal
    v-if="showEditModal"
    :title="productToEdit.productName"
    :product-details="productToEdit"
    @close="resetModal()"
  ></EditProductModal>
</template>
<style scoped></style>
