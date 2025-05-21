<script setup>
import { formatter } from '@/scripts/global'

const props = defineProps(['category1Name', 'category2Name', 'category3Name', 'imageURL', 'productName', 'productPrice', 'productAvailability', 'productID', 'category1ID', 'productSpecial', 'productSpecialPrice'])
</script>

<template>
    <RouterLink :to="'/product/' + productID + '/' + category1ID">
        <div class="bg-blue-200 rounded-lg flex flex-col items-center w-52 max-w-52 p-2 border border-blue-300 shadow">
            <h2 class="text-center font-semibold text-sm mt-2 h-10 max-h-10 mb-1 overflow-hidden">{{ productName }}</h2>
            <div class="w-40 h-60 max-w-40 max-h-60 rounded p-2 bg-blue-100 flex justify-center">
                <div v-if="productSpecialPrice > 0" class="absolute mt-2 bg-red-500 bg-opacity-55 px-3 py-1 rounded-2xl flex items-center text-white backdrop-blur">
                    <span class="text-sm">On Sale:</span>&nbsp;<span class="font-semibold text-sm">{{ formatter.format(productSpecialPrice) }}</span>
                </div>
                <img :src="'/images/' + category1Name + '/' + (category2Name ? category2Name + '/' : '') + (category3Name ? category3Name + '/' : '') + imageURL" 
                class="max-w-full max-h-full self-center" 
                alt="">
            </div>
            <div class="text-center">
                <div><span class="text-sm">Price:</span> <span class="font-semibold text-sm" :class="productSpecialPrice > 0 ? 'line-through' : ''">{{ formatter.format(productPrice) }}</span></div>
                <div><span class="text-sm">{{ productAvailability }}</span></div>
             </div>
        </div>
    </RouterLink>
    
</template>
