<script setup>
import { RouterView } from 'vue-router'
import { ref } from 'vue'
import ProductMenuMain from '@/components/shared/ProductMenuMain.vue'
import ProductMenuMobile from '@/components/ProductMenuMobile.vue'
import MainNavMenu from '@/components/MainNavMenu.vue'

const showMobileMenu = ref(false)

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}
</script>

<template>
  <!-- Mobile nav menu -->
  <div class="lg:hidden">
    <Transition name="mobile-nav-menu">
      <ProductMenuMobile
        v-if="showMobileMenu"
        @close-mobile-menu="showMobileMenu = false"
      ></ProductMenuMobile>
    </Transition>
  </div>

  <!-- Main navigation menu -->
  <header>
    <MainNavMenu
      :show-mobile-menu="showMobileMenu"
      @toggle-mobile-menu="toggleMobileMenu()"
    ></MainNavMenu>
  </header>

  <!-- Main content -->
  <!-- On phones the header is taller, it has the search box on a second row -->
  <div class="mt-26 lg:mt-28">
    <!-- The side menu and the main section share the header's glass look -->
    <div
      class="soft-scrollbar fixed hidden max-h-[80%] w-[17%] max-w-[17%] overflow-x-hidden overflow-y-auto rounded-2xl border border-blue-200/80 bg-blue-50/45 shadow-lg shadow-blue-900/5 backdrop-blur-xl lg:block"
      style="z-index: 20"
    >
      <!-- Product side menu -->
      <ProductMenuMain></ProductMenuMain>
    </div>

    <!-- Main router view content -->
    <div
      class="float-right mb-4 w-full rounded-2xl border border-blue-200/80 bg-blue-50/45 pt-4 pb-8 shadow-lg shadow-blue-900/5 backdrop-blur-xl lg:w-[80%] lg:max-w-[80%]"
      style="position: relative; z-index: 10"
    >
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<style scoped>
/* The mobile menu fades in and drops down slightly from under the header */
.mobile-nav-menu-enter-active,
.mobile-nav-menu-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.mobile-nav-menu-enter-from,
.mobile-nav-menu-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
