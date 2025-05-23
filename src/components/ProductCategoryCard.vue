<script setup>
const props = defineProps(['category1Name', 'category2Name', 'category3Name', 'imageURL'])
</script>

<template>
    <div class="bg-blue-200 rounded-lg max-w-60 flex flex-col items-center">
        <h2 class="text-center font-semibold mt-2">{{ category1Name }}</h2>
        <div class="w-40 h-72 max-w-40 max-h-72 rounded p-2 m-4 bg-blue-100 flex justify-center">
            <img :src="'/images/' + category1Name + '/' + (category2Name ? category2Name + '/' : '') + (category3Name ? category3Name + '/' : '') + imageURL" 
            class="w-full max-h-full self-center" 
            alt="">
        </div>
        
    </div>
</template>
