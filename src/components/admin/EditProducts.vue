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

    // Wait for uploaded images to be available on the server
    const imageCheckPromises = []
    for (let index = 0; index < 4; index++) {
      if (imageFiles[index] && updatedProductFromDB[`productImage${index}`]) {
        // Construct the image URL
        const imageUrl =
          `/images/${updatedProductFromDB.category1Name}/` +
          (updatedProductFromDB.category2Name ? updatedProductFromDB.category2Name + '/' : '') +
          (updatedProductFromDB.category3Name ? updatedProductFromDB.category3Name + '/' : '') +
          updatedProductFromDB[`productImage${index}`]

        // Check if the image is accessible
        imageCheckPromises.push(waitForImage(imageUrl))
      }
    }

    // Wait for all images to be accessible
    if (imageCheckPromises.length > 0) {
      await Promise.all(imageCheckPromises)
    }

    // Add cache busting timestamp to force image refresh
    const timestamp = Date.now()
    updatedProductFromDB.cacheKey = timestamp

    // Now update the UI
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

// Helper function to wait for an image to be accessible
const waitForImage = (imageUrl, maxRetries = 10, delay = 500) => {
  return new Promise((resolve) => {
    let retries = 0

    const checkImage = () => {
      const img = new Image()

      img.onload = () => {
        resolve(true)
      }

      img.onerror = () => {
        retries++
        if (retries < maxRetries) {
          setTimeout(checkImage, delay)
        } else {
          console.warn(`Image not accessible after ${maxRetries} attempts: ${imageUrl}`)
          resolve(false) // Resolve with false instead of rejecting to not break the flow
        }
      }

      // Add timestamp to prevent caching issues
      img.src = imageUrl + `?t=${Date.now()}`
    }

    checkImage()
  })
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
