<script setup>
import { formatter } from '@/scripts/global.js'
import { onMounted, ref, toRefs, computed, onUpdated } from 'vue'
import { useProductImages } from '@/composables/useProductImages'
import { isCarProduct } from '@/utils/carProducts'

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

// cars get a little showroom around their picture
const isCar = computed(() => isCarProduct(product.value))

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
    <RouterLink :to="'/product/' + product.productID + '/' + (product.categoryID ?? '')">
      <!-- a car: its picture stands in a small night showroom, on a glossy floor that streams by -->
      <div
        v-if="isCar"
        class="car-stage relative inline-flex h-[13.5rem] w-48 max-w-52 justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#16204a] via-[#0b1230] to-[#060a15] px-4 pt-4 pb-10 shadow-md shadow-blue-950/30"
      >
        <div class="car-spotlight pointer-events-none absolute inset-0"></div>
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 [perspective:110px]">
          <div class="car-floor absolute -inset-x-1/2 bottom-0 h-[160%] origin-bottom"></div>
        </div>
        <img
          :src="primaryImage"
          @error="handleImageError"
          class="car-picture relative max-h-full max-w-full self-center"
          :alt="product.productName"
        />
        <div class="car-sheen pointer-events-none absolute inset-0"></div>
      </div>
      <div
        v-else
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
    <div class="ml-4 flex w-96 max-w-[calc(100vw-16rem)] flex-col items-start">
      <RouterLink
        :to="'/product/' + product.productID + '/' + (product.categoryID ?? '')"
        class="mb-2 leading-snug font-semibold text-gray-900 transition-colors hover:text-blue-700"
      >
        {{ product.productName }}
      </RouterLink>
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
            class="w-12 rounded bg-white/50 px-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
        class="mt-3 cursor-pointer rounded border border-green-400 bg-green-300 px-2 py-1 text-sm font-semibold shadow-md"
        v-if="product.quantity != quantityCurrentValue"
        @mousedown="updateButtonClicked = true"
        @mouseup="updateButtonClicked = false"
      >
        Update
      </button>
      <button
        class="mt-4 cursor-pointer rounded border border-red-400 bg-red-300 px-2 py-1 text-sm font-semibold shadow-md"
        @click="$emit('remove-from-cart', index)"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<style scoped>
/* the night showroom around a car's picture */
.car-spotlight {
  background: radial-gradient(60% 45% at 50% 0%, rgb(255 236 200 / 0.28), transparent 70%);
}
.car-floor {
  transform: rotateX(62deg);
  background-image:
    linear-gradient(to top, rgb(6 10 21 / 0) 0%, rgb(6 10 21 / 0.95) 100%),
    repeating-linear-gradient(90deg, rgb(121 168 255 / 0.35) 0 1px, transparent 1px 18px),
    repeating-linear-gradient(0deg, rgb(255 126 184 / 0.35) 0 1px, transparent 1px 18px);
  animation: car-floor-stream 1.6s linear infinite;
}
@keyframes car-floor-stream {
  to {
    background-position:
      0 0,
      0 0,
      0 18px;
  }
}
.car-picture {
  filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.55));
  -webkit-box-reflect: below 2px linear-gradient(transparent 62%, rgb(255 255 255 / 0.22));
}
/* a slow sweep of light across the glass every few seconds */
.car-sheen {
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgb(255 255 255 / 0.16) 50%,
    transparent 65%
  );
  background-size: 250% 100%;
  animation: car-sheen 5s ease-in-out infinite;
}
@keyframes car-sheen {
  0%,
  55% {
    background-position: 130% 0;
  }
  100% {
    background-position: -30% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .car-floor,
  .car-sheen {
    animation: none;
  }
}
</style>
