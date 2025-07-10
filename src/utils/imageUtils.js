//returns the product image URL based on the product details
export const getProductImageUrl = (
  productDetails,
  imageIndex,
  options = { showPlaceholder: false },
) => {
  // Map imageIndex to property name
  const fileNames = ['productImage0', 'productImage1', 'productImage2', 'productImage3']
  const fileNameKey = fileNames[imageIndex]
  const fileName = fileNameKey ? productDetails[fileNameKey] : null

  // For other images, control placeholder with options
  if (fileName) {
    // Use API endpoint for images
    let imageUrl = `/api/images/product/${productDetails.productID}/${imageIndex}`
    // Add cache busting if cacheKey exists (for recently updated products)
    if (productDetails.cacheKey) {
      imageUrl += `?v=${productDetails.cacheKey}`
    }
    return imageUrl
  } else {
    return options.showPlaceholder ? '/images/no-image.png' : null
  }
}
