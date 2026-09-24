<script setup>
import { computed, nextTick, onMounted, ref, onBeforeUnmount } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'
import CancelButton from '../shared/buttons/CancelButton.vue'
import ConfirmButton from '../shared/buttons/ConfirmButton.vue'
import EditProductImage from '@/components/admin/images/EditProductImage.vue'
import { useProductImages } from '@/composables/useProductImages'
import DeleteButton from '@/components/shared/buttons/DeleteButton.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'
import CategoryCascadeSelect from '@/components/shared/CategoryCascadeSelect.vue'
import { axios_api } from '@/scripts/global'

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'
const NO_IMAGE_URL = `${API_BASE_URL}/images/no-image.png`

const categoryInput = ref(null)
const modalWrapper = ref(null)

// Arrays to hold new image files and URLs for previews
const newImageFiles = ref([null, null, null, null])
const newImageUrls = ref([null, null, null, null])

const emit = defineEmits(['update', 'close', 'delete'])

const props = defineProps({
  productDetails: Object,
  isUpdating: {
    type: Boolean,
    default: false,
  },
})

const categoryTree = ref([]) // all categories, for choosing which category the product belongs to

// The look of the text, number and description fields
const fieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'

const productDetailsCopy = ref({ ...props.productDetails }) // This will hold the product details passed from the parent component

//get image URLs and handle image errors using the composable
const { primaryImage, secondaryImage, tertiaryImage, quaternaryImage, handleImageError } =
  useProductImages(productDetailsCopy)

onMounted(async () => {
  try {
    categoryTree.value = (await axios_api.get('/admin/get-all-categories')).data
  } catch (error) {
    console.error('Error loading categories:', error)
  }

  // Set focus on the input field for the new category name
  nextTick(() => {
    if (categoryInput.value) {
      categoryInput.value.focus()
    }
  })

  console.log('Product details copy:', productDetailsCopy.value.productFeatured)
})

// Returns the correct image for each slot
const displayedImage = (idx) => {
  // If there's a new image being previewed, show it
  if (newImageUrls.value[idx]) return newImageUrls.value[idx]

  // Debug: Log the value to see what we're actually getting
  const imageValue = productDetailsCopy.value[`productImage${idx}`]

  // If the original image has been deleted or is falsy/empty, show no-image
  if (!imageValue || typeof imageValue !== 'string' || imageValue.trim() === '') {
    return NO_IMAGE_URL
  }

  // Otherwise show the original image from the composable
  switch (idx) {
    case 0:
      return primaryImage.value || NO_IMAGE_URL
    case 1:
      return secondaryImage.value || NO_IMAGE_URL
    case 2:
      return tertiaryImage.value || NO_IMAGE_URL
    case 3:
      return quaternaryImage.value || NO_IMAGE_URL
  }
}

// Stock must be a whole number, 0 or more (0 is out of stock)
const stockIsValid = computed(() => {
  const stock = productDetailsCopy.value.productStock
  return stock !== '' && stock !== null && Number.isInteger(Number(stock)) && Number(stock) >= 0
})

// Triggers the create function in the parent component and then closes the modal
const confirm = () => {
  if (props.isUpdating) return // Prevent multiple submissions
  if (!stockIsValid.value) return
  emit('update', productDetailsCopy.value, newImageFiles.value)
  // Don't close the wrapper immediately - let the parent handle it after successful update
}

// Deletes the product by emitting the delete event
const deleteProduct = () => {
  if (props.isUpdating) return // Prevent multiple submissions

  // Show confirmation dialog
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${productDetailsCopy.value.productName}"?\n\n` +
      `This action cannot be undone and will permanently remove:\n` +
      `• Product: ${productDetailsCopy.value.productName}\n` +
      `• Code: ${productDetailsCopy.value.productCode}\n` +
      `• All associated images\n\n` +
      `Click OK to delete or Cancel to keep the product.`,
  )

  if (confirmDelete) {
    emit('delete', productDetailsCopy.value)
  }
}

// Trigger the exit transition in the modal wrapper component
const closeWrapper = () => {
  if (modalWrapper.value) {
    modalWrapper.value.close()
  } else {
    console.warn('Child component ref is not available yet.')
  }
}

// Unmount the modal by emitting the close event
const unMount = () => {
  emit('close')
}

// Handle image deletion
function onImageDelete(idx) {
  newImageFiles.value[idx] = null
  if (newImageUrls.value[idx]) {
    URL.revokeObjectURL(newImageUrls.value[idx])
    newImageUrls.value[idx] = null
  }
  productDetailsCopy.value[`productImage${idx}`] = ''
  console.log(`Image at index ${idx} deleted. ${productDetailsCopy.value[`productImage${idx}`]}`)
}

// Handle image change
function onImageChange(event, idx) {
  const file = event.target.files[0]
  if (file) {
    newImageFiles.value[idx] = file
    if (newImageUrls.value[idx]) {
      URL.revokeObjectURL(newImageUrls.value[idx])
    }
    newImageUrls.value[idx] = URL.createObjectURL(file)

    // Get file extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'))
    // Set filename as productID_index.extension
    productDetailsCopy.value[`productImage${idx}`] =
      `${productDetailsCopy.value.productID}_${idx}${fileExtension}`
  }
}

