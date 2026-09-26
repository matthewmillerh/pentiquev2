<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { getCart, saveCart, axios_api } from '@/scripts/global'
import router from '@/router'

const deliveryMethod = ref(null)
const form = ref(null)
const cartItems = ref([])
const submitting = ref(false)
const errorMessage = ref('')

const cartIsEmpty = computed(() => cartItems.value.length === 0)

onBeforeMount(() => {
  cartItems.value = getCart() || []
})

// Send the order to the shop. The server looks up the products and prices itself, so only the cart's product ids
// and quantities are sent, together with the customer's details.
async function placeOrder() {
  if (submitting.value || cartIsEmpty.value) return
  errorMessage.value = ''

  const data = new FormData(form.value)
  const text = (name) => (data.get(name) ?? '').toString()
  const method = text('delivery')

  submitting.value = true
  try {
    const response = await axios_api.post('/orders', {
      name: text('from_name'),
      email: text('email'),
      tel: text('tel'),
      delivery: method,
      address: text('address'),
      postalCode: text('postal-code'),
      province: text('province-state'),
      country: text('country'),
      // the branch is typed into a field named after the delivery method
      branch: ['postnet', 'pep', 'pudo'].includes(method) ? text(method) : '',
      note: text('note'),
      website: text('website'), // a hidden field for bots, people leave it empty
      items: cartItems.value.map(({ productID, quantity }) => ({ productID, quantity })),
    })
    orderSuccess(response.data)
  } catch (error) {
    console.log(error)
    errorMessage.value =
      error.response?.data?.message ||
      'Your order could not be sent. Please check your connection and try again.'
  } finally {
    submitting.value = false
  }
}

function orderSuccess({ ref, confirmationSent }) {
  emptyCart()
  router.push({ path: '/order-success', query: { ref, ...(confirmationSent ? {} : { unconfirmed: '1' }) } })
}

