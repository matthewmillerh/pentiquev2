<script setup>
import { onMounted, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const allCategories = ref([])
const props = defineProps(['product-data'])

onMounted(() => {
  allCategories.value = props.productData
})
</script>
<template>
  <div
    class="mx-auto max-h-[80%] w-[50%] max-w-[50%] overflow-x-hidden overflow-y-auto rounded-lg border border-blue-300 bg-blue-200 p-4 shadow"
  >
    <!-- Category List -->
    <ul
      v-for="(category1, index) in allCategories"
      :key="index"
      class="mb-2 rounded-lg bg-white p-4 shadow-md"
    >
      <li class="rounded-lg">
        <div class="mb-4 flex items-center">
          <input class="text-lg font-bold" :value="category1.name" disabled />
          <div
            class="ml-auto cursor-pointer rounded-lg bg-green-300 p-2 text-sm font-semibold shadow-md"
          >
            <font-awesome-icon :icon="['fas', 'trash']" style="color: black" />
            <span class="ml-1">Edit</span>
          </div>
          <div
            class="ml-2 cursor-pointer rounded-lg bg-red-300 p-2 text-sm font-semibold shadow-md"
          >
            <font-awesome-icon :icon="['fas', 'trash']" style="color: black" />
            <span class="ml-1">Remove</span>
          </div>
        </div>

        <!-- list for level 2 categories -->
        <ul
          v-for="(category2, index) in category1.subcategories"
          :key="index"
          class="mb-2 rounded-lg bg-blue-100 p-2 shadow-md"
        >
          <li>
            <p class="font-semibold">{{ category2.name }}</p>

            <!-- list for level 3 categories -->
            <ul v-if="category2.subcategories.length">
              <li
                v-for="(category3, index) in category2.subcategories"
                :key="index"
                class="my-2 rounded-lg bg-white p-2 shadow-md"
              >
                <p>{{ category3.name }}</p>
              </li>
              <li
                class="mt-4 mb-2 cursor-pointer rounded-lg bg-white p-2 text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
              >
                <p>+ Add new level 3 category</p>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li
        class="mt-4 mb-2 cursor-pointer rounded-lg bg-blue-100 p-2 text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
      >
        <p>+ Add new level 2 category</p>
      </li>
    </ul>
    <ul
      class="mt-4 cursor-pointer rounded-lg bg-white p-4 text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
    >
      <li><p>+ Add new top level category</p></li>
    </ul>
  </div>
</template>
<style scoped></style>
