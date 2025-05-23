<script setup>

const props = defineProps(['message', 'type'])

</script>

<template>
<div class="absolute top-40 right-11 max-w-48 h-auto rounded-lg backdrop-blur bg-opacity-50
    font-semibold text-sm flex items-center justify-center p-6 border shadow-lg
    transition-all"
    :class="{ 'bg-green-500 border-green-500': type == 'success', 'bg-red-400 border-red-500': type == 'warning'}">
    <p>{{ message }}</p>
</div>
</template>

<style>

</style>