<script setup>
import { RouterView } from 'vue-router'
import AuroraBackground from '@/components/AuroraBackground.vue'
</script>

<template>
  <!-- Animated background behind every page -->
  <AuroraBackground />
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<style scoped></style>
