import { computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'
const fallBackImageUrl = `${API_BASE_URL}/images/no-image.png`

export const useProductImages = (productDetails) => {
  // Return all image URLs as an array
  const imageUrls = computed(() => {
    if (!productDetails?.value?.imageUrls || !Array.isArray(productDetails.value.imageUrls)) {
      console.log('No imageUrls found or not an array:', productDetails?.value?.imageUrls)
      console.log('ProductDetails:', productDetails?.value)
      return []
    }

    return productDetails.value.imageUrls
  })

  // Convenient getters for specific images
  const primaryImage = computed(() => imageUrls.value[0] || fallBackImageUrl)
  const secondaryImage = computed(() => imageUrls.value[1] || null)
  const tertiaryImage = computed(() => imageUrls.value[2] || null)
  const quaternaryImage = computed(() => imageUrls.value[3] || null)

  // Helper function to get image by index
  const getImageByIndex = (index) => {
    return imageUrls.value[index] || fallBackImageUrl
  }

  // Error handler
  const handleImageError = (event) => {
    event.target.src = fallBackImageUrl
  }

  return {
    imageUrls,
    primaryImage,
    secondaryImage,
    tertiaryImage,
    quaternaryImage,
    getImageByIndex,
    handleImageError,
  }
}
