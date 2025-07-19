<script setup>
defineProps(['icon', 'label', 'link', 'cartCount'])
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>
<template>
  <RouterLink
    class="main-nav-link rounded-xl border border-blue-300 bg-blue-200 px-4 py-2 shadow-md transition-all duration-300 ease-in-out hover:border-blue-400 hover:bg-blue-300 hover:shadow-lg hover:shadow-blue-500/50"
    :to="link"
    @click="handleClick"
  >
    <font-awesome-icon :icon="icon" class="text-black/50" />
    {{ label }}
    <span v-if="cartCount >= 0" class="ml-2 text-sm font-semibold">({{ cartCount }})</span>
  </RouterLink>
</template>
<style scoped>
.router-link-exact-active {
  border: 1px solid #60a5fa; /* Tailwind's blue-400 */
  background-color: #60a5fa; /* Tailwind's blue-300 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
