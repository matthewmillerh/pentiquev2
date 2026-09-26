import { reactive } from 'vue'

// While the car drives through the menu bar the bar makes way for it: the logo steps aside and the menu dims
// (it stays usable). Set by components/cart/CarArrival.vue, read by the menu bar.
export const carShow = reactive({ active: false })
