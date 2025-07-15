<script setup>
import ProductCategoryCard from '@/components/ProductCategoryCard.vue'
import { onMounted, ref } from 'vue'
import { axios_api } from '@/scripts/global'

onMounted(() => {
  setTimeout(() => getCategories(), 500)
})

const categories = ref([])

async function getCategories() {
  try {
    const response = await axios_api.get('/category1')
    categories.value = response.data
  } catch (err) {
    console.log(err)
  }
}
</script>

<template>
  <div class="mr-auto ml-auto">
    <div class="flex flex-wrap justify-center-safe gap-4 p-4">
      <div v-for="categoryDetail in categories" :key="categoryDetail.category1ID">
        <RouterLink
          :to="'/products/' + categoryDetail.category1Name + '/' + categoryDetail.category1ID"
        >
          <ProductCategoryCard :categoryDetails="categoryDetail"></ProductCategoryCard>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
