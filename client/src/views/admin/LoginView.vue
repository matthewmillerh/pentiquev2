<script setup>
import { axios_api } from '@/scripts/global'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { validateToken } from '@/scripts/auth'
import { onMounted, onUnmounted } from 'vue'

const userEmail = ref('')
const userPassword = ref('')
const router = useRouter()

// Check if the user is already logged in and validate the token
const tokenValidation = validateToken()
if (tokenValidation.valid) {
  router.push({ name: 'admin-home' }) // Redirect to admin home
} else {
  console.warn('Token validation failed:', tokenValidation.reason)
  router.push({ name: 'login' }) // Redirect to login
}

// Attempt to log the user in
const login = async () => {
  try {
    // Send email and password in the request body
    const response = await axios_api.post('/login', {
      email: userEmail.value,
      password: userPassword.value,
    })
    localStorage.setItem('pentique_auth_token', response.data.token) // Store the token in local storage
    localStorage.setItem('user', JSON.stringify(response.data.user)) // Store the user data in local storage

    router.push({ name: 'admin-home' })
  } catch (err) {
    console.error('Error:', err)
  }
}

// Event listener for 'enter' key to trigger login button
const handleKeyup = (event) => {
  if (event.key === 'Enter') {
    login()
  }
}

onMounted(() => {
  document.addEventListener('keyup', handleKeyup)
})

onUnmounted(() => {
  document.removeEventListener('keyup', handleKeyup)
})
</script>
<template>
  <div class="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center">
    <div class="absolute inset-0 m-auto h-1/2 w-1/2 rounded-lg bg-blue-400">
      <div class="flex h-full w-full items-center justify-center">
        <form @submit.prevent="login">
          <div class="flex flex-col items-center justify-center">
            <h1 class="text-3xl font-bold text-white">Log In</h1>
            <p class="text-lg text-white">Please log in to continue</p>
            <input
              type="text"
              placeholder="Username"
              class="mt-4 rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              v-model="userEmail"
              required
            />
            <input
              type="password"
              placeholder="Password"
              class="mt-2 rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              v-model="userPassword"
              required
            />
            <div class="mt-4">
              <button
                class="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Log In
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

