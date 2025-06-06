<script setup>
import { nextTick, onMounted, ref } from 'vue'
import ModalWrapper from '../shared/ModalWrapper.vue'
import CancelButton from '../shared/buttons/CancelButton.vue'
import ConfirmButton from '../shared/buttons/ConfirmButton.vue'
import { formatter } from '@/scripts/global'

const categoryName = ref('')
const categoryInput = ref(null)
const showError = ref(false) // used to show an error message when the input field is empty
const modalWrapper = ref(null)

const emit = defineEmits(['update', 'close'])

const props = defineProps({
  title: String,
  productDetails: Object,
})

const productDetailsCopy = ref({ ...props.productDetails }) // This will hold the product details passed from the parent component

onMounted(() => {
  // Set focus on the input field for the new category name
  nextTick(() => {
    if (categoryInput.value) {
      categoryInput.value.focus()
    }
  })

  console.log('EditProductModal mounted with product details:', productDetailsCopy.value)
})

// Triggers the create function in the parent component and then closes the modal
const confirm = () => {
  if (!categoryName.value.trim()) {
    showError.value = true
  } else {
    emit('update', categoryName.value)
    closeWrapper()
  }
}

// Trigger the exit transition in the modal wrapper component
const closeWrapper = () => {
  if (modalWrapper.value) {
    modalWrapper.value.close()
  } else {
    console.warn('Child component ref is not available yet.')
  }
}

// Unmount the modal by emitting the close event
const unMount = () => {
  emit('close')
}
</script>
<template>
  <ModalWrapper :title="title" @close="unMount" ref="modalWrapper">
    <img
      :src="`/images/${productDetailsCopy.category1Name}/${productDetailsCopy.category2Name ? productDetailsCopy.category2Name + '/' : ''}${productDetailsCopy.category3Name ? category3Name + '/' : ''}${productDetailsCopy.productFileName}`"
      class="max-h-60 max-w-full self-center rounded-md p-2 shadow-md shadow-black/20"
      alt=""
    />
    <p class="min-w-[350px] text-start text-sm font-semibold">Product Description:</p>
    <textarea
      v-model="productDetailsCopy.productDescription"
      class="max-h-72 w-full rounded-md bg-neutral-100 p-1 text-sm shadow-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
    ></textarea>
    <div class="grid w-full grid-cols-2 justify-start gap-2">
      <div class="">
        <p class="text-sm font-semibold">Hide Product?</p>
      </div>
      <div>
        <input type="checkbox" name="product-hidden" v-model="productDetailsCopy.productHidden" />
      </div>
      <div><p class="text-sm font-semibold">Price:</p></div>
      <div class="text-sm">
        <span>R&nbsp;</span>
        <input
          type="number"
          name="product-price"
          class="rounded-md bg-neutral-100 px-1 shadow-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
          v-model="productDetailsCopy.productPrice"
          arrows="false"
        />
      </div>
      <div>
        <p class="text-sm font-semibold">On Special?</p>
      </div>
      <div>
        <input
          type="checkbox"
          name="product-special"
          v-model="productDetailsCopy.productSpecial"
          :true-value="1"
          :false-value="0"
        />
      </div>
      <div><p class="text-sm font-semibold">Special Price:</p></div>
      <div>
        <p class="text-sm">
          {{ formatter.format(productDetailsCopy.productSpecialPrice) || 'N/A' }}
        </p>
      </div>
    </div>
    <select
      name="product-stock-status"
      class="rounded-md bg-neutral-100 px-1 py-0.5 text-sm shadow-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
      v-model="productDetailsCopy.productStockStatus"
    >
      <option value="In Stock" :selected="productDetailsCopy.productStockStatus === 'In Stock'">
        In Stock
      </option>
      <option
        value="Out of Stock"
        :selected="productDetailsCopy.productStockStatus === 'Out of Stock'"
      >
        Out of Stock
      </option>
    </select>

    <div class="flex gap-2">
      <CancelButton @close="closeWrapper()"></CancelButton>
      <ConfirmButton @confirm="confirm()"></ConfirmButton>
    </div>
  </ModalWrapper>
</template>
<style scoped>
/* For Webkit browsers (Chrome, Safari, Edge, Opera) */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
