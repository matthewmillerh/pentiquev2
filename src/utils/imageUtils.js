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
  const fileNames = ['productFileName', 'productFile2Name', 'productFile3Name', 'productFile4Name']
  const fileNameKey = fileNames[imageIndex]
  const fileName = fileNameKey ? productDetails[fileNameKey] : null

  // For other images, control placeholder with options
  if (fileName) {
    return baseURL + fileName
  } else {
    return options.showPlaceholder ? '/images/no-image.png' : null
  }
}
