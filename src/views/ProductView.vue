<script setup>
import { onMounted, ref } from 'vue'
import { axios_api } from '@/scripts/global.js'
import { useRoute } from 'vue-router'
import NotificationPopup from '@/components/NotificationPopup.vue'
import { formatter, saveCart } from '@/scripts/global.js'
import { useProductImages } from '@/composables/useProductImages'

const product = ref({})
const route = useRoute()
const addedToCart = ref(0)

// Get image URLs and handle image errors using the composable
const { primaryImage, secondaryImage, tertiaryImage, quaternaryImage, handleImageError } =
  useProductImages(product)

// Debug the primary image
console.log('Primary image URL:', primaryImage.value)
console.log('Product data:', product.value)

onMounted(() => {
  getProductByID()

  //Create a cart in localStorage if it doesn't already exist
  createCart()

  //Scroll to the top of the page when displaying a product
  scrollToTop()
})

//scrolls the page to the top
function scrollToTop() {
  window.scrollTo(0, 0)
}

//Create a cart item in localStorage to store productID's
function createCart() {
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', '[]')
  }
}

//Get the product by the supplied productID
async function getProductByID() {
  try {
    const response = await axios_api.get('/products/' + route.params.productID)
    product.value = response.data
    console.log('Product loaded:', product.value)
    console.log('Product imageUrls:', product.value.imageUrls)
  } catch (err) {
    console.log(err)
  }
}

//Adds the product to the cart in localStorage
function addToCart() {
  let cart = JSON.parse(localStorage.getItem('cart'))

  //Only add the item to the cart if it does not already exist in the cart
  if (cart.length == 0 || !cart.find((item) => item.productID == product.value.productID)) {
    cart.push({ productID: product.value.productID, quantity: 1 })

    //show cart success message
    showCartPopup(1)
  } else {
    //show cart warning message
    showCartPopup(2)
  }

  saveCart(cart)
}

//show cart popup notification
function showCartPopup(value) {
  addedToCart.value = value
  setTimeout(() => (addedToCart.value = 0), 3000)
}
</script>
<template>
  <div>
    <h1 class="pt-3 pb-0 pl-6 text-lg font-semibold">{{ product.productName }}</h1>
    <div
      class="justify-left flex flex-wrap gap-4 p-6"
      v-viewer.static="{
        scalable: false,
        rotatable: false,
        fullscreen: false,
        navbar: false,
        transition: true,
      }"
    >
      <div
        class="mb-4 grid h-[350px] max-w-28 grid-cols-1 grid-rows-3 rounded-lg"
        v-if="secondaryImage || tertiaryImage || quaternaryImage"
      >
        <div
          class="mb-1 flex justify-center rounded-lg border border-blue-300 p-2"
          v-if="secondaryImage"
        >
          <img
            :src="secondaryImage"
            @error="handleImageError"
            class="max-h-full max-w-full cursor-pointer self-center"
            alt="Product Image"
          />
        </div>
        <div
          class="mt-1 mb-1 flex justify-center rounded-lg border border-blue-300 p-2"
          v-if="tertiaryImage"
        >
          <img
            :src="tertiaryImage"
            @error="handleImageError"
            class="max-h-full max-w-full cursor-pointer self-center"
            alt="Product Image"
          />
        </div>
        <div
          class="mt-1 flex justify-center rounded-lg border border-blue-300 p-2"
          v-if="quaternaryImage"
        >
          <img
            :src="quaternaryImage"
            @error="handleImageError"
            class="max-h-full max-w-full cursor-pointer self-center"
            alt="Product Image"
          />
        </div>
      </div>
      <div
        class="mb-4 flex h-[350px] max-w-64 justify-center rounded-lg border border-blue-300 bg-white/30 p-4 shadow-md shadow-blue-500/50 transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-400"
      >
        <div
          v-if="product.productSpecial > 0"
          class="absolute mt-2 flex items-center rounded-2xl bg-red-500/55 px-3 py-1 text-white backdrop-blur"
        >
          <span class="text-sm">On Sale:</span>
          &nbsp;
          <span class="text-sm font-semibold">
            {{ formatter.format(product.productSpecialPrice) }}
          </span>
        </div>
        <img
          v-if="product.productID"
          :src="primaryImage"
          @error="handleImageError"
          class="max-h-full max-w-full cursor-pointer self-center shadow-md shadow-black/20"
          alt="Product Image"
          :key="product.productID"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
          Loading...
        </div>
      </div>
      <div class="ml-4">
        <div class="h-7">
          <span
            class="text-xl font-semibold"
            :class="product.productSpecial > 0 ? 'line-through' : ''"
          >
            {{ formatter.format(product.productPrice) }}
          </span>
        </div>
        <button
          class="mt-3 cursor-pointer rounded border border-green-500 bg-green-400 p-2 text-sm font-semibold shadow-lg disabled:cursor-not-allowed disabled:bg-neutral-400"
          @click="addToCart"
          :disabled="
            product.productStockStatus === 'Out of Stock' ||
            product.productStockStatus === 'Pre-Order'
          "
        >
          Add to Cart
        </button>
        <div class="mt-4">
          <p class="text-sm font-semibold">Stock Status:</p>
          <p class="text-sm">{{ product.productStockStatus }}</p>
        </div>
        <div class="mt-4 max-w-60">
          <p class="text-sm font-semibold">Product Information</p>
          <p class="pt-3 text-sm whitespace-pre-line" v-html="product.productDescription"></p>
        </div>
      </div>
    </div>
  </div>
  <Transition name="notification">
    <NotificationPopup
      message="Item Added to Cart"
      type="success"
      v-if="addedToCart == 1"
    ></NotificationPopup>
  </Transition>
  <Transition name="notification">
    <NotificationPopup
      message="Item Already In Cart"
      type="warning"
      v-if="addedToCart == 2"
    ></NotificationPopup>
  </Transition>
</template>

<style>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease-in-out;
}

.notification-enter-from,
.notification-leave-to {
  transform: translateX(150px);
  opacity: 0;
}
</style>
