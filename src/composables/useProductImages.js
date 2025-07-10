import { computed } from 'vue'

export const useProductImages = (productDetails) => {
  // Return all image URLs as an array
  const imageUrls = computed(() => {
    if (!productDetails?.value?.imageUrls || !Array.isArray(productDetails.value.imageUrls)) {
      return []
    }

    return productDetails.value.imageUrls
      .map((url) => {
        if (!url) return null

        // Add cache busting if available
        let imageUrl = url
        if (productDetails.value.cacheKey) {
          imageUrl += `?v=${productDetails.value.cacheKey}`
        }

        return imageUrl
      })
      .filter(Boolean) // Remove null values
  })

  // Convenient getters for specific images
  const primaryImage = computed(() => imageUrls.value[0] || '/api/images/no-image.png')
  const secondaryImage = computed(() => imageUrls.value[1])
  const tertiaryImage = computed(() => imageUrls.value[2])
  const quaternaryImage = computed(() => imageUrls.value[3])

  // Helper function to get image by index
  const getImageByIndex = (index) => {
    return imageUrls.value[index] || '/api/images/no-image.png'
  }

  // Error handler
  const handleImageError = (event) => {
    event.target.src = '/api/images/no-image.png'
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
