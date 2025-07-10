<script setup>
import { nextTick, onMounted, ref, onBeforeUnmount } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'
import CancelButton from '../shared/buttons/CancelButton.vue'
import ConfirmButton from '../shared/buttons/ConfirmButton.vue'
import { formatter } from '@/scripts/global'
import { getProductImageUrl } from '@/utils/imageUtils.js'
import EditProductImage from '@/components/admin/images/EditProductImage.vue'
import DeleteButton from '../shared/buttons/DeleteButton.vue'

const categoryInput = ref(null)
const modalWrapper = ref(null)

// Arrays to hold new image files and URLs for previews
const newImageFiles = ref([null, null, null, null])
const newImageUrls = ref([null, null, null, null])
const imageKeys = ref([Date.now(), Date.now() + 1, Date.now() + 2, Date.now() + 3]) // For forcing re-renders

const emit = defineEmits(['update', 'close', 'delete'])

const props = defineProps({
  productDetails: Object,
  isUpdating: {
    type: Boolean,
    default: false,
  },
})

const productDetailsCopy = ref({ ...props.productDetails }) // This will hold the product details passed from the parent component

onMounted(() => {
  // Set focus on the input field for the new category name
  nextTick(() => {
    if (categoryInput.value) {
      categoryInput.value.focus()
    }
  })
})

// Returns the correct image for each slot
const displayedImage = (idx) => {
  if (newImageUrls.value[idx]) return newImageUrls.value[idx]
  //return getProductImageUrl(productDetailsCopy.value, idx, { showPlaceholder: true })
  return productDetailsCopy.value.imageUrls?.[idx] || '/images/no-image.png'
}

// Triggers the create function in the parent component and then closes the modal
const confirm = () => {
  if (props.isUpdating) return // Prevent multiple submissions
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

function onImageChange(event, idx) {
  const file = event.target.files[0]
  if (file) {
    newImageFiles.value[idx] = file
    if (newImageUrls.value[idx]) {
      URL.revokeObjectURL(newImageUrls.value[idx])
    }
    newImageUrls.value[idx] = URL.createObjectURL(file)
    productDetailsCopy.value[`productImage${idx}`] = appendSuffix(
      `${productDetailsCopy.value.productID}/${file.name}`,
      `_${idx}`,
    )
    // Update image key to force re-render
    imageKeys.value[idx] = Date.now()
  }
}

// Helper function to append _0, _1, _2, _3 before file extension
function appendSuffix(filename, suffix) {
  if (!filename) return filename
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1) return filename + suffix
  return filename.slice(0, dotIndex) + suffix + filename.slice(dotIndex)
}

function onImgError(event) {
  event.target.src = '/images/no-image.png'
}

onBeforeUnmount(() => {
  newImageUrls.value.forEach((url) => {
    if (url) URL.revokeObjectURL(url)
  })
})
</script>
<template>
  <ModalWrapper @close="unMount" ref="modalWrapper">
    <!-- Loading overlay -->
    <div
      v-if="isUpdating"
      class="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-black/50"
    >
      <div class="rounded-lg bg-white p-6 text-center shadow-lg">
        <div
          class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
        ></div>
        <p class="text-sm font-semibold">Updating product...</p>
        <p class="text-xs text-gray-600">Please wait while we save your changes</p>
      </div>
    </div>

    <input
      type="text"
      class="w-full rounded-lg px-1 text-center font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
      v-model="productDetailsCopy.productName"
    />
    <input
      type="text"
      class="w-full rounded-lg px-1 text-center font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
      v-model="productDetailsCopy.productCode"
    />
    <EditProductImage
      :key="imageKeys[0]"
      :image-url="displayedImage(0)"
      :image-index="0"
      @change="onImageChange"
      @error="onImgError"
    ></EditProductImage>
    <div class="grid max-h-48 w-full grid-cols-3 grid-rows-1 gap-2 rounded-lg">
      <div class="flex h-44 max-h-44 w-full justify-center rounded-lg">
        <EditProductImage
          :key="imageKeys[1]"
          :image-url="displayedImage(1)"
          :image-index="1"
          @change="onImageChange"
          @error="onImgError"
        ></EditProductImage>
      </div>
      <div class="flex h-44 max-h-44 w-full justify-center rounded-lg">
        <EditProductImage
          :key="imageKeys[2]"
          :image-url="displayedImage(2)"
          :image-index="2"
          @change="onImageChange"
          @error="onImgError"
        ></EditProductImage>
      </div>
      <div class="flex h-44 max-h-44 w-full justify-center rounded-lg">
        <EditProductImage
          :key="imageKeys[3]"
          :image-url="displayedImage(3)"
          :image-index="3"
          @change="onImageChange"
          @error="onImgError"
        ></EditProductImage>
      </div>
    </div>

    <p class="w-full min-w-[350px] text-start text-sm font-semibold">Product Description:</p>
    <textarea
      v-model="productDetailsCopy.productDescription"
      class="max-h-72 w-full rounded-md bg-neutral-100 p-1 text-sm shadow-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
    ></textarea>
    <div class="grid w-full grid-cols-2 justify-start gap-2">
      <div class="">
        <p class="text-sm font-semibold">Hide Product?</p>
      </div>
      <div>
        <input type="checkbox" name="product-hidden" v-model="productDetailsCopy.productHidden" />
      </div>
      <div><p class="text-sm font-semibold">Price:</p></div>
      <div class="text-sm">
        <span>R&nbsp;</span>
        <input
          type="number"
          name="product-price"
          class="rounded-md bg-neutral-100 px-1 shadow-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
          v-model="productDetailsCopy.productPrice"
          arrows="false"
        />
      </div>
      <div>
        <p class="text-sm font-semibold">On Special?</p>
      </div>
      <div>
        <input
          type="checkbox"
          name="product-special"
          v-model="productDetailsCopy.productSpecial"
          :true-value="1"
          :false-value="0"
        />
      </div>
      <div><p class="text-sm font-semibold">Special Price:</p></div>
      <div>
        <p class="text-sm">
          {{ formatter.format(productDetailsCopy.productSpecialPrice) || 'N/A' }}
        </p>
      </div>
    </div>
    <select
      name="product-stock-status"
      class="rounded-md bg-neutral-100 px-1 py-0.5 text-sm shadow-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
      v-model="productDetailsCopy.productStockStatus"
    >
      <option value="In Stock" :selected="productDetailsCopy.productStockStatus === 'In Stock'">
        In Stock
      </option>
      <option
        value="Out of Stock"
        :selected="productDetailsCopy.productStockStatus === 'Out of Stock'"
      >
        Out of Stock
      </option>
    </select>

    <div class="mt-2 flex gap-2">
      <DeleteButton text="Delete Product" @delete="deleteProduct"></DeleteButton>
      <CancelButton @close="closeWrapper()" :disabled="isUpdating"></CancelButton>
      <ConfirmButton @confirm="confirm()" :disabled="isUpdating">
        <span v-if="isUpdating">Updating...</span>
        <span v-else>Update Product</span>
      </ConfirmButton>
    </div>
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
