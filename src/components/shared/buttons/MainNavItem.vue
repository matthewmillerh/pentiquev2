<script setup>
defineProps(['icon', 'label', 'link', 'cartCount'])
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>
<template>
  <!-- Quiet until hovered; the page being viewed gets a white pill -->
  <RouterLink
    class="group flex items-center gap-2 rounded-xl px-3 py-2 whitespace-nowrap text-slate-700 transition-[background-color,color,box-shadow] duration-200 ease-out hover:bg-white/60 hover:text-slate-900 xl:px-4"
    exact-active-class="is-current bg-white/90 text-slate-900 shadow-sm shadow-blue-900/10"
    :to="link"
    @click="handleClick"
  >
    <font-awesome-icon
      :icon="icon"
      class="text-slate-500 transition-colors duration-200 group-hover:text-blue-500 group-[.is-current]:text-blue-500"
    />
    {{ label }}
    <span
      v-if="cartCount >= 0"
      class="min-w-5 rounded-full bg-blue-500/15 px-1.5 text-center text-xs leading-5 font-semibold text-blue-700"
    >
      {{ cartCount }}
    </span>
  </RouterLink>
</template>
