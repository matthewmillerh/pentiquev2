<script setup></script>
<template>
  <div class="fixed top-0 right-0 left-0 h-28 bg-white/50 backdrop-blur" style="z-index: 50">
    <div
      class="fixed top-5 right-6 left-6 flex flex-wrap items-center justify-center rounded-lg border border-blue-300 bg-blue-200/60 p-3 shadow shadow-blue-100"
      style="z-index: 50"
    >
      <!-- Company logo -->
      <img alt="Pentique logo" src="/images/logo.png" width="100" />

      <!-- Main menu items -->
      <nav class="hidden p-2 sm:block">
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/admin">
          Home
        </RouterLink>
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/admin/add-product">
          Add a Product
        </RouterLink>
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/admin/edit-products">
          Edit Products
        </RouterLink>
        <RouterLink class="main-nav-link rounded-lg p-3 transition-all" to="/admin/edit-categories">
          Edit Categories
        </RouterLink>
      </nav>
    </div>
  </div>
</template>
<style scoped></style>