onBeforeUnmount(() => {
  newImageUrls.value.forEach((url) => {
    if (url) URL.revokeObjectURL(url)
  })
})
</script>
<template>
  <ModalWrapper fullscreen @close="unMount" ref="modalWrapper">
    <template #header>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium tracking-wide text-gray-500 uppercase">Edit product</p>
        <h2 class="truncate text-lg font-semibold text-gray-900">
          {{ productDetailsCopy.productName || 'Untitled product' }}
        </h2>
      </div>
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-default disabled:opacity-40"
        aria-label="Close without saving"
        :disabled="isUpdating"
        @click="closeWrapper()"
      >
        ✕
      </button>
    </template>

    <!-- Saving: covers the whole modal so nothing can be changed meanwhile -->
    <div
      v-if="isUpdating"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/40"
    >
      <div class="rounded-lg bg-white p-6 text-center shadow-lg">
        <LoadingSpinner text="Updating product..." />
        <p class="mt-2 text-xs text-gray-600">Please wait while we save your changes</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
      <!-- Images -->
      <section aria-label="Images" class="flex flex-col gap-3">
        <EditProductImage
          :image-url="displayedImage(0)"
          :image-index="0"
          @change="onImageChange"
          @error="handleImageError"
        ></EditProductImage>
        <div class="grid grid-cols-3 gap-3">
          <EditProductImage
            v-for="index in [1, 2, 3]"
            :key="index"
            :image-url="displayedImage(index)"
            :image-index="index"
            @change="onImageChange"
            @error="handleImageError"
            @delete="onImageDelete"
          ></EditProductImage>
        </div>
        <p class="text-center text-xs text-gray-500">Click an image to replace it.</p>
      </section>

      <!-- Details -->
      <section aria-label="Details" class="flex flex-col gap-4 text-sm">
        <div>
          <label for="edit-product-name" class="mb-1 block font-medium text-gray-700">Name</label>
          <input
            id="edit-product-name"
            type="text"
            :class="fieldClass"
            v-model="productDetailsCopy.productName"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="edit-product-code" class="mb-1 block font-medium text-gray-700">Code</label>
            <input
              id="edit-product-code"
              type="text"
              maxlength="11"
              :class="fieldClass"
              v-model="productDetailsCopy.productCode"
            />
            <p class="mt-1 text-xs text-gray-500">Up to 11 characters.</p>
          </div>
          <div>
            <label for="product-stock" class="mb-1 block font-medium text-gray-700">Stock</label>
            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              name="product-stock"
              :class="fieldClass"
              v-model="productDetailsCopy.productStock"
            />
            <p v-if="!stockIsValid" class="mt-1 text-xs text-red-600">
              Enter a whole number, 0 or more.
            </p>
            <p v-else class="mt-1 text-xs text-gray-500">
              {{
                Number(productDetailsCopy.productStock) > 0 ? 'In stock' : 'Shown as out of stock'
              }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="edit-product-price" class="mb-1 block font-medium text-gray-700">
              Price (R)
            </label>
            <input
              id="edit-product-price"
              type="number"
              min="0"
              step="0.01"
              name="product-price"
              :class="fieldClass"
              v-model="productDetailsCopy.productPrice"
            />
          </div>
          <div>
            <label for="edit-product-special-price" class="mb-1 block font-medium text-gray-700">
              Special price (R)
            </label>
            <input
              id="edit-product-special-price"
              type="number"
              min="0"
              step="0.01"
              name="product-special-price"
              :class="fieldClass"
              v-model="productDetailsCopy.productSpecialPrice"
            />
          </div>
        </div>

        <div>
          <p class="mb-1 font-medium text-gray-700">Category</p>
          <CategoryCascadeSelect
            v-model="productDetailsCopy.categoryID"
            :categories="categoryTree"
          />
        </div>

        <fieldset class="flex flex-wrap gap-x-6 gap-y-2">
          <legend class="sr-only">Options</legend>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="product-special"
              class="h-4 w-4 accent-blue-600"
              v-model="productDetailsCopy.productSpecial"
              :true-value="1"
              :false-value="0"
            />
            On special
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="product-featured"
              class="h-4 w-4 accent-blue-600"
              v-model="productDetailsCopy.productFeatured"
              :true-value="1"
              :false-value="0"
            />
            Featured category image
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="product-hidden"
              class="h-4 w-4 accent-blue-600"
              v-model="productDetailsCopy.productHidden"
              :true-value="1"
              :false-value="0"
            />
            Hide from customers
          </label>
        </fieldset>

        <div>
          <label for="edit-product-description" class="mb-1 block font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="edit-product-description"
            rows="8"
            :class="[fieldClass, 'min-h-40 resize-y']"
            v-model="productDetailsCopy.productDescription"
          ></textarea>
        </div>
      </section>
    </div>

    <template #footer>
      <DeleteButton text="Delete Product" @delete="deleteProduct"></DeleteButton>
      <div class="ml-auto flex gap-2">
        <CancelButton @close="closeWrapper()" :disabled="isUpdating"></CancelButton>
        <ConfirmButton @confirm="confirm()" :disabled="isUpdating">
          <span v-if="isUpdating">Updating...</span>
          <span v-else>Update Product</span>
        </ConfirmButton>
      </div>
    </template>
  </ModalWrapper>
</template>
<style scoped>
/* For Webkit browsers (Chrome, Safari, Edge, Opera) */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For Firefox */
input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>
