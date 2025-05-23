<script setup>

const props = defineProps(['message'])

</script>

<template>
<div class="absolute top-0 right-0 left-0 bottom-0 backdrop-blur bg-opacity-50 bg-blue-100 z-40">
    <div class="absolute left-1/2 -translate-x-1/2 max-w-96 h-auto rounded-lg
    font-semibold text-sm flex items-center justify-center p-6 border shadow-lg
    top-1/2 -translate-y-1/2 z-50 bg-blue-100"
    >
        <p>{{ message }}</p>
    </div>
</div>
</template>

<style>

</style>