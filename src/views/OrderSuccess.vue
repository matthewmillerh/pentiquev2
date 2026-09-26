<script setup>
import { useRoute } from 'vue-router'

// The order reference comes from the server once the order is placed
const route = useRoute()
const reference = typeof route.query.ref === 'string' ? route.query.ref : ''
const confirmationSent = route.query.unconfirmed !== '1'
</script>
<template>
  <div class="p-3 text-center text-lg font-semibold">Your order was placed successfully</div>
  <div class="mx-auto mb-4 w-4/5 max-w-xl text-center">
    <p v-if="reference">
      Your order reference is <span class="font-semibold">{{ reference }}</span>
    </p>
    <p v-if="confirmationSent" class="mt-3">
      We have sent a confirmation to your email address. Once your order has been processed you will
      receive an email with the invoice and payment instructions.
    </p>
    <p v-else class="mt-3">
      We have received your order, but the confirmation email could not be sent. We will contact you
      about your order shortly. Please keep your order reference.
    </p>
  </div>
</template>
<style></style>
