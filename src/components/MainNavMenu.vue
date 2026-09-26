<script setup>
import { onMounted, ref, watch } from 'vue'
import { carShow } from '@/composables/useCarShow'
import MenuIcon from 'vue-material-design-icons/Menu.vue'
import Close from 'vue-material-design-icons/Close.vue'
import MainNavItem from './shared/buttons/MainNavItem.vue'
import StoreSearchBox from './StoreSearchBox.vue'
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
  <!-- On big screens the header floats: content scrolling up behind it softly blurs and fades, with no hard edge -->
  <div
    class="header-veil pointer-events-none fixed inset-x-0 top-0 hidden h-36 lg:block"
    style="z-index: 40"
  ></div>
  <div>
    <div
      class="fixed top-0 right-0 left-0 z-50 border-b border-blue-200/80 bg-blue-100/70 p-3 shadow-lg shadow-blue-900/5 backdrop-blur-xl lg:top-5 lg:right-6 lg:left-6 lg:rounded-2xl lg:border lg:bg-blue-100/60"
    >
      <div class="flex items-center gap-x-4">
        <!-- Company logo. It steps aside while a car from the cart pulls up in its place (see carShow). -->
        <RouterLink to="/" class="shrink-0" @click="closeMenuOnNav">
          <img
            alt="Pentique logo"
            src="/images/logo.png"
            width="100"
            data-car-spot
            class="drop-shadow-md drop-shadow-blue-400 transition-opacity duration-700 ease-in-out"
            :class="carShow.active ? 'opacity-0' : 'opacity-100'"
          />
        </RouterLink>

        <!-- Main menu items -->
        <nav
          class="hidden gap-1 p-1 transition-opacity duration-700 ease-in-out lg:flex"
          :class="carShow.active ? 'opacity-40' : 'opacity-100'"
        >
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

        <!-- Search, on the right on big screens -->
        <div
          class="ml-auto hidden w-56 transition-opacity duration-700 ease-in-out lg:block xl:w-80"
          :class="carShow.active ? 'opacity-40' : 'opacity-100'"
        >
          <StoreSearchBox input-id="store-search-desktop" />
        </div>

        <!-- Mobile menu icons -->
        <div
          class="z-50 ml-auto flex items-center pr-2 transition-opacity duration-700 ease-in-out lg:hidden"
          :class="carShow.active ? 'opacity-40' : 'opacity-100'"
        >
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

      <!-- Search on phones and tablets: its own row under the logo, always visible -->
      <div class="mt-2 lg:hidden">
        <StoreSearchBox input-id="store-search-mobile" />
      </div>
    </div>
  </div>
</template>
<style scoped>
/* A blur and a tint of the page colour that both fade out towards the bottom */
.header-veil {
  background: linear-gradient(
    to bottom,
    rgb(246 242 247 / 0.75),
    rgb(246 242 247 / 0.4) 55%,
    transparent
  );
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent);
  mask-image: linear-gradient(to bottom, black 50%, transparent);
}

.mobileMenuButton-enter-active,
.mobileMenuButton-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.mobileMenuButton-enter-from,
.mobileMenuButton-leave-to {
  opacity: 0;
}
</style>
