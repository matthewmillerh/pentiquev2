<script setup>
import EditCategoryList from '@/components/admin/EditCategoryList.vue'
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
  <EditCategoryList v-if="allCategories.length" :productData="allCategories"></EditCategoryList>
</template>
<style scoped></style>
