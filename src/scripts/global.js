import axios from 'axios'

//set axios baseURL to the current environment (production or development)
const BASE_URL = import.meta.env.VITE_APP_API_URL
export const axios_api = axios.create({
  baseURL: BASE_URL,
})

// Add request interceptor to include auth token only for protected routes
axios_api.interceptors.request.use(
  (config) => {
    // Define routes that require authentication
    const protectedRoutes = [
      '/categories/rename',
      '/categories/create',
      '/categories/delete',
      '/products/edit',
      '/products/add',
      '/admin/get-all-categories',
    ]

    // Check if the current request URL matches any protected route
    const isProtectedRoute = protectedRoutes.some(
      (route) => config.url && config.url.includes(route),
    )

    // Only add token for protected routes
    if (isProtectedRoute) {
      const token = localStorage.getItem('pentique_auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

//Format the price to Rand format
export const formatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
})

//Save the shopping cart to localStorage
export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart))

  //create an event to update the cartItemCount
  window.dispatchEvent(
    new CustomEvent('item-added-to-cart', {
      detail: {
        storage: JSON.parse(localStorage.getItem('cart')),
      },
    }),
  )
}

//get the shopping cart from localStorage
export function getCart() {
  return JSON.parse(localStorage.getItem('cart'))
}

//Get product information for each productID in the shopping cart
export async function getProducts(shoppingCart) {
  let products = []

  shoppingCart.forEach((element) => {
    getProductByID(element.productID, element.quantity).then((value) => {
      products.push(value)
    })
  })
  return products
}

//Get the product from the database by the supplied productID
async function getProductByID(id, qty) {
  let productInfo = {}

  try {
    const response = await axios_api.get('/products/' + id)

    //add the quantity of the product in the cart to the product array
    productInfo = response.data
    productInfo['quantity'] = qty
    //products.value.push(productInfo)
    //console.log(products.value)
  } catch (err) {
    console.log(err)
  }

  return productInfo
}
