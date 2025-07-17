<script setup>
import { axios_api } from '@/scripts/global.js'
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const allCategories = ref([])
const isAdmin = ref(false) // This is used to conditionally render admin links

const route = useRoute()
onMounted(() => {
  getAllCategories()

  if (route.path.startsWith('/admin')) {
    isAdmin.value = true
  } else {
    isAdmin.value = false
  }
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

//resets the product menu if the currently displayed category is clicked on while it is open
function currentCategory(category1ID) {
  return category1ID == route.params.category1ID ? true : false
}
</script>
<template>
  <!-- Main nav list for level 1 categories-->
  <ul class="text-sm">
    <li
      v-for="(category1, index) in allCategories"
      :key="index"
      class="rounded-lg border-white not-last:border-b"
    >
      <!-- Loop through all top level categories -->
      <!-- RouterLink to the top level category for admin -->
      <RouterLink
        v-if="isAdmin"
        :to="`/admin/edit-products/${category1.name}/${category1.id}`"
        class="category-item block h-full w-full rounded-lg px-3 py-2 transition-all"
      >
        {{ category1.name }}
      </RouterLink>

      <!-- RouterLink to the top level category for non-admin -->
      <RouterLink
        v-else
        :to="currentCategory(category1.id) ? '/' : `/products/${category1.name}/${category1.id}`"
        class="category-item block h-full w-full rounded-lg px-3 py-2 transition-all"
      >
        {{ category1.name }}
      </RouterLink>

      <!-- Loop through all level 2 categories -->
      <!-- Div wrapper for grid transition-->
      <Transition>
        <div class="grid grid-rows-[1fr]" v-show="currentCategory(category1.id)">
          <div class="overflow-hidden">
            <!-- Nav list for level 2 categories -->
            <ul v-if="category1.subcategories.length">
              <li v-for="(category2, index) in category1.subcategories" :key="index">
                <!-- RouterLink for level 2 categories for admin -->
                <RouterLink
                  v-if="isAdmin"
                  :to="`/admin/edit-products/${category2.name}/${category1.id}`"
                  class="category-item block rounded-lg py-1 pr-2 pl-4 transition-all"
                >
                  - {{ category2.name }}
                </RouterLink>

                <!-- RouterLink for level 2 categories for non-admin -->
                <RouterLink
                  v-else
                  :to="`/products/${category2.name}/${category1.id}`"
                  class="category-item block rounded-lg py-1 pr-2 pl-4 transition-all"
                >
                  - {{ category2.name }}
                </RouterLink>

                <!-- Nav list for level 3 categories -->
                <ul v-if="category2.subcategories.length">
                  <li v-for="(category3, index) in category2.subcategories" :key="index">
                    <!-- RouterLink for level 3 categories for admin -->
                    <RouterLink
                      v-if="isAdmin"
                      :to="`/admin/edit-products/${category3.name}/${category1.id}`"
                      class="category-item block rounded-lg py-1 pr-2 pl-8 transition-all"
                    >
                      -- {{ category3.name }}
                    </RouterLink>

                    <!-- RouterLink for level 3 categories for non-admin -->
                    <RouterLink
                      v-else
                      :to="`/products/${category3.name}/${category1.id}`"
                      class="category-item block rounded-lg py-1 pr-2 pl-8 transition-all"
                    >
                      -- {{ category3.name }}
                    </RouterLink>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </li>
  </ul>
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
</style>
