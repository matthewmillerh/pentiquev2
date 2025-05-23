<script setup>
import { axios_api } from '@/scripts/global.js'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const allCategories = ref([])
const showMenu = ref(false)
const emit = defineEmits(['close-mobile-menu'])

defineProps({
  cartItemCount: Number,
})

onMounted(() => {
  showMenu.value = true
  getAllCategories()
})

function closeMenu() {
  showMenu.value = false
  emit('close-mobile-menu')
}

//get all the categories and subcategories
async function getAllCategories() {
  try {
    const response = await axios_api.get('/get-all-categories')
    allCategories.value = response.data
  } catch (err) {
    console.log(err)
  }
}
</script>
<template>
  <div
    class="mobile-nav bg-opacity-50 fixed top-28 right-0 bottom-0 left-0 z-50 overflow-y-auto overscroll-y-none bg-white backdrop-blur"
    v-if="showMenu"
  >
    <ul class="mb-8 w-full text-center">
      <li class="py-2 font-semibold">
        <RouterLink @click="closeMenu()" class="main-nav-link rounded-lg transition-all" to="/"
          >Home</RouterLink
        >
      </li>
      <li class="py-2 font-semibold">
        <RouterLink @click="closeMenu()" class="main-nav-link rounded-lg transition-all" to="/about"
          >About</RouterLink
        >
      </li>
      <li class="py-2 font-semibold">
        <RouterLink
          @click="closeMenu()"
          class="main-nav-link rounded-lg transition-all"
          to="/contact"
          >Contact</RouterLink
        >
      </li>
      <li class="py-2 font-semibold">
        <RouterLink
          @click="closeMenu()"
          class="main-nav-link rounded-lg transition-all"
          to="/shipping"
          >Shipping</RouterLink
        >
      </li>
      <li class="py-2 font-semibold">
        <RouterLink
          @click="closeMenu()"
          class="main-nav-link rounded-lg transition-all"
          to="/shopping-cart"
          >Cart (<span class="text-sm font-semibold">{{ cartItemCount }}</span
          >)</RouterLink
        >
      </li>
      <li class="mt-2 mb-2 text-2xl">Products</li>

      <!-- Loop through each top level category -->
      <li v-for="(category1, index) in allCategories" :key="index" class="rounded-lg">
        <RouterLink
          :to="'/products/' + category1.name + '/' + category1.id"
          class="block h-full w-full rounded-lg px-3 py-2 font-semibold transition-all"
          @click="closeMenu()"
          >{{ category1.name }}</RouterLink
        >
        <!-- Loop through each level 2 category -->
        <ul v-if="category1.subcategories.length">
          <li v-for="(category2, index) in category1.subcategories" :key="index">
            <RouterLink
              :to="'/products/' + category2.name + '/' + category1.id"
              class="block rounded-lg py-1 pr-2 pl-4 transition-all"
              @click="closeMenu()"
              >{{ category2.name }}</RouterLink
            >

            <!-- Loop through each level 3 category -->
            <ul v-if="category2.subcategories.length">
              <li v-for="(category3, index) in category2.subcategories" :key="index">
                <RouterLink
                  :to="'/products/' + category3.name + '/' + category1.id"
                  class="block rounded-lg py-1 pr-2 pl-8 font-thin transition-all"
                  @click="closeMenu()"
                  >{{ category3.name }}</RouterLink
                >
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<style scoped>
.mobile-nav::-webkit-scrollbar {
  width: 0px;
}
</style>
