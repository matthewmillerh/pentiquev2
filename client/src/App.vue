<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { axios_api } from './scripts/global'
import MenuIcon from 'vue-material-design-icons/Menu.vue'
import Close from 'vue-material-design-icons/Close.vue'
import ProductMenuMain from '@/components/ProductMenuMain.vue'
import ProductMenuMobile from '@/components/ProductMenuMobile.vue'

const allCategories = ref([])
const cartItemCount = ref(0)
const showMobileMenu = ref(false)

onMounted(() => {
  getAllCategories()

  setCartItemCount()
})

//get all the categories and subcategories
async function getAllCategories() {
  try {
    const response = await axios_api.get('/get-all-categories')
    allCategories.value = response.data
  } catch (err) {
    console.log(err)
  }
}

//Set the value of cartItemCount to show and update the amount of items currently in the cart
function setCartItemCount() {
  //create a cart entry in localStorage if it does not exist
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', '[]')
  }

  cartItemCount.value = JSON.parse(localStorage.getItem('cart')).length

  //Create an event listener to update cartItemCount when an item is added to the cart in localStorage
  window.addEventListener('item-added-to-cart', (event) => {
    cartItemCount.value = event.detail.storage.length
  })
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}
</script>

<template>
  <!-- Mobile nav menu -->
  <div class="sm:hidden">
    <Transition name="mobile-nav-menu">
      <ProductMenuMobile
        v-if="showMobileMenu"
        :cart-item-count="cartItemCount"
        @close-mobile-menu="showMobileMenu = false"
      ></ProductMenuMobile>
    </Transition>
  </div>

  <header>
    <div class="bg-opacity-50 fixed top-0 right-0 left-0 h-28 bg-white backdrop-blur">
      <div
        class="bg-opacity-60 fixed top-5 right-6 left-6 z-40 flex flex-wrap items-center justify-center rounded-lg border border-blue-300 bg-blue-200 p-3 shadow shadow-blue-100"
      >
        <!-- Company logo -->
        <img alt="Pentique logo" src="/images/logo.png" width="100" />

        <!-- Main menu navigation -->
        <nav class="hidden p-2 sm:block">
          <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/">Home</RouterLink>
          <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/about"
            >About</RouterLink
          >
          <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/contact"
            >Contact</RouterLink
          >
          <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/shipping"
            >Shipping</RouterLink
          >
          <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/shopping-cart"
            >Cart (<span class="text-sm font-semibold">{{ cartItemCount }}</span
            >)</RouterLink
          >
        </nav>
      </div>
      <Transition name="mobileMenuButton"
        ><button
          v-if="!showMobileMenu"
          @click="toggleMobileMenu"
          class="absolute top-11 right-12 z-50 block cursor-pointer sm:hidden"
        >
          <menu-icon /></button
      ></Transition>
      <Transition name="mobileMenuButton"
        ><button
          v-if="showMobileMenu"
          @click="toggleMobileMenu"
          class="absolute top-11 right-12 z-50 block cursor-pointer sm:hidden"
        >
          <close /></button
      ></Transition>
    </div>
  </header>

  <div class="mt-28">
    <div
      class="fixed hidden max-h-[80%] w-[17%] max-w-[17%] overflow-x-hidden overflow-y-auto rounded-lg border border-blue-300 bg-blue-200 shadow sm:block"
    >
      <!-- Product side menu -->
      <ProductMenuMain></ProductMenuMain>
    </div>

    <div
      class="float-right mb-4 w-full rounded-lg border border-blue-300 bg-blue-100 shadow sm:w-[80%] sm:max-w-[80%]"
    >
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<style scoped>
@media screen and (min-width: 640px) {
  .router-link-active {
    color: black;
    font-weight: 600;
  }
}

.category-item:hover {
  background-color: rgba(138, 172, 233, 0.659);
  cursor: pointer;
}

.mobileMenuButton-enter-active,
.mobileMenuButton-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.mobileMenuButton-enter-from,
.mobileMenuButton-leave-to {
  opacity: 0;
}

/* Scrollbar width */
::-webkit-scrollbar {
  width: 8px;
}

/* Scrollbar Track */
::-webkit-scrollbar-track {
  background: rgb(179, 179, 243);
  border-radius: 8px;
}

/* Scrollbar Handle */
::-webkit-scrollbar-thumb {
  background: rgb(157, 157, 235);
  border-radius: 5px;
}

/* Scrollbar Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgb(130, 130, 249);
}

.mobile-nav-menu-enter-active,
.mobile-nav-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-nav-menu-enter-from,
.mobile-nav-menu-leave-to {
  transform: translateY(-500px);
  opacity: 0;
}
</style>
