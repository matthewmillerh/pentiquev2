<script setup>
import { axios_api } from '@/scripts/global.js'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ProductCard from '@/components/shared/ProductCard.vue'
import EditProductModal from '@/components/admin/EditProductModal.vue'
import ProductBulkBar from '@/components/admin/ProductBulkBar.vue'
import ProductListTable from '@/components/admin/ProductListTable.vue'
import { flattenCategories } from '@/utils/categoryTree'

const products = ref([])
const route = useRoute()
const category = ref(null) // { id, name, path: [{ id, name }] }
const showEditModal = ref(false)
const isUpdating = ref(false)

// The current product to be edited in the modal
const productToEdit = ref(null)

//get all products in the current category, including those in its subcategories
async function getProductsByCategory() {
  try {
    const response = await axios_api.get('/products-by-category/' + route.params.categoryID)
    category.value = response.data.category
    products.value = response.data.products
  } catch (err) {
    console.log(err)
  }
}

//
// Card or list view, remembered in this browser
//
const VIEW_KEY = 'pentique_admin_product_view'
const readView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'cards'
  } catch {
    return 'cards'
  }
}
const viewMode = ref(readView())

const setView = (mode) => {
  viewMode.value = mode
  stopSelecting()
  try {
    localStorage.setItem(VIEW_KEY, mode)
  } catch {
    // only a convenience, the view is simply not remembered
  }
  if (mode === 'list') loadCategoryTree()
}

//
// Selecting products for bulk actions. The list view always has checkboxes, the card view has a selection mode.
//
const isSelecting = ref(false)
const selectedIDs = ref(new Set())
const categoryTree = ref([])
const busy = ref('') // the bulk action in progress
const busyIDs = ref(new Set()) // products with a quick action in progress (list view)
const notice = ref('') // confirmation shown after an action

const selectedCount = computed(() => selectedIDs.value.size)
const showBulkBar = computed(() => viewMode.value === 'list' || isSelecting.value)