//empty the entire cart
function emptyCart() {
  cartItems.value = []

  //Save the updated cart array to localStorage
  saveCart([])
}
</script>
<template>
  <h1 class="text-lg font-semibold p-3 text-center">Finalize Your Order</h1>
  <form class="form" ref="form" @submit.prevent="placeOrder">
    <div class="mx-auto w-4/5 pb-3">
      <div>
        <p class="font-semibold">Your Details</p>
      </div>
      <div class="w-64">
        <div class="py-4 relative mt-3">
          <input type="name" placeholder="Name" id="name" name="from_name" class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full" required>
          <label 
            for="name" 
            class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
            peer-placeholder-shown:top-5
          peer-placeholder-shown:text-gray-600
            peer-placeholder-shown:font-normal
            transition-all">
              Name
          </label>
        </div>
        <div class="py-4 relative">
          <input type="email" placeholder="Email address" id="email" name="email" class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full" required>
          <label 
            for="email" 
            class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
            peer-placeholder-shown:top-5
          peer-placeholder-shown:text-gray-600
            peer-placeholder-shown:font-normal
            transition-all">
              Email address
          </label>
        </div>
        <div class="py-4 relative">
          <input type="tel" placeholder="Phone number" id="tel" name="tel" class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full" required>
          <label 
            for="tel" 
            class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
            peer-placeholder-shown:top-5
          peer-placeholder-shown:text-gray-600
            peer-placeholder-shown:font-normal
            transition-all">
              Phone number
          </label>
        </div>  
      </div>
      <div>
        <p class="font-semibold mb-4 mt-4">Delivery Options</p>
      </div>
      <div class="text-sm z-10 bg-blue-100 relative">
        <div class="py-1">
          <input type="radio" name="delivery" id="collection" class="mr-2" v-model="deliveryMethod" value="collect" required>
          <label for="collection">Collect at 19 Rand Street, Durbanville, 7550 <span class="font-semibold">(Free)</span></label>
        </div>
        <div class="py-1">
          <input type="radio" name="delivery" id="to-door" class="mr-2" v-model="deliveryMethod" value="to-door">
          <label for="to-door">Delivery to Your Door <span class="font-semibold">(Price calculated after order is placed)</span></label>
        </div>
        <div class="py-1">
          <input type="radio" name="delivery" id="postnet" class="mr-2" v-model="deliveryMethod" value="postnet">
          <label for="postnet">Collect at Postnet <span class="font-semibold">(Price calculated after order is placed)</span></label>
        </div>
        <div class="py-1">
          <input type="radio" name="delivery" id="pep" class="mr-2" v-model="deliveryMethod" value="pep">
          <label for="pep">Collect at Pep <span class="font-semibold">(Price calculated after order is placed)</span></label>
        </div>
        <div class="py-1">
          <input type="radio" name="delivery" id="pudo" class="mr-2" v-model="deliveryMethod" value="pudo">
          <label for="pudo">Collect at PUDO locker <span class="font-semibold">(Price calculated after order is placed)</span></label>
        </div>        
      </div>
      <!-- Input fields to show when delivery to door is selected -->
       <Transition>
        <div v-if="deliveryMethod === 'to-door'" class="z-0">
          <div class="py-4 relative mt-3">
            <input type="address" placeholder="Address" name="address" id="address" class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full" required>
            <label 
              for="address" 
              class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
              peer-placeholder-shown:top-5
            peer-placeholder-shown:text-gray-600
              peer-placeholder-shown:font-normal
              transition-all">
                Address
            </label>
          </div>
          <div class="py-4 relative">
            <input 
              type="number" 
              placeholder="Postal Code" 
              id="postal-code"
              name="postal-code"
              class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full
              [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
              required>
            <label 
              for="postal-code" 
              class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
              peer-placeholder-shown:top-5
            peer-placeholder-shown:text-gray-600
              peer-placeholder-shown:font-normal
              transition-all">
                Postal Code
            </label>
          </div>
          <div class="py-4 relative">
            <input 
              type="text" 
              placeholder="Province/State" 
              id="provice-state"
              name="province-state" 
              class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full"
              required>
            <label 
              for="province-state" 
              class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
              peer-placeholder-shown:top-5
            peer-placeholder-shown:text-gray-600
              peer-placeholder-shown:font-normal
              transition-all">
                Province/State
            </label>
          </div>
          <div class="py-4 relative">
            <input 
              type="text" 
              placeholder="Country" 
              name="country"
              id="country" 
              class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full"
              required>
            <label 
              for="country" 
              class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
              peer-placeholder-shown:top-5
            peer-placeholder-shown:text-gray-600
              peer-placeholder-shown:font-normal
              transition-all">
                Country
            </label>
          </div>
        </div>
       </Transition>     
      <!-- End of delivery to door input fields -->
      <!-- Postnet delivery input fields -->
      <Transition>
      <div v-if="deliveryMethod === 'postnet'" class="mt-3">
        <div class="py-4 relative">
            <input 
              type="text" 
              placeholder="Postnet Branch" 
              id="postnet-branch" 
              class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full"
              name="postnet"
              required>
            <label 
              for="postnet-branch" 
              class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
              peer-placeholder-shown:top-5
            peer-placeholder-shown:text-gray-600
              peer-placeholder-shown:font-normal
              transition-all">
                Postnet Branch
            </label>
          </div>
      </div>
      </Transition>  
      <!--End Pep delivery input fields -->
      <!-- Pep delivery input fields -->
      <Transition>
      <div v-if="deliveryMethod === 'pep'" class="mt-3">
        <div class="py-4 relative">
            <input 
              type="text" 
              placeholder="Pep Branch" 
              id="pep-branch" 
              name="pep"
              class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full"
              required>
            <label 
              for="pep-branch" 
              class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
              peer-placeholder-shown:top-5
            peer-placeholder-shown:text-gray-600
              peer-placeholder-shown:font-normal
              transition-all">
                Pep Branch
            </label>
          </div>
      </div>
      </Transition>  
      <!--End Pep delivery input fields -->

      <!-- PUDO delivery input fields -->
      <Transition>
      <div v-if="deliveryMethod === 'pudo'" class="mt-3">
        <div class="py-4 relative">
            <input 
              type="text" 
              placeholder="PUDO Branch" 
              id="pudo-branch" 
              name="pudo"
              class="peer placeholder-transparent border-b focus:outline-none p-1 rounded text-sm w-full"
              required>
            <label 
              for="pudo-branch" 
              class="absolute -top-1.5 text-sm left-1.5 cursor-text font-semibold
              peer-placeholder-shown:top-5
            peer-placeholder-shown:text-gray-600
              peer-placeholder-shown:font-normal
              transition-all">
                PUDO Branch
            </label>
          </div>
      </div>
      </Transition>  
      <!--End PUDO delivery input fields -->
      <div class="relative mt-3">
        <label 
          for="note" 
          class="font-semibold text-sm">
            Add a Note to Your Order
        </label>
        <textarea 
          id="note" 
          rows="4"
          name="note"
          class="border-b focus:outline-none p-1 mt-2 rounded text-sm w-full">
        </textarea>
      </div>
      <div>
        <p class="text-sm font-semibold mt-2">
          After placing your order you will receive an automated email confirming your order. 
          Once the order has been processed and the shipping amount calculated you will receive an email with the invoice and payment instruction.
        </p>
        <p v-if="cartIsEmpty" class="text-sm mt-3">
          Your cart is empty. <RouterLink to="/" class="underline">Continue shopping</RouterLink>
        </p>
        <p v-if="errorMessage" class="text-sm font-semibold text-red-700 mt-3" role="alert">{{ errorMessage }}</p>
        <button type="submit" name="send" :disabled="submitting || cartIsEmpty" class="rounded bg-green-300 border border-green-400 shadow-md px-2 py-1 text-sm font-semibold mt-3 disabled:cursor-not-allowed disabled:opacity-60">
          {{ submitting ? 'Placing your order…' : 'Place Order' }}
        </button>
      </div>
      <!-- Left empty by people. Bots fill in every field they find, which tells the server to ignore the order. -->
      <div class="absolute -left-[9999px]" aria-hidden="true">
        <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      </div>
    </div>
  </form>
</template>

<style>
.v-enter-active {
  transition: none;
}

.v-leave-active {
  transition: none;
}

.v-enter-from {
  opacity: 0;
}
</style>
