<script setup>
import { RouterView } from 'vue-router'
import AdminMainNavMenu from '@/components/admin/AdminMainNavMenu.vue'
</script>

<template>
  <header>
    <AdminMainNavMenu></AdminMainNavMenu>
  </header>
  <div class="mt-28">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