async function loadCategoryTree() {
  if (categoryTree.value.length) return
  try {
    categoryTree.value = (await axios_api.get('/admin/get-all-categories')).data
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const startSelecting = () => {
  isSelecting.value = true
  notice.value = ''
  loadCategoryTree()
}

function stopSelecting() {
  isSelecting.value = false
  selectedIDs.value = new Set()
}

const toggleSelected = (productID) => {
  const next = new Set(selectedIDs.value)
  next.has(productID) ? next.delete(productID) : next.add(productID)
  selectedIDs.value = next
}

const selectAll = () => {
  selectedIDs.value = new Set(products.value.map((product) => product.productID))
}

const clearSelection = () => {
  selectedIDs.value = new Set()
}

// In the card view clicking a product edits it, or selects it while selecting
const onProductClick = (product) => {
  if (isSelecting.value) toggleSelected(product.productID)
  else showEditProductModal(product)
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Run a bulk action on the selected products, then say what happened and reload the list
const runBulk = async (action, request, describe) => {
  if (!selectedCount.value || busy.value) return
  busy.value = action
  notice.value = ''

  try {
    const response = await request([...selectedIDs.value])
    notice.value = describe(response.data)
    clearSelection()
    if (viewMode.value === 'cards') stopSelecting()
    await getProductsByCategory()
  } catch (error) {
    console.error(`Error in bulk ${action}:`, error)
    alert(error.response?.data?.message || 'The products could not be updated. Please try again.')
  } finally {
    busy.value = ''
  }
}

const bulkMove = (categoryID) =>
  runBulk(
    'move',
    (productIDs) => axios_api.put('/products/move', { productIDs, categoryID }),
    (data) => {
      const destination = flattenCategories(categoryTree.value).find((c) => c.id === categoryID)
      return `Moved ${plural(data.moved, 'product')} to ${destination?.label || 'the chosen category'}.`
    },
  )

const bulkUpdate = (changes, action) =>
  runBulk(
    action,
    (productIDs) => axios_api.put('/products/bulk-update', { productIDs, changes }),
    (data) => {
      const n = plural(data.updated, 'product')
      if (action === 'hide') return `${n} hidden from customers.`
      if (action === 'show') return `${n} shown to customers.`
      return `${n} marked out of stock.`
    },
  )

const bulkDelete = () => {
  const n = selectedCount.value
  const images = n === 1 ? 'its images' : 'all of their images'
  if (!window.confirm(`Delete ${plural(n, 'product')} and ${images}?\n\nThis cannot be undone.`)) {
    return
  }
  return runBulk(
    'delete',
    (productIDs) => axios_api.delete('/products/bulk-delete', { data: { productIDs } }),
    (data) => `Deleted ${plural(data.deleted, 'product')}.`,
  )
}

//
// Quick actions on a single product in the list view
//
const setBusy = (productID, isBusy) => {
  const next = new Set(busyIDs.value)
  isBusy ? next.add(productID) : next.delete(productID)
  busyIDs.value = next
}

const quickUpdate = async (product, changes) => {
  setBusy(product.productID, true)
  try {
    await axios_api.put('/products/bulk-update', { productIDs: [product.productID], changes })
    // Update the row in place, the stock status customers see follows the stock count
    if ('productHidden' in changes) product.productHidden = changes.productHidden ? 1 : 0
    if ('productStock' in changes) {
      product.productStock = changes.productStock
      product.productStockStatus = changes.productStock > 0 ? 'In Stock' : 'Out of Stock'
    }
  } catch (error) {
    console.error('Error updating product:', error)
    alert(error.response?.data?.message || 'The product could not be updated. Please try again.')
  } finally {
    setBusy(product.productID, false)
  }
}

const toggleHidden = (product) => quickUpdate(product, { productHidden: !product.productHidden })
const updateStock = (product, productStock) => quickUpdate(product, { productStock })

const quickDelete = async (product) => {
  if (!window.confirm(`Delete "${product.productName}" and all of its images?\n\nThis cannot be undone.`)) {
    return
  }
  setBusy(product.productID, true)
  await deleteProduct(product)
  setBusy(product.productID, false)
  const next = new Set(selectedIDs.value)
  next.delete(product.productID)
  selectedIDs.value = next
}

//Change which products are shown when the route params change categoryID
watch(
  () => route.params.categoryID,
  () => {
    stopSelecting()
    notice.value = ''
    getProductsByCategory()
  },
  { immediate: true },
)

if (viewMode.value === 'list') loadCategoryTree()

// Show the edit product modal with the selected product
const showEditProductModal = (product) => {
  productToEdit.value = product
  showEditModal.value = true
}

// Reset the modal state after closing it
const resetModal = () => {
  productToEdit.value = null
  showEditModal.value = false
  isUpdating.value = false
}

// Update the product details after editing
const updateProduct = async (updatedProduct, imageFiles) => {
  isUpdating.value = true

  const formData = new FormData()
  formData.append('productDetails', JSON.stringify(updatedProduct))

  for (let index = 0; index < 4; index++) {
    formData.append(`image_${index}`, imageFiles[index] || null)
  }

  try {
    // Update the product in the database and wait for completion
    const response = await axios_api.put('/products/edit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Use the updated product data from the backend response
    const updatedProductFromDB = response.data

    // Wait a moment to ensure the image files are fully written to disk
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Add cache-busting timestamp to force image reload
    const cacheKey = Date.now()
    updatedProductFromDB.cacheKey = cacheKey

    // Update the UI with the new product data
    const index = products.value.findIndex((p) => p.productID === updatedProduct.productID)
    if (index !== -1) {
      products.value[index] = updatedProductFromDB
    }

    // The product may have been moved to a category that is not shown here, so refresh the list
    if (updatedProductFromDB.categoryID !== productToEdit.value?.categoryID) {
      await getProductsByCategory()
    }

    console.log('Product updated successfully')
    resetModal()
  } catch (error) {
    console.error('Error updating product:', error)
    isUpdating.value = false
    alert(error.response?.data?.message || 'The product could not be saved. Please try again.')
    // Part of the change (the details) may have been saved even though an image failed, so show what is stored now
    await getProductsByCategory()
  }
}

// Delete product function
const deleteProduct = async (productDetails) => {
  try {
    await axios_api.delete('/products/delete', { data: { product: productDetails } })
    products.value = products.value.filter(
      (product) => product.productID !== productDetails.productID,
    )
    console.log('Product deleted successfully')
    resetModal() // Close the modal after successful deletion
  } catch (error) {
    console.error('Error deleting product:', error)
    alert(error.response?.data?.message || 'The product could not be deleted. Please try again.')
  }
}
</script>
<template>
  <!-- Products display -->
  <h1 class="p-3 text-center text-lg font-semibold">{{ category?.name }}</h1>
  <p v-if="category && category.path.length > 1" class="-mt-2 text-center text-sm text-gray-600">
    {{ category.path.map((step) => step.name).join(' › ') }}
  </p>

  <!-- View toggle, selection and confirmation of the last action -->
  <div class="mx-4 mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
    <div
      v-if="products.length"
      class="inline-flex rounded-lg border border-blue-300 bg-white p-0.5 shadow-sm"
      role="group"
      aria-label="View"
    >
      <button
        type="button"
        class="cursor-pointer rounded-md px-3 py-1"
        :class="viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'"
        :aria-pressed="viewMode === 'cards'"
        @click="setView('cards')"
      >
        <font-awesome-icon :icon="['fas', 'grip']" class="mr-1" />Cards
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-md px-3 py-1"
        :class="viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'"
        :aria-pressed="viewMode === 'list'"
        @click="setView('list')"
      >
        <font-awesome-icon :icon="['fas', 'list']" class="mr-1" />List
      </button>
    </div>
    <button
      v-if="viewMode === 'cards' && !isSelecting && products.length"
      type="button"
      class="cursor-pointer rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-gray-700 shadow-sm hover:bg-blue-50"
      @click="startSelecting"
    >
      Select products
    </button>
    <span v-if="notice" class="rounded-lg bg-green-100 px-3 py-1.5 text-green-800">{{ notice }}</span>
  </div>

  <div v-if="showBulkBar && products.length" class="mx-4 mt-3 flex justify-center">
    <ProductBulkBar
      :selected-count="selectedCount"
      :total-count="products.length"
      :categories="categoryTree"
      :busy="busy"
      :cancellable="viewMode === 'cards'"
      :hint="viewMode === 'cards' ? 'Click products to select them.' : ''"
      @select-all="selectAll"
      @clear="clearSelection"
      @move="bulkMove"
      @update="bulkUpdate"
      @delete="bulkDelete"
      @cancel="stopSelecting"
    />
  </div>

  <p v-if="category && !products.length" class="p-8 text-center text-sm text-gray-600">
    There are no products in this category.
  </p>

  <!-- List view -->
  <div v-if="viewMode === 'list' && products.length" class="mt-3 mb-4">
    <ProductListTable
      :products="products"
      :selectedIDs="selectedIDs"
      :busyIDs="busyIDs"
      @toggle="toggleSelected"
      @toggle-all="(all) => (all ? selectAll() : clearSelection())"
      @edit="showEditProductModal"
      @toggle-hidden="toggleHidden"
      @update-stock="updateStock"
      @delete="quickDelete"
    />
  </div>

  <!-- Card view -->
  <div v-else class="flex flex-wrap justify-center gap-5 p-4">
    <div
      v-for="product in products"
      :key="`${product.productID}-${product.cacheKey || 0}`"
      @click="onProductClick(product)"
      class="relative cursor-pointer rounded-lg"
      :class="
        isSelecting && selectedIDs.has(product.productID)
          ? 'ring-4 ring-blue-500 ring-offset-2'
          : isSelecting
            ? 'opacity-80 hover:opacity-100'
            : ''
      "
      :aria-pressed="isSelecting ? selectedIDs.has(product.productID) : undefined"
    >
      <!-- Tick shown on selected products -->
      <span
        v-if="isSelecting"
        class="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm font-bold shadow"
        :class="
          selectedIDs.has(product.productID)
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-gray-400 bg-white text-transparent'
        "
      >
        ✓
      </span>
      <ProductCard :productDetails="product" show-stock-count></ProductCard>
    </div>
  </div>

  <!-- EditProductModal -->
  <EditProductModal
    v-if="showEditModal"
    :product-details="productToEdit"
    :is-updating="isUpdating"
    @close="resetModal"
    @update="updateProduct"
    @delete="deleteProduct"
  ></EditProductModal>
</template>
<style scoped></style>
