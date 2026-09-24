<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { axios_api } from '@/scripts/global'

// Old category links (/products/<category name>/<top level id>) live on in bookmarks and search engines.
// Top level ids did not change, so the category is found by name beneath that top level category.
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  try {
    const { data } = await axios_api.get('/categories/legacy', {
      params: { rootID: route.params.category1ID, name: route.params.category },
    })
    router.replace({
      name: 'category',
      params: { categoryID: data.categoryID, categoryName: route.params.category },
    })
  } catch {
    router.replace('/')
  }
})
</script>
<template>
  <div class="p-8 text-center">Loading...</div>
</template>
