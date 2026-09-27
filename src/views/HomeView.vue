<script setup>
import NewArrivalsRow from '@/components/shared/NewArrivalsRow.vue'
import CategoryNavDisplay from '@/components/shared/CategoryNavDisplay.vue'
</script>

<template>
  <NewArrivalsRow />
  <!-- A plain text label rather than a card of its own: this is the page's default content, not a promoted
  section, so it should not visually compete with New Arrivals above it. -->
  <h2 class="px-5 pt-6 pb-1 text-lg font-semibold text-gray-800 sm:px-6 sm:text-xl">Categories</h2>
  <CategoryNavDisplay />
</template>
