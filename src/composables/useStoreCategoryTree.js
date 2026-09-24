import { ref } from 'vue'
import { axios_api } from '@/scripts/global'

// The store's category tree (only categories with products for sale), loaded once and shared by every component
// that needs it, so moving between category pages does not fetch it again.
const tree = ref([])
let loading = null

const load = () => {
  if (!loading) {
    loading = axios_api
      .get('/get-all-categories')
      .then((response) => {
        tree.value = response.data
      })
      .catch((error) => {
        console.log('Error loading categories:', error)
        loading = null // try again next time
      })
  }
  return loading
}

export function useStoreCategoryTree() {
  load()
  return { tree }
}
