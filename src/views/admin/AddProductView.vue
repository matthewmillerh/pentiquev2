<script setup>
import { ref, onMounted, computed, useTemplateRef } from 'vue'
import { axios_api } from '@/scripts/global'
import LoadingSpinner from '@/components/admin/ui/LoadingSpinner.vue'
import ModalWrapper from '@/components/shared/ModalWrapper.vue'

// Loading states
const isLoading = ref(false)
const isSaving = ref(false)

// Category data
const allCategories = ref([])

// Product form data
const productData = ref({
  productName: '',
  productCode: '',
  productPrice: '',
  productSpecialPrice: '',
  productDescription: '',
  productStockStatus: 'In Stock',
  productHidden: false,
  productSpecial: false,
  productFeatured: false,
  category1ID: '',
  category2ID: '',
  category3ID: '',
  productPosition1: '',
  productPosition2: '',
  productPosition3: '',
})

// Image handling - 4 slots like EditProductModal
const selectedFiles = ref([null, null, null, null])
const imagePreviews = ref([null, null, null, null])
const imageUploadProgress = ref(0)

// Modal state
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')

// Template refs for file inputs using Vue 3.5 useTemplateRef
const imageInput0 = useTemplateRef('imageInput0')
const imageInput1 = useTemplateRef('imageInput1')
const imageInput2 = useTemplateRef('imageInput2')
const imageInput3 = useTemplateRef('imageInput3')

// Form validation
const formErrors = ref({})

// Computed properties for dependent category options
const category2Options = computed(() => {
  if (!productData.value.category1ID) return []
  const category1 = allCategories.value.find((cat) => cat.id == productData.value.category1ID)
  return category1?.subcategories || []
})

const category3Options = computed(() => {
  if (!productData.value.category2ID) return []
  const category2 = category2Options.value.find((cat) => cat.id == productData.value.category2ID)
  return category2?.subcategories || []
})

onMounted(async () => {
  await loadCategories()
})

// Load all categories for the dropdown menus
const loadCategories = async () => {
  try {
    const response = await axios_api.get('/get-all-categories')
    allCategories.value = response.data
  } catch (error) {
    console.error('Error loading categories:', error)
    alert('Failed to load categories. Please refresh the page.')
  }
}

// Handle file selection for specific image slot
const handleFileSelect = (event, slotIndex) => {
  const file = event.target.files[0]
  if (file) {
    selectedFiles.value[slotIndex] = file

    // Generate image preview for this slot
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviews.value[slotIndex] = {
        name: file.name,
        url: e.target.result,
      }
    }
    reader.readAsDataURL(file)
  }
}

// Remove an image from a specific slot
const removeImage = (slotIndex) => {
  selectedFiles.value[slotIndex] = null
  imagePreviews.value[slotIndex] = null

  // Reset the file input for this slot
  const inputRefs = [imageInput0, imageInput1, imageInput2, imageInput3]
  if (inputRefs[slotIndex].value) {
    inputRefs[slotIndex].value.value = ''
  }
}

// Trigger file input click for specific slot
const triggerFileInput = (slotIndex) => {
  const inputRefs = [imageInput0, imageInput1, imageInput2, imageInput3]
  inputRefs[slotIndex].value?.click()
}

// Validate form data
const validateForm = () => {
  formErrors.value = {}
  let isValid = true

  if (!productData.value.productName.trim()) {
    formErrors.value.productName = 'Product name is required'
    isValid = false
  }

  if (!productData.value.productCode.trim()) {
    formErrors.value.productCode = 'Product code is required'
    isValid = false
  }

  if (!productData.value.productPrice || productData.value.productPrice <= 0) {
    formErrors.value.productPrice = 'Valid product price is required'
    isValid = false
  }

  if (!productData.value.category1ID) {
    formErrors.value.category1ID = 'Main category is required'
    isValid = false
  }

  if (!selectedFiles.value.some((file) => file !== null)) {
    formErrors.value.images = 'At least one product image is required'
    isValid = false
  }

  return isValid
}

// Reset category dependencies when parent category changes
const onCategory1Change = () => {
  productData.value.category2ID = ''
  productData.value.category3ID = ''
}

const onCategory2Change = () => {
  productData.value.category3ID = ''
}

