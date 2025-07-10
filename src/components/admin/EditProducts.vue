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
const isUpdating = ref(false)

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
  isUpdating.value = false
}

// Update the product details after editing
const updateProduct = async (updatedProduct, imageFiles) => {
  isUpdating.value = true

  const formData = new FormData()
  formData.append('productDetails', JSON.stringify(updatedProduct))

  for (let index = 0; index < 4; index++) {
    formData.append(`image_${index}`, imageFiles[index] || null)
  }

  try {
    // Update the product in the database
    const response = await axios_api.put('/products/edit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Use the updated product data from the backend response
    const updatedProductFromDB = response.data

    // Add cache busting timestamp to force image refresh
    const timestamp = Date.now()
    updatedProductFromDB.cacheKey = timestamp

    // Update the UI immediately since images are served via API
    const index = products.value.findIndex((p) => p.productID === updatedProduct.productID)
    if (index !== -1) {
      products.value[index] = updatedProductFromDB
      filteredProducts.value = products.value.filter(filterProducts)
    }
    console.log('Product updated successfully')
    resetModal()
  } catch (error) {
    console.error('Error updating product:', error)
    isUpdating.value = false
  }
}

// Delete product function
const deleteProduct = async (productDetails) => {
  try {
    await axios_api.delete('/products/delete', { data: { product: productDetails } })
    products.value = products.value.filter(
      (product) => product.productID !== productDetails.productID,
    )
    filteredProducts.value = products.value.filter(filterProducts)
    console.log('Product deleted successfully')
    resetModal() // Close the modal after successful deletion
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}
</script>
<template>
  <!-- Products display -->
  <h1 class="p-3 text-center text-lg font-semibold">{{ currentCategory }}</h1>
  <div class="flex flex-wrap justify-center gap-5 p-4">
    <div
      v-for="product in filteredProducts"
      :key="`${product.productID}-${product.cacheKey || 0}`"
      @click="showEditProductModal(product)"
      class="cursor-pointer"
    >
      <ProductCard :productDetails="product"></ProductCard>
    </div>
  </div>

  <!-- EditProductModal -->
  <EditProductModal
    v-if="showEditModal"
    :product-details="productToEdit"
    :is-updating="isUpdating"
    @close="resetModal"
    @update="updateProduct"
    @delete="deleteProduct"
  ></EditProductModal>
</template>
<style scoped></style>
