<script setup>
import { axios_api } from '@/scripts/global.js'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CategoryTreeMenu from '@/components/shared/CategoryTreeMenu.vue'
import { findPathIDs } from '@/utils/categoryTree'

const allCategories = ref([])
const isAdmin = ref(false) // This is used to conditionally render admin links

const route = useRoute()
onMounted(() => {
  if (route.path.startsWith('/admin')) {
    isAdmin.value = true
  } else {
    isAdmin.value = false
  }
  getAllCategories()
})

//get the category tree
async function getAllCategories() {
  const routeUrl = isAdmin.value ? '/admin/get-all-categories' : '/get-all-categories'
  try {
    const response = await axios_api.get(routeUrl)
    allCategories.value = response.data
  } catch (err) {
    console.log(err)
  }
}

// The categories from the top level down to the one being viewed, these are the ones shown expanded
const activePath = computed(() => findPathIDs(allCategories.value, Number(route.params.categoryID)))
</script>
<template>
  <CategoryTreeMenu :nodes="allCategories" :active-path="activePath" :is-admin="isAdmin" />
</template>
