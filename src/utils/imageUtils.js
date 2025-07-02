//returns the product image URL based on the product details
export const getProductImageUrl = (
  productDetails,
  imageIndex,
  options = { showPlaceholder: false },
) => {
  const baseURL =
    `/images/${productDetails.category1Name}/` +
    (productDetails.category2Name ? productDetails.category2Name + '/' : '') +
    (productDetails.category3Name ? productDetails.category3Name + '/' : '')

  // Map imageIndex to property name
  const fileNames = ['productImage0', 'productImage1', 'productImage2', 'productImage3']
  const fileNameKey = fileNames[imageIndex]
  const fileName = fileNameKey ? productDetails[fileNameKey] : null

  // For other images, control placeholder with options
  if (fileName) {
    let imageUrl = baseURL + fileName
    // Add cache busting if cacheKey exists (for recently updated products)
    if (productDetails.cacheKey) {
      imageUrl += `?v=${productDetails.cacheKey}`
    }
    return imageUrl
  } else {
    return options.showPlaceholder ? '/images/no-image.png' : null
  }
}
