<script setup>
import { onMounted, ref } from 'vue'
import { axios_api } from '@/scripts/global.js'
import { useRoute } from 'vue-router'
import NotificationPopup from '@/components/NotificationPopup.vue'
import { formatter, saveCart } from '@/scripts/global.js'
import { getProductImageUrl } from '@/utils/imageUtils'

const product = ref({})
const route = useRoute()
const addedToCart = ref(0)

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
        v-if="product.productFile2Name || product.productFile3Name || product.productFile4Name"
      >
        <div
          class="mb-1 flex justify-center rounded-lg border border-blue-300 p-2"
          v-if="product.productFile2Name"
        >
          <img
            :src="getProductImageUrl(product, 1, { showPlaceholder: false })"
            @error="$event.target.src = '/images/no-image.png'"
            class="max-h-full max-w-full cursor-pointer self-center"
            alt="Product Image"
          />
        </div>
        <div
          class="mt-1 mb-1 flex justify-center rounded-lg border border-blue-300 p-2"
          v-if="product.productFile3Name"
        >
          <img
            :src="getProductImageUrl(product, 2, { showPlaceholder: false })"
            @error="$event.target.src = '/images/no-image.png'"
            class="max-h-full max-w-full cursor-pointer self-center"
            alt="Product Image"
          />
        </div>
        <div
          class="mt-1 flex justify-center rounded-lg border border-blue-300 p-2"
          v-if="product.productFile4Name"
        >
          <img
            :src="getProductImageUrl(product, 3, { showPlaceholder: false })"
            @error="$event.target.src = '/images/no-image.png'"
            class="max-h-full max-w-full cursor-pointer self-center"
            alt="Product Image"
          />
        </div>
      </div>
      <div
        class="mb-4 flex h-[350px] max-w-64 justify-center rounded-lg border border-blue-300 p-4"
      >
        <div
          v-if="product.productSpecialPrice > 0"
          class="bg-opacity-55 absolute mt-2 flex items-center rounded-2xl bg-red-500 px-3 py-1 text-white backdrop-blur"
        >
          <span class="text-sm">On Sale:</span>
          &nbsp;
          <span class="text-sm font-semibold">
            {{ formatter.format(product.productSpecialPrice) }}
          </span>
        </div>
        <img
          :src="getProductImageUrl(product, 0, { showPlaceholder: true })"
          @error="$event.target.src = '/images/no-image.png'"
          class="max-h-full max-w-full cursor-pointer self-center"
          alt="Product Image"
        />
      </div>
      <div class="ml-4">
        <div class="h-7">
          <span
            class="text-xl font-semibold"
            :class="product.productSpecialPrice > 0 ? 'line-through' : ''"
          >
            {{ formatter.format(product.productPrice) }}
          </span>
        </div>
        <button
          class="mt-3 rounded border border-green-500 bg-green-400 p-2 text-sm font-semibold shadow-lg"
          @click="addToCart"
        >
          Add to Cart
        </button>
        <div class="mt-4 max-w-60">
          <p class="text-sm font-semibold">Product Information</p>
          <p v-html="product.productDescription" class="pt-3 text-sm"></p>
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
