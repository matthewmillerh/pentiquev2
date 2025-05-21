<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { axios_api } from './scripts/global'
import MenuIcon from 'vue-material-design-icons/Menu.vue'
import Close from 'vue-material-design-icons/Close.vue'
import ProductSideMenu from './components/ProductSideMenu.vue'

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
  <Transition name="mobile-nav-menu">
    <div
      class="mobile-nav bg-opacity-50 fixed top-28 right-0 bottom-0 left-0 z-50 overflow-y-auto overscroll-y-none bg-white backdrop-blur sm:hidden"
      v-if="showMobileMenu"
    >
      <ul class="mb-8 w-full text-center">
        <li class="py-2 font-semibold">
          <RouterLink
            @click="toggleMobileMenu"
            class="main-nav-link rounded-lg transition-all"
            to="/"
            >Home</RouterLink
          >
        </li>
        <li class="py-2 font-semibold">
          <RouterLink
            @click="toggleMobileMenu"
            class="main-nav-link rounded-lg transition-all"
            to="/about"
            >About</RouterLink
          >
        </li>
        <li class="py-2 font-semibold">
          <RouterLink
            @click="toggleMobileMenu"
            class="main-nav-link rounded-lg transition-all"
            to="/contact"
            >Contact</RouterLink
          >
        </li>
        <li class="py-2 font-semibold">
          <RouterLink
            @click="toggleMobileMenu"
            class="main-nav-link rounded-lg transition-all"
            to="/shipping"
            >Shipping</RouterLink
          >
        </li>
        <li class="py-2 font-semibold">
          <RouterLink
            @click="toggleMobileMenu"
            class="main-nav-link rounded-lg transition-all"
            to="/shopping-cart"
            >Cart (<span class="text-sm font-semibold">{{ cartItemCount }}</span
            >)</RouterLink
          >
        </li>
        <li class="mt-2 mb-2 text-2xl">Products</li>
        <li v-for="(category1, index) in lvl1Categories" :key="index" class="rounded-lg">
          <RouterLink
            :to="'/products/' + category1.category1Name + '/' + category1.category1ID"
            class="block h-full w-full rounded-lg px-3 py-2 font-semibold transition-all"
            @click="toggleMobileMenu"
            >{{ category1.category1Name }}</RouterLink
          >

          <!-- Div wrapper for grid transition-->
          <Transition>
            <div class="grid grid-rows-[1fr]" v-if="true">
              <div class="overflow-hidden">
                <!-- Nav list for level 2 categories -->
                <ul v-if="hasCategory2(category1.category1ID)">
                  <li v-for="(category2, index) in lvl2ByID(category1.category1ID)" :key="index">
                    <RouterLink
                      :to="'/products/' + category2.category2Name + '/' + category1.category1ID"
                      class="block rounded-lg py-1 pr-2 pl-4 transition-all"
                      @click="toggleMobileMenu"
                      >{{ category2.category2Name }}</RouterLink
                    >

                    <!-- Nav list for level 3 categories -->
                    <ul v-if="hasCategory3(category2.category2ID)">
                      <li
                        v-for="(category3, index) in lvl3ByID(category2.category2ID)"
                        :key="index"
                      >
                        <RouterLink
                          :to="'/products/' + category3.category3Name + '/' + category1.category1ID"
                          class="block rounded-lg py-1 pr-2 pl-8 font-thin transition-all"
                          @click="toggleMobileMenu"
                          >{{ category3.category3Name }}</RouterLink
                        >
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </Transition>
        </li>
      </ul>
    </div>
  </Transition>

  <header>
    <div class="bg-opacity-50 fixed top-0 right-0 left-0 h-28 bg-white backdrop-blur">
      <div
        class="bg-opacity-60 fixed top-5 right-6 left-6 z-40 flex flex-wrap items-center justify-center rounded-lg border border-blue-300 bg-blue-200 p-3 shadow shadow-blue-100"
      >
        <img alt="Pentique logo" src="/images/logo.png" width="100" />
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
          class="absolute top-11 right-12 z-50 block sm:hidden"
        >
          <menu-icon /></button
      ></Transition>
      <Transition name="mobileMenuButton"
        ><button
          v-if="showMobileMenu"
          @click="toggleMobileMenu"
          class="absolute top-11 right-12 z-50 block sm:hidden"
        >
          <close /></button
      ></Transition>
    </div>
  </header>

  <div class="mt-28">
    <div
      class="fixed hidden max-h-[80%] w-[17%] max-w-[17%] overflow-x-hidden overflow-y-auto rounded-lg border border-blue-300 bg-blue-200 shadow sm:block"
    >
      <ProductSideMenu></ProductSideMenu>
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

/* Router Trainsitions */
.v-enter-active,
.v-leave-active {
  transition: grid-template-rows 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  grid-template-rows: 0fr;
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

.mobile-nav::-webkit-scrollbar {
  width: 0px;
}
</style>
