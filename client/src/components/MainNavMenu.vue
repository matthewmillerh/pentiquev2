<script setup>
import { onMounted, ref } from 'vue'
import MenuIcon from 'vue-material-design-icons/Menu.vue'
import Close from 'vue-material-design-icons/Close.vue'

const cartItemCount = ref(0)
const showMobileMenu = ref(false)

const emit = defineEmits(['toggle-mobile-menu'])

onMounted(() => {
  setCartItemCount()
})

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
  emit('toggle-mobile-menu')
}
</script>
<template>
  <div class="bg-opacity-50 fixed top-0 right-0 left-0 h-28 bg-white backdrop-blur">
    <div
      class="bg-opacity-60 fixed top-5 right-6 left-6 z-40 flex flex-wrap items-center justify-center rounded-lg border border-blue-300 bg-blue-200 p-3 shadow shadow-blue-100"
    >
      <!-- Company logo -->
      <img alt="Pentique logo" src="/images/logo.png" width="100" />

      <!-- Main menu items -->
      <nav class="hidden p-2 sm:block">
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/">Home</RouterLink>
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/about">
          About
        </RouterLink>
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/contact">
          Contact
        </RouterLink>
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/shipping">
          Shipping
        </RouterLink>
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/shopping-cart">
          Cart (
          <span class="text-sm font-semibold">{{ cartItemCount }}</span>
          )
        </RouterLink>
      </nav>
    </div>

    <!-- Mobile menu icons -->
    <Transition name="mobileMenuButton">
      <button
        v-if="!showMobileMenu"
        @click="toggleMobileMenu()"
        class="absolute top-11 right-12 z-50 block cursor-pointer sm:hidden"
      >
        <menu-icon />
      </button>
    </Transition>
    <Transition name="mobileMenuButton">
      <button
        v-if="showMobileMenu"
        @click="toggleMobileMenu()"
        class="absolute top-11 right-12 z-50 block cursor-pointer sm:hidden"
      >
        <close />
      </button>
    </Transition>
  </div>
</template>
<style scoped>
.mobileMenuButton-enter-active,
.mobileMenuButton-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.mobileMenuButton-enter-from,
.mobileMenuButton-leave-to {
  opacity: 0;
}
</style>
