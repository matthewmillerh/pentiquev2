import { computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'
const fallBackImageUrl = `${API_BASE_URL}/images/no-image.png`

export const useProductImages = (productDetails) => {
  // Return all image URLs as an array with cache-busting
  const imageUrls = computed(() => {
    if (!productDetails?.value?.imageUrls || !Array.isArray(productDetails.value.imageUrls)) {
      console.log('No imageUrls found or not an array:', productDetails?.value?.imageUrls)
      console.log('ProductDetails:', productDetails?.value)
      return []
    }

    // Add cache-busting parameter if cacheKey exists
    const cacheKey = productDetails.value.cacheKey

    return productDetails.value.imageUrls.map((url) => {
      if (url && cacheKey) {
        // Add cache-busting parameter to force browser to reload image
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}_t=${cacheKey}`
      }
      return url
    })
  })

  // Convenient getters for specific images
  const primaryImage = computed(() => imageUrls.value[0] || fallBackImageUrl)
  const secondaryImage = computed(() => imageUrls.value[1] || null)
  const tertiaryImage = computed(() => imageUrls.value[2] || null)
  const quaternaryImage = computed(() => imageUrls.value[3] || null)

  const primaryThumbnail = computed(() => imageUrls.value[4] || fallBackImageUrl)
  const secondaryThumbnail = computed(() => imageUrls.value[5] || null)
  const tertiaryThumbnail = computed(() => imageUrls.value[6] || null)
  const quaternaryThumbnail = computed(() => imageUrls.value[7] || null)

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
    primaryThumbnail,
    secondaryThumbnail,
    tertiaryThumbnail,
    quaternaryThumbnail,
    getImageByIndex,
    handleImageError,
  }
}
