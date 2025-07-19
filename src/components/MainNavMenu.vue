<script setup>
import { onMounted, ref } from 'vue'
import MenuIcon from 'vue-material-design-icons/Menu.vue'
import Close from 'vue-material-design-icons/Close.vue'
import MainNavItem from './shared/buttons/MainNavItem.vue'

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
  <div class="fixed top-0 right-0 left-0 h-32 bg-white/30 backdrop-blur-md" style="z-index: 50">
    <div
      class="fixed top-5 right-6 left-6 z-40 flex flex-wrap items-center justify-center gap-x-4 rounded-lg border border-blue-400 bg-blue-200/60 p-3 shadow-md shadow-black/10"
    >
      <!-- Company logo -->
      <img
        alt="Pentique logo"
        src="/images/logo.png"
        width="100"
        class="drop-shadow-md drop-shadow-blue-400"
      />

      <!-- Main menu items -->
      <nav class="hidden gap-2 p-2 lg:flex">
        <MainNavItem :icon="['fas', 'house']" label="Home" link="/" />

        <MainNavItem :icon="['fas', 'circle-info']" label="About" link="/about" />

        <MainNavItem :icon="['fas', 'address-book']" label="Contact" link="/contact" />

        <MainNavItem :icon="['fas', 'truck-fast']" label="Shipping" link="/shipping" />
        <MainNavItem
          :icon="['fas', 'cart-shopping']"
          label="Cart"
          link="/shopping-cart"
          :cart-count="cartItemCount"
        />
      </nav>
    </div>

    <!-- Mobile menu icons -->
    <Transition name="mobileMenuButton">
      <button
        v-if="!showMobileMenu"
        @click="toggleMobileMenu()"
        class="absolute top-11 right-12 z-50 block cursor-pointer lg:hidden"
      >
        <menu-icon />
      </button>
    </Transition>
    <Transition name="mobileMenuButton">
      <button
        v-if="showMobileMenu"
        @click="toggleMobileMenu()"
        class="absolute top-11 right-12 z-50 block cursor-pointer lg:hidden"
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
