<script setup>
import { onBeforeMount, ref, computed, defineAsyncComponent } from 'vue'
import ProductCardCart from '@/components/ProductCardCart.vue'
import { isCarProduct } from '@/utils/carProducts'
// three.js and the car model are only downloaded when there is a car in the cart
const CarArrival = defineAsyncComponent(() => import('@/components/cart/CarArrival.vue'))
const CarFlyby = defineAsyncComponent(() => import('@/components/cart/CarFlyby.vue'))
import CarModelCredit from '@/components/cart/CarModelCredit.vue'

// The night-time fly-by banner above the cart (components/cart/CarFlyby.vue). Switched off for now in favour of the
// car arriving on the page; set to true to bring it back.
const SHOW_FLYBY = false
import { saveCart, formatter, getCart } from '@/scripts/global'
import { axios_api } from '@/scripts/global'

const shoppingCart = ref([])
const products = ref([])
const checkoutDisabled = ref(false)

onBeforeMount(() => {
  shoppingCart.value = getCart()
  getProducts()
})

//Get product information for each productID in the shopping cart
function getProducts() {
  shoppingCart.value.forEach((element) => {
    getProductByID(element.productID, element.quantity)
  })
}

//Get the product from the database by the supplied productID
async function getProductByID(id, qty) {
  let productInfo = {}

  try {
    const response = await axios_api.get('/products/' + id)

    //add the quantity of the product in the cart to the product array
    productInfo = response.data
    productInfo['quantity'] = qty
    products.value.push(productInfo)
    //console.log(products.value)
  } catch (err) {
    console.log(err)
  }
}

// a car in the cart brings on the fly-by banner
const hasCar = computed(() => products.value.some(isCarProduct))

// a car in the cart drives onto the page once (not for people who asked for less motion)
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
const heading = ref(null)
const arrived = ref(false)
const carPlacement = ref('beside') // where the car stops: 'beside' the title, or 'below' it on narrow screens
const showArrival = computed(() => hasCar.value && !reducedMotion && !SHOW_FLYBY)

//Sets the total value of the shopping cart
const cartTotalValue = computed(() => {
  let cartTotal = 0
  products.value.forEach((element) => {
    cartTotal +=
      (element.productSpecialPrice > 0 ? element.productSpecialPrice : element.productPrice) *
      element.quantity
  })
  return cartTotal
})

//update the quantity of an item in the cart
function updateQuantity(quantity, index) {
  if (quantity <= 0 || quantity === '') {
    console.log(quantity)
    //remove the item from the products array
    products.value.splice(index, 1)
  } else {
    //edit the quantity in the array
    products.value[index]['quantity'] = quantity
  }

  //Save the updated cart array to localStorage
  saveCart(products.value)

  checkoutDisabled.value = false
}

//remove an item from the cart
function removeFromCart(index) {
  products.value.splice(index, 1)

  //Save the updated cart array to localStorage
  saveCart(products.value)
}

//empty the entire cart
function emptyCart() {
  shoppingCart.value.length = 0
  products.value.length = 0

  //Save the updated cart array to localStorage
  saveCart(shoppingCart.value)
}

function setCheckoutButton(value) {
  checkoutDisabled.value = value
}
</script>
<template>
  <div class="relative">
    <!-- on narrow screens there is no room for the car beside the title, so it stops underneath it -->
    <h1
      ref="heading"
      class="px-3 pt-12 text-center text-xl font-semibold transition-[padding] duration-700 ease-out sm:text-2xl"
      :class="showArrival && !arrived && carPlacement === 'below' ? 'pb-28' : 'pb-10'"
    >
      Your Shopping Cart
    </h1>
    <CarArrival
      v-if="showArrival && !arrived"
      :heading="heading"
      @placement="carPlacement = $event"
      @done="arrived = true"
    />
  </div>
  <div class="px-4">
    <CarFlyby v-if="SHOW_FLYBY && hasCar" />
    <div v-for="(product, index) in products" :key="product.productID">
      <ProductCardCart
        :product="product"
        :index="index"
        @update-quantity="updateQuantity"
        @remove-from-cart="removeFromCart"
        @checkout-disabled="setCheckoutButton"
      ></ProductCardCart>
    </div>

    <!-- Cart control buttons (only show if cart has items) -->
    <div class="mb-4" v-if="products.length">
      <!-- Cart total value -->
      <div class="mb-3">
        <p>
          Shopping Cart Total:
          <span class="font-semibold">{{ formatter.format(cartTotalValue) }}</span>
        </p>
        <!-- the 3D car's licence asks for a credit -->
        <p v-if="showArrival" class="flex items-center gap-1 text-xs text-gray-400">
          3D car credit
          <CarModelCredit />
        </p>
      </div>
      <button
        class="mr-3 cursor-pointer rounded border border-red-400 bg-red-300 px-2 py-1 text-sm font-semibold shadow-md"
        @click="emptyCart"
      >
        Empty Cart
      </button>
      <RouterLink to="/checkout" v-slot="{ navigate }">
        <button
          @click="navigate"
          class="mr-3 cursor-pointer rounded border border-green-400 bg-green-300 px-2 py-1 text-sm font-semibold shadow-md disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-300"
          :disabled="checkoutDisabled"
        >
          Continue to Checkout
        </button>
      </RouterLink>
    </div>
  </div>
</template>
<style></style>
