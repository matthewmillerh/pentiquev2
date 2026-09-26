<script setup>
import { ref } from 'vue'
import { axios_api } from '@/scripts/global'

const form = ref(null)
const showForm = ref(true)
const sending = ref(false)
const errorMessage = ref('')

// Send the message to the shop
async function sendMail() {
  if (sending.value) return
  errorMessage.value = ''

  const data = new FormData(form.value)
  const text = (name) => (data.get(name) ?? '').toString()

  sending.value = true
  try {
    await axios_api.post('/contact', {
      name: text('from_name'),
      email: text('email'),
      message: text('message'),
      website: text('website'), // a hidden field for bots, people leave it empty
    })
    showForm.value = false
  } catch (error) {
    console.log(error)
    errorMessage.value =
      error.response?.data?.message ||
      'Your message could not be sent. Please check your connection and try again.'
  } finally {
    sending.value = false
  }
}
</script>
<template>
  <h1 class="text-lg font-semibold p-3 text-center">Contact Pentique</h1>

  <div v-if="showForm">
    <form class="form mb-4" ref="form" @submit.prevent="sendMail">
      <div class="md:w-1/3 lg:w-1/3 sm:w-10/12 w-10/12 ml-auto mr-auto mt-8 text-justify">
          <p class="mb-5"><input type="text" placeholder=" Name" name="from_name" class="rounded border border-gray-400 w-full" required/></p>
          <p class="mb-5"><input type="email" placeholder=" Email" name="email" class="rounded border border-gray-400 w-full" required/></p>
          <p class="mb-5"><textarea placeholder=" Message" name="message" class="rounded border border-gray-400 w-full h-60" required></textarea></p>
          <p v-if="errorMessage" class="mb-3 text-sm font-semibold text-red-700" role="alert">{{ errorMessage }}</p>
          <button type="submit" name="send" :disabled="sending" class="border border-gray-100 bg-gray-50 rounded px-2 disabled:cursor-not-allowed disabled:opacity-60">{{ sending ? 'Sending…' : 'Submit' }}</button>
          <!-- Left empty by people. Bots fill in every field they find, which tells the server to ignore the message. -->
          <div class="absolute -left-[9999px]" aria-hidden="true">
            <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
          </div>
      </div>
    </form>
  </div>

  <div v-if="!showForm">
    <p class="ml-4 mb-4">Your message was sent successfully.</p>
  </div>
  
</template>

<style>
</style>
