import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ContactView from '@/views/ContactView.vue'
import ShippingView from '@/views/ShippingView.vue'
import ProductsView from '@/views/ProductsView.vue'
import ProductView from '@/views/ProductView.vue'
import ShoppingCart from '@/views/ShoppingCart.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import OrderSuccess from '@/views/OrderSuccess.vue'
import OrderFailure from '@/views/OrderFailure.vue'
import AdminView from '@/views/admin/AdminView.vue'
import LoginView from '@/views/admin/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/shipping',
      name: 'shipping',
      component: ShippingView,
    },
    {
      path: '/products/:category/:category1ID/:category2?/:category3?',
      name: 'products',
      component: ProductsView,
    },
    {
      path: '/product/:productID/:category1ID',
      name: 'product',
      component: ProductView,
    },
    {
      path: '/shopping-cart',
      name: 'shopping-cart',
      component: ShoppingCart,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
    },
    {
      path: '/order-success',
      name: 'order-success',
      component: OrderSuccess,
    },
    {
      path: '/order-failure',
      name: 'order-failure',
      component: OrderFailure,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

export default router
