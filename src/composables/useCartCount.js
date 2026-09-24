import { ref } from 'vue'

// The number of products in the shopping cart (kept in localStorage), updated whenever the cart is saved
const count = ref(0)
let listening = false

const read = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    count.value = Array.isArray(cart) ? cart.length : 0
  } catch {
    count.value = 0
  }
}

export function useCartCount() {
  if (!listening) {
    listening = true
    read()
    // saveCart() announces every change to the cart
    window.addEventListener('item-added-to-cart', read)
    // and changes made in another tab
    window.addEventListener('storage', (event) => {
      if (event.key === 'cart') read()
    })
  }
  return count
}
