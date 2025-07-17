<script setup>
import HomeActions from '@/components/admin/images/HomeActions.vue'
</script>

<template>
  <div class="mt-28">
    <div class="flex items-center justify-center gap-12 pt-12">
      <HomeActions
        image-src="/images/add_product.png"
        text="Add Product"
        link="/admin/add-product"
      />
      <HomeActions
        image-src="/images/products.png"
        text="Edit Products"
        link="/admin/edit-products"
      />
      <HomeActions
        image-src="/images/categories.png"
        text="Edit Categories"
        link="/admin/edit-categories"
      />
    </div>
  </div>
</template>
