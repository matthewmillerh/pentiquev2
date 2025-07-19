<script setup>
import { onMounted, ref, watch } from 'vue'
import MenuIcon from 'vue-material-design-icons/Menu.vue'
import Close from 'vue-material-design-icons/Close.vue'
import MainNavItem from './shared/buttons/MainNavItem.vue'
import { useRoute } from 'vue-router'

const cartItemCount = ref(0)

const emit = defineEmits(['toggle-mobile-menu'])

const props = defineProps({
  showMobileMenu: {
    type: Boolean,
    default: false,
  },
})

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
  emit('toggle-mobile-menu')
}

// watch route change to close the mobile menu
const route = useRoute()
watch(
  () => route.path,
  () => {
    // Close mobile menu on route change
    if (props.showMobileMenu) {
      emit('toggle-mobile-menu')
    }
  },
)

// Close mobile menu when any navigation occurs
function closeMenuOnNav() {
  if (props.showMobileMenu) {
    emit('toggle-mobile-menu')
  }
}
</script>
<template>
  <div
    class="fixed top-0 right-0 left-0 hidden h-32 bg-white/30 backdrop-blur-md lg:block"
    style="z-index: 40"
  ></div>
  <div>
    <div
      class="fixed top-0 right-0 left-0 z-50 flex flex-wrap items-center justify-center gap-x-4 border border-blue-400 bg-blue-200/60 p-3 shadow-md shadow-black/10 lg:top-5 lg:right-6 lg:left-6 lg:rounded-lg"
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
        <MainNavItem :icon="['fas', 'house']" label="Home" link="/" @click="closeMenuOnNav" />

        <MainNavItem
          :icon="['fas', 'circle-info']"
          label="About"
          link="/about"
          @click="closeMenuOnNav"
        />

        <MainNavItem
          :icon="['fas', 'address-book']"
          label="Contact"
          link="/contact"
          @click="closeMenuOnNav"
        />

        <MainNavItem
          :icon="['fas', 'truck-fast']"
          label="Shipping"
          link="/shipping"
          @click="closeMenuOnNav"
        />
        <MainNavItem
          :icon="['fas', 'cart-shopping']"
          label="Cart"
          link="/shopping-cart"
          :cart-count="cartItemCount"
          @click="closeMenuOnNav"
        />
      </nav>
      <!-- Mobile menu icons -->
      <div class="absolute top-6 right-12 z-50 block lg:hidden">
        <Transition name="mobileMenuButton" mode="out-in">
          <button
            v-if="!props.showMobileMenu"
            @click="toggleMobileMenu()"
            class="cursor-pointer"
            :key="`menu-${props.showMobileMenu}`"
          >
            <menu-icon />
          </button>
          <button
            v-else
            @click="toggleMobileMenu()"
            class="cursor-pointer"
            :key="`close-${props.showMobileMenu}`"
          >
            <close />
          </button>
        </Transition>
      </div>
    </div>
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
