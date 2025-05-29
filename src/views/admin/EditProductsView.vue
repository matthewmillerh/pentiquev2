<script setup>
import ProductMenuMain from '@/components/shared/ProductMenuMain.vue'
import { axios_api } from '@/scripts/global.js'
import { onMounted, ref } from 'vue'

const allCategories = ref([])

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
</script>
<template>
  <div class="mt-28">
    <div
      class="fixed hidden max-h-[80%] w-[17%] max-w-[17%] overflow-x-hidden overflow-y-auto rounded-lg border border-blue-300 bg-blue-200 shadow sm:block"
    >
      <!-- Product side menu -->
      <ProductMenuMain></ProductMenuMain>
    </div>
  </div>
</template>
<style scoped></style>
