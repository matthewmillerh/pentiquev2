<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Search box in the store header, searching goes to the search results page
defineProps({
  // Each search box on the page needs its own id for its label
  inputId: { type: String, required: true },
})

const route = useRoute()
const router = useRouter()
const input = ref(null)
const query = ref(route.name === 'search' ? route.query.q || '' : '')

// Show the current search while on the results page, start empty again elsewhere
watch(
  () => [route.name, route.query.q],
  ([name, q]) => {
    query.value = name === 'search' ? q || '' : ''
  },
)

const search = () => {
  const q = query.value.trim()
  if (q.length < 2) {
    input.value?.focus()
    return
  }
  router.push({ name: 'search', query: { q } })
  input.value?.blur() // closes the keyboard on phones
}
</script>
<template>
  <form role="search" class="relative w-full" @submit.prevent="search">
    <label :for="inputId" class="sr-only">Search products</label>
    <input
      :id="inputId"
      ref="input"
      v-model="query"
      type="search"
      enterkeyhint="search"
      maxlength="100"
      autocomplete="off"
      placeholder="Search products"
      class="w-full rounded-xl border border-blue-300 bg-white/80 py-2 pr-10 pl-3 text-sm shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
    />
    <button
      type="submit"
      class="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-gray-500 hover:text-gray-900"
      aria-label="Search"
    >
      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
    </button>
  </form>
</template>
