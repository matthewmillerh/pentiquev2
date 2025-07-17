<script setup>
import ProductCategoryCard from '@/components/ProductCategoryCard.vue'
import { onMounted, ref } from 'vue'
import { axios_api } from '@/scripts/global'

defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

onMounted(() => {
  getCategories() // Remove the delay
})

const categories = ref([])
const isLoading = ref(true) // Add loading state
const error = ref(null) // Add error state
const retryCount = ref(0) // Track retry attempts
const maxRetries = 3 // Maximum retry attempts

async function getCategories() {
  try {
    isLoading.value = true
    error.value = null

    console.log(`Attempting to load categories (attempt ${retryCount.value + 1})...`)

    const response = await axios_api.get('/category1')

    if (response.data && Array.isArray(response.data)) {
      categories.value = response.data
      console.log(`Successfully loaded ${response.data.length} categories`)
      retryCount.value = 0 // Reset retry count on success
    } else {
      throw new Error('Invalid response format from server')
    }
  } catch (err) {
    console.error('Error loading categories:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load categories'

    // Retry logic
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Retrying in 2 seconds... (${retryCount.value}/${maxRetries})`)
      setTimeout(() => {
        getCategories()
      }, 2000)
      return // Don't set loading to false yet
    } else {
      console.error('Max retries reached. Giving up.')
    }
  } finally {
    // Only set loading to false if we're not retrying
    if (retryCount.value >= maxRetries || !error.value) {
      isLoading.value = false
    }
  }
}

// Manual retry function for user-triggered retry
const retryLoad = () => {
  retryCount.value = 0
  getCategories()
}
</script>

<template>
  <div class="mr-auto ml-auto">
    <div class="flex flex-wrap justify-center-safe gap-4 p-4">
      <!-- Loading skeleton -->
      <template v-if="isLoading">
        <div v-for="n in 6" :key="`skeleton-${n}`" class="animate-pulse">
          <div class="h-32 w-48 rounded-lg bg-gray-200"></div>
        </div>
      </template>

      <!-- Error state -->
      <template v-else-if="error">
        <div class="flex w-full flex-col items-center justify-center p-8 text-center">
          <div class="mb-4 text-red-500">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-800">Failed to Load Categories</h3>
          <p class="mb-4 text-sm text-gray-600">{{ error }}</p>
          <button
            @click="retryLoad"
            class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </template>

      <!-- Actual categories -->
      <template v-else>
        <div v-for="categoryDetail in categories" :key="categoryDetail.category1ID">
          <RouterLink
            :to="`/admin/edit-products/${categoryDetail.category1Name}/${categoryDetail.category1ID}`"
            v-if="isAdmin"
          >
            <ProductCategoryCard :categoryDetails="categoryDetail"></ProductCategoryCard>
          </RouterLink>
          <RouterLink
            v-else
            :to="'/products/' + categoryDetail.category1Name + '/' + categoryDetail.category1ID"
          >
            <ProductCategoryCard :categoryDetails="categoryDetail"></ProductCategoryCard>
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>
