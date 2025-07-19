<script setup>
import { formatter } from '@/scripts/global.js'
import { onMounted, ref, toRefs, computed, onUpdated } from 'vue'
import { useProductImages } from '@/composables/useProductImages'

const props = defineProps([
  'product', // Now accepting the entire product object
  'index',
])

const quantityCurrentValue = ref(0)
const { product, index } = toRefs(props)
const updateButtonClicked = ref(false)
const emit = defineEmits(['update-quantity', 'remove-from-cart', 'checkout-disabled'])
const valid = ref(true)

// Use the composable to get the primary image
const { primaryImage, handleImageError } = useProductImages(product)

// Computed properties for easier access to product properties
const productPrice = computed(() =>
  product.value.productSpecialPrice > 0
    ? product.value.productSpecialPrice
    : product.value.productPrice,
)

const checkoutDisabled = computed(() => {
  return quantityCurrentValue.value !== product.value.quantity
})

onMounted(() => {
  //set the initial quantity for the product from the value in the cart
  quantityCurrentValue.value = product.value.quantity
})

onUpdated(() => {
  // emit('checkout-disabled', checkoutDisabled.value)
})

//reset the quantity input box when focus is changed
function resetQuantityBox() {
  if (!updateButtonClicked.value) {
    quantityCurrentValue.value = product.value.quantity
    valid.value = true
    emit('checkout-disabled', checkoutDisabled.value)
  }
}

//validate the input in the quantity field - emit event to update cart if valid
function validateQuantity() {
  if (!/\D/.test(quantityCurrentValue.value)) {
    valid.value = true
    emit('update-quantity', quantityCurrentValue.value, index.value)
  } else {
    valid.value = false
  }
}
</script>

<template>
  <div class="mb-4 inline-flex">
    <RouterLink :to="'/product/' + product.productID + '/' + product.category1ID">
      <div
        class="inline-flex w-48 max-w-52 flex-col items-center rounded-lg border border-blue-300 bg-blue-200 p-2 shadow"
      >
        <div class="inline-flex h-48 max-h-60 w-32 max-w-40 justify-center rounded bg-blue-100 p-2">
          <img
            :src="primaryImage"
            @error="handleImageError"
            class="max-h-full max-w-full self-center"
            :alt="product.productName"
          />
        </div>
      </div>
    </RouterLink>
    <div class="ml-4 flex w-96 flex-col items-start">
      <div class="w-full">
        <span class="text-sm">Price:</span>
        <span class="text-sm font-semibold">
          {{ formatter.format(productPrice) }}
        </span>
      </div>
      <div class="mt-2">
        <span class="text-sm">
          Quantity:
          <input
            type="text"
            class="w-12 rounded px-1"
            v-model="quantityCurrentValue"
            @focusout="resetQuantityBox()"
            @input="$emit('checkout-disabled', checkoutDisabled)"
          />
        </span>
      </div>
      <div class="mt-2">
        <span class="text-sm">Subtotal:</span>
        <span class="text-sm font-semibold">
          {{ formatter.format(productPrice * product.quantity) }}
        </span>
      </div>
      <p
        class="mt-2 rounded-3xl border border-red-400 bg-red-300 px-2 text-sm shadow-lg"
        v-show="!valid && product.quantity != quantityCurrentValue"
      >
        Please enter a number
      </p>
      <button
        @click="validateQuantity"
        class="mt-3 rounded border border-green-400 bg-green-300 px-2 py-1 text-sm font-semibold shadow-md"
        v-if="product.quantity != quantityCurrentValue"
        @mousedown="updateButtonClicked = true"
        @mouseup="updateButtonClicked = false"
      >
        Update
      </button>
      <button
        class="mt-4 rounded border border-red-400 bg-red-300 px-2 py-1 text-sm font-semibold shadow-md"
        @click="$emit('remove-from-cart', index)"
      >
        Remove
      </button>
    </div>
  </div>
</template>