// Show modal with message
const showModalMessage = (title, message) => {
  console.log('Showing modal:', title, message)
  modalTitle.value = title
  modalMessage.value = message
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false

  // If this was a success modal, clear the form for next product
  if (modalTitle.value === 'Success!') {
    // Clear product data
    productData.value = {
      productName: '',
      productCode: '',
      productPrice: '',
      productSpecialPrice: '',
      productDescription: '',
      productStockStatus: 'In Stock',
      productHidden: false,
      productSpecial: false,
      productFeatured: false,
      category1ID: '',
      category2ID: '',
      category3ID: '',
      productPosition1: '',
      productPosition2: '',
      productPosition3: '',
    }

    // Clear images
    selectedFiles.value = [null, null, null, null]
    imagePreviews.value = [null, null, null, null]
    imageUploadProgress.value = 0

    // Clear form errors
    formErrors.value = {}

    // Also clear the file input values
    const inputRefs = [imageInput0, imageInput1, imageInput2, imageInput3]
    inputRefs.forEach((ref) => {
      if (ref.value) {
        ref.value.value = ''
      }
    })

    // Scroll to top of page for next product entry
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Save the new product with images in one request
const saveProduct = async () => {
  if (!validateForm()) {
    return
  }

  isSaving.value = true

  try {
    // Create FormData to send product details and images together
    const formData = new FormData()

    // Add product data as JSON string (matching EditProducts pattern)
    const productDetails = {
      productName: productData.value.productName,
      productCode: productData.value.productCode,
      productPrice: parseFloat(productData.value.productPrice),
      productSpecialPrice: productData.value.productSpecialPrice
        ? parseFloat(productData.value.productSpecialPrice)
        : 0,
      productDescription: productData.value.productDescription,
      productStockStatus: productData.value.productStockStatus,
      productHidden: productData.value.productHidden,
      productSpecial: productData.value.productSpecial,
      productFeatured: productData.value.productFeatured,
      category1ID: productData.value.category1ID,
      category2ID: productData.value.category2ID || '',
      category3ID: productData.value.category3ID || '',
      productPosition1: productData.value.productPosition1
        ? parseInt(productData.value.productPosition1)
        : 0,
      productPosition2: productData.value.productPosition2
        ? parseInt(productData.value.productPosition2)
        : 0,
      productPosition3: productData.value.productPosition3
        ? parseInt(productData.value.productPosition3)
        : 0,
    }

    formData.append('productDetails', JSON.stringify(productDetails))

    // Add images with index-based naming (matching EditProducts pattern)
    imageUploadProgress.value = 0
    let totalFiles = selectedFiles.value.filter((file) => file !== null).length
    let uploadedCount = 0

    // Add all 4 image slots (even if null) to match backend expectations
    for (let i = 0; i < 4; i++) {
      if (selectedFiles.value[i]) {
        // Add the actual file
        formData.append(`image_${i}`, selectedFiles.value[i])
        // Add the filename for the database column
        formData.append(`productImage${i}`, selectedFiles.value[i].name)
        uploadedCount++
        imageUploadProgress.value = (uploadedCount / totalFiles) * 100
      } else {
        // Send null for empty slots
        formData.append(`image_${i}`, null)
        formData.append(`productImage${i}`, '')
      }
    }

    // Send everything in one request
    console.log('Sending product data to backend...')
    const response = await axios_api.post('/products/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('Backend response:', response)
    if (response.status === 200 || response.status === 201 || response.data.productID) {
      console.log('Product created successfully, showing modal')
      showModalMessage('Success!', 'Product created successfully!')
      // Don't navigate automatically - let user close modal first
    }
  } catch (error) {
    console.error('Error saving product:', error)
    const errorMessage =
      error.response?.data?.message || 'Failed to save product. Please try again.'
    showModalMessage('Error', errorMessage)
  } finally {
    isSaving.value = false
  }
}

// Clear the form
const clearForm = () => {
  if (confirm('Are you sure you want to clear all form data?')) {
    // Reset product data
    productData.value = {
      productName: '',
      productCode: '',
      productPrice: '',
      productSpecialPrice: '',
      productDescription: '',
      productStockStatus: 'In Stock',
      productHidden: false,
      productSpecial: false,
      productFeatured: false,
      category1ID: '',
      category2ID: '',
      category3ID: '',
      productPosition1: '',
      productPosition2: '',
      productPosition3: '',
    }

    // Clear images
    selectedFiles.value = [null, null, null, null]
    imagePreviews.value = [null, null, null, null]
    imageUploadProgress.value = 0

    // Clear form errors
    formErrors.value = {}
  }
}
</script>

<template>
  <div class="min-h-screen p-6">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <LoadingSpinner text="Loading..." />
    </div>

    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-center text-3xl font-bold text-gray-800">Add New Product</h1>
      </div>

      <!-- Main form -->
      <div
        class="rounded-lg border border-neutral-200 bg-white p-6 shadow-lg"
        style="z-index: 10; position: relative"
      >
        <form @submit.prevent="saveProduct" class="space-y-6">
          <!-- Product Images Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="mb-4 text-xl font-semibold">Product Images</h2>

            <div v-if="formErrors.images" class="mb-4 text-sm text-red-600">
              {{ formErrors.images }}
            </div>

            <!-- Main Image (Slot 0) -->
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-700">Main Product Image</label>
              <div class="flex justify-center">
                <div class="group relative">
                  <div
                    class="flex h-64 w-64 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400"
                    :class="imagePreviews[0] ? 'border-solid border-blue-300' : ''"
                    @click="triggerFileInput(0)"
                  >
                    <img
                      v-if="imagePreviews[0]"
                      :src="imagePreviews[0].url"
                      :alt="imagePreviews[0].name"
                      class="h-full w-full rounded-lg object-contain"
                    />
                    <div v-else class="text-center text-gray-500">
                      <svg
                        class="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <p class="mt-2 text-sm">Click to upload main image</p>
                    </div>
                  </div>
                  <button
                    v-if="imagePreviews[0]"
                    type="button"
                    @click="removeImage(0)"
                    class="absolute top-2 right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <input
                id="imageInput0"
                ref="imageInput0"
                type="file"
                accept="image/*"
                class="hidden"
                @change="(e) => handleFileSelect(e, 0)"
              />
            </div>

            <!-- Additional Images (Slots 1, 2, 3) -->
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-700">Additional Images</label>
              <div class="grid grid-cols-3 gap-4">
                <div v-for="index in [1, 2, 3]" :key="index" class="group relative">
                  <div
                    class="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400"
                    :class="imagePreviews[index] ? 'border-solid border-blue-300' : ''"
                    @click="triggerFileInput(index)"
                  >
                    <img
                      v-if="imagePreviews[index]"
                      :src="imagePreviews[index].url"
                      :alt="imagePreviews[index].name"
                      class="h-full w-full rounded-lg object-contain"
                    />
                    <div v-else class="text-center text-gray-500">
                      <svg
                        class="mx-auto h-8 w-8 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <p class="mt-1 text-xs">Click to upload</p>
                    </div>
                  </div>
                  <button
                    v-if="imagePreviews[index]"
                    type="button"
                    @click="removeImage(index)"
                    class="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- Hidden file inputs for slots 1, 2, 3 -->
              <input
                :id="`imageInput1`"
                ref="imageInput1"
                type="file"
                accept="image/*"
                class="hidden"
                @change="(e) => handleFileSelect(e, 1)"
              />
              <input
                :id="`imageInput2`"
                ref="imageInput2"
                type="file"
                accept="image/*"
                class="hidden"
                @change="(e) => handleFileSelect(e, 2)"
              />
              <input
                :id="`imageInput3`"
                ref="imageInput3"
                type="file"
                accept="image/*"
                class="hidden"
                @change="(e) => handleFileSelect(e, 3)"
              />
            </div>

            <p class="text-sm text-gray-500">
              Upload up to 4 images for your product. The first image will be the main product
              image.
            </p>

            <!-- Upload progress -->
            <div v-if="imageUploadProgress > 0 && imageUploadProgress < 100" class="mt-4">
              <div class="flex items-center">
                <div class="h-2 flex-1 rounded-full bg-gray-200">
                  <div
                    class="h-2 rounded-full bg-blue-500 transition-all duration-300"
                    :style="{ width: imageUploadProgress + '%' }"
                  ></div>
                </div>
                <span class="ml-2 text-sm text-gray-600">
                  {{ Math.round(imageUploadProgress) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Product Details Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="mb-4 text-xl font-semibold">Product Details</h2>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Product Name -->
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700">Product Name *</label>
                <input
                  v-model="productData.productName"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter product name"
                />
                <div v-if="formErrors.productName" class="mt-1 text-sm text-red-600">
                  {{ formErrors.productName }}
                </div>
              </div>

              <!-- Product Code -->
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700">Product Code *</label>
                <input
                  v-model="productData.productCode"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter product code"
                />
                <div v-if="formErrors.productCode" class="mt-1 text-sm text-red-600">
                  {{ formErrors.productCode }}
                </div>
              </div>

              <!-- Product Price -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Product Price *</label>
                <input
                  v-model="productData.productPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
                <div v-if="formErrors.productPrice" class="mt-1 text-sm text-red-600">
                  {{ formErrors.productPrice }}
                </div>
              </div>

              <!-- Special Price -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  Special Price (Optional)
                </label>
                <input
                  v-model="productData.productSpecialPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <!-- Stock Status -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Stock Status</label>
                <select
                  v-model="productData.productStockStatus"
                  class="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Limited Stock">Limited Stock</option>
                </select>
              </div>

              <!-- Product Description -->
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  Product Description
                </label>
                <textarea
                  v-model="productData.productDescription"
                  rows="4"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter product description"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Categories Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="mb-4 text-xl font-semibold">Categories</h2>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
              <!-- Main Category -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Main Category *</label>
                <select
                  v-model="productData.category1ID"
                  @change="onCategory1Change"
                  required
                  class="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select main category</option>
                  <option v-for="category in allCategories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <div v-if="formErrors.category1ID" class="mt-1 text-sm text-red-600">
                  {{ formErrors.category1ID }}
                </div>
              </div>

              <!-- Sub Category -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Sub Category</label>
                <select
                  v-model="productData.category2ID"
                  @change="onCategory2Change"
                  :disabled="!productData.category1ID || category2Options.length === 0"
                  class="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select sub category</option>
                  <option
                    v-for="category in category2Options"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Sub-Sub Category -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Sub-Sub Category</label>
                <select
                  v-model="productData.category3ID"
                  :disabled="!productData.category2ID || category3Options.length === 0"
                  class="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select sub-sub category</option>
                  <option
                    v-for="category in category3Options"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Product Options Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="mb-4 text-xl font-semibold">Product Options</h2>

            <div class="hidden grid-cols-1 gap-6 md:grid-cols-3">
              <!-- Position fields -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Position 1</label>
                <input
                  v-model="productData.productPosition1"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Position 2</label>
                <input
                  v-model="productData.productPosition2"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Position 3</label>
                <input
                  v-model="productData.productPosition3"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Checkboxes -->
            <div class="mt-6 space-y-4">
              <div class="flex items-center">
                <input
                  v-model="productData.productSpecial"
                  type="checkbox"
                  id="productSpecial"
                  class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="productSpecial" class="ml-2 block cursor-pointer text-sm text-gray-700">
                  Mark as On Special
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="productData.productFeatured"
                  type="checkbox"
                  id="productFeatured"
                  class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  for="productFeatured"
                  class="ml-2 block cursor-pointer text-sm text-gray-700"
                >
                  Mark as Featured Product
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="productData.productHidden"
                  type="checkbox"
                  id="productHidden"
                  class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="productHidden" class="ml-2 block cursor-pointer text-sm text-gray-700">
                  Hide Product (not visible to customers)
                </label>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              @click="clearForm"
              :disabled="isSaving"
              class="cursor-pointer rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Clear Form
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="flex cursor-pointer items-center rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              <LoadingSpinner v-if="isSaving" text="" />
              <span class="ml-2">{{ isSaving ? 'Saving...' : 'Save Product' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for success/error messages -->
    <ModalWrapper v-if="showModal" :title="modalTitle" :message="modalMessage" @close="closeModal">
      <button
        @click="closeModal"
        class="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
      >
        OK
      </button>
    </ModalWrapper>
  </div>
</template>

<style scoped>
/* Number input styling */
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
