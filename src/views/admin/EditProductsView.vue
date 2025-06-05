<script setup>
import EditProducts from '@/components/admin/EditProducts.vue'
import ProductMenuMain from '@/components/shared/ProductMenuMain.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const currentCategory = ref(null)
const route = useRoute()

onMounted(() => {
  currentCategory.value = route.params.category
})

//Change which category products are shown when the route params change
watch(
  () => route.params.category,
  () => {
    currentCategory.value = route.params.category
  },
)
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

  <!-- Products display -->
  <div
    class="float-right mb-4 w-full rounded-lg border border-blue-300 bg-blue-100 shadow sm:w-[80%] sm:max-w-[80%]"
  >
    <EditProducts v-if="currentCategory"></EditProducts>
  </div>
</template>
<style scoped></style>
