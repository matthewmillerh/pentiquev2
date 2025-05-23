<script setup>
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { axios_api } from '@/scripts/global'
import ProductMenuMain from '@/components/ProductMenuMain.vue'
import ProductMenuMobile from '@/components/ProductMenuMobile.vue'
import MainNavMenu from '@/components/MainNavMenu.vue'

const allCategories = ref([])
const cartItemCount = ref(0)
const showMobileMenu = ref(false)

onMounted(() => {
  getAllCategories()
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

  <!-- Main navigation menu -->
  <header>
    <MainNavMenu @toggle-mobile-menu="toggleMobileMenu()"></MainNavMenu>
  </header>

  <!-- Main content -->
  <div class="mt-28">
    <div
      class="fixed hidden max-h-[80%] w-[17%] max-w-[17%] overflow-x-hidden overflow-y-auto rounded-lg border border-blue-300 bg-blue-200 shadow sm:block"
    >
      <!-- Product side menu -->
      <ProductMenuMain></ProductMenuMain>
    </div>

    <!-- Main router view content -->
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
