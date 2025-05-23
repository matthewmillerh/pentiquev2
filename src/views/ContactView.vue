<script setup>
import emailjs from '@emailjs/browser'
import { ref } from 'vue'

const form = ref(null)
const showForm = ref(true)

const sendMail = () => {
  emailjs.sendForm('service_qg7afqq', 'template_dpf5t2n', form.value, 'RyIXXr7-ppm95PWre')
  .then(() => {
    mailSuccess()
  }, (error) => {
      alert('Message not sent', error)
  })
}

function mailSuccess(){
  showForm.value = false
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
          <button type="submit" name="send" class="border border-gray-100 bg-gray-50 rounded px-2">Submit</button>
      </div>
    </form>
  </div>

  <div v-if="!showForm">
    <p class="ml-4 mb-4">Your message was sent successfully.</p>
  </div>
  
</template>

<style>
</style>
