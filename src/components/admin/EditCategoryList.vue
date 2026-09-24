<script setup>
import { computed, onMounted, provide, reactive, ref, nextTick } from 'vue'
import RenameCategoryModal from '@/components/admin/RenameCategoryModal.vue'
import DeleteCategoryModal from '@/components/admin/DeleteCategoryModal.vue'
import MoveCategoryModal from '@/components/admin/MoveCategoryModal.vue'
import CategoryAdminNode from '@/components/admin/CategoryAdminNode.vue'
import { axios_api } from '@/scripts/global'
import CreateCategoryModal from './CreateCategoryModal.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { findPathIDs, flattenCategories } from '@/utils/categoryTree'

const allCategories = ref([])
const props = defineProps(['productData'])
const showRenameModal = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showMoveModal = ref(false)
const moveMode = ref('move') // 'move' or 'merge'
const isLoading = ref(false)
const modalError = ref('') // why the last change was refused, shown in the open modal
const currentCategory = ref(null) // the category the open modal is about
const createParent = ref(null) // where a new category is created, null is the top level

onMounted(() => {
  allCategories.value = JSON.parse(JSON.stringify(props.productData)) // Create a deep copy of the producData prop
})

//
// Tree state shared with every CategoryAdminNode
//
const expanded = reactive(new Set())
const search = ref('')
const highlightID = ref(null)

const query = computed(() => search.value.trim().toLowerCase())

// While searching, only matching categories and the categories leading to them are shown, all expanded
const visibleCategories = computed(() => {
  if (!query.value) return allCategories.value
  const filter = (nodes) =>
    nodes
      .map((node) => {
        if (node.name.toLowerCase().includes(query.value)) return node
        const subcategories = filter(node.subcategories)
        return subcategories.length ? { ...node, subcategories } : null
      })
      .filter(Boolean)
  return filter(allCategories.value)
})

const categoryCount = computed(() => flattenCategories(allCategories.value).length)

provide('categoryEditor', {
  highlightID,
  isOpen: (id) => !!query.value || expanded.has(id),
  toggle: (id) => (expanded.has(id) ? expanded.delete(id) : expanded.add(id)),
})

const expandAll = () => flattenCategories(allCategories.value).forEach((c) => expanded.add(c.id))
const collapseAll = () => expanded.clear()

// Open the tree down to a category, scroll to it and briefly highlight it so the change is easy to spot
const reveal = async (id) => {
  if (!id) return
  findPathIDs(allCategories.value, id)
    .slice(0, -1)
    .forEach((ancestor) => expanded.add(ancestor))
  highlightID.value = id
  await nextTick()
  document.getElementById(`category-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  setTimeout(() => {
    if (highlightID.value === id) highlightID.value = null
  }, 2000)
}

// Function to refresh categories from the server
const refreshCategoriesFromServer = async () => {
  try {
    const response = await axios_api.get('/admin/get-all-categories')
    allCategories.value = response.data
    await nextTick()
    return true
  } catch (error) {
    console.error('Error refreshing categories from server:', error)
    return false
  }
}

// Reset the modal state after closing it
const resetModals = () => {
  currentCategory.value = null
  createParent.value = null
  modalError.value = ''
  showRenameModal.value = false
  showCreateModal.value = false
  showDeleteModal.value = false
  showMoveModal.value = false
  isLoading.value = false
}

// Run a change on the server, then refresh the tree and show the category that changed.
// When the server refuses (duplicate name, category still has products, ...) its reason is shown in the modal.
const applyChange = async (request, failureMessage, changedID) => {
  isLoading.value = true
  modalError.value = ''

  let response
  try {
    response = await request()
  } catch (err) {
    console.error(failureMessage, err)
    isLoading.value = false
    modalError.value = err.response?.data?.message || `${failureMessage} Please try again.`
    return
  }

  const refreshSuccess = await refreshCategoriesFromServer()
  resetModals()
  if (!refreshSuccess) {
    alert('The change was saved but the list could not be refreshed. Please refresh the page.')
    return
  }
  reveal(typeof changedID === 'function' ? changedID(response) : changedID)
}

// Modal openers
const renameCategory = (node) => {
  currentCategory.value = node
  showRenameModal.value = true
}

const createCategory = (parentNode) => {
  createParent.value = parentNode
  showCreateModal.value = true
}

const deleteCategory = (node) => {
  currentCategory.value = node
  showDeleteModal.value = true
}

const moveCategory = (node, mode) => {
  currentCategory.value = node
  moveMode.value = mode
  showMoveModal.value = true
}

// The parent a category currently has, null for a top level category
const currentParentID = (node) => {
  const path = findPathIDs(allCategories.value, node.id)
  return path.length > 1 ? path[path.length - 2] : null
}

// Save the new category name to the database
const confirmUpdate = (newCategoryName) =>
  applyChange(
    () =>
      axios_api.put('/categories/rename', {
        categoryName: newCategoryName,
        categoryID: currentCategory.value.id,
      }),
    'Failed to rename the category.',
    currentCategory.value.id,
  )

// Save the new category to the database
const confirmCreate = (newCategoryName) =>
  applyChange(
    () =>
      axios_api.post('/categories/create', {
        categoryName: newCategoryName,
        parentID: createParent.value ? createParent.value.id : null,
      }),
    'Failed to create the category.',
    (response) => response.data.id,
  )

// Move the category (with its subcategories and products), or merge it into another one
const confirmMove = (targetID) => {
  const categoryID = currentCategory.value.id
  return moveMode.value === 'merge'
    ? applyChange(
        () => axios_api.put('/categories/merge', { sourceID: categoryID, targetID }),
        'Failed to merge the categories.',
        targetID,
      )
    : applyChange(
        () => axios_api.put('/categories/move', { categoryID, newParentID: targetID }),
        'Failed to move the category.',
        categoryID,
      )
}

// delete the category from the database
const confirmDelete = () =>
  applyChange(
    () => axios_api.delete('/categories/delete', { data: { categoryID: currentCategory.value.id } }),
    'Failed to delete the category.',
    null,
  )
</script>

<template>
  <div
    class="mx-auto mb-8 w-[95%] max-w-4xl overflow-hidden rounded-xl border border-blue-300 bg-white/95 shadow"
  >
    <!-- Header -->
    <div class="flex flex-wrap items-center gap-3 border-b border-gray-200 px-5 py-4">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Categories</h1>
        <p class="text-sm text-gray-500">
          {{ categoryCount }} categories. Moving or merging a category takes its products with it.
        </p>
      </div>
      <button
        type="button"
        class="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        @click="createCategory(null)"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        New category
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3">
      <label class="relative min-w-[200px] flex-1">
        <span class="sr-only">Search categories</span>
        <font-awesome-icon
          :icon="['fas', 'magnifying-glass']"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search categories"
          class="w-full rounded-lg border border-gray-300 bg-white py-1.5 pr-3 pl-9 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </label>
      <button
        type="button"
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none"
        :disabled="!!query"
        @click="expandAll"
      >
        Expand all
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none"
        :disabled="!!query"
        @click="collapseAll"
      >
        Collapse all
      </button>
    </div>

    <!-- Category tree, subcategories can be nested to any depth -->
    <ul v-if="visibleCategories.length" class="divide-y divide-gray-100 px-3 py-2">
      <CategoryAdminNode
        v-for="category in visibleCategories"
        :key="category.id"
        :node="category"
        @add="createCategory"
        @rename="renameCategory"
        @move="(node) => moveCategory(node, 'move')"
        @merge="(node) => moveCategory(node, 'merge')"
        @delete="deleteCategory"
      />
    </ul>
    <p v-else-if="query" class="px-5 py-10 text-center text-sm text-gray-500">
      No categories match "{{ search.trim() }}".
    </p>
    <p v-else class="px-5 py-10 text-center text-sm text-gray-500">
      There are no categories yet. Use "New category" to add the first one.
    </p>
  </div>

  <!-- Modal for renaming categories -->
  <RenameCategoryModal
    v-if="showRenameModal"
    :title="`Rename “${currentCategory.name}”`"
    :initialName="currentCategory.name"
    :isLoading="isLoading"
    :error="modalError"
    @close="resetModals()"
    @update="(categoryName) => confirmUpdate(categoryName)"
  ></RenameCategoryModal>

  <!-- Modal for creating new categories -->
  <CreateCategoryModal
    v-if="showCreateModal"
    :title="createParent ? `Add a subcategory to “${createParent.name}”` : 'New top level category'"
    :isLoading="isLoading"
    :error="modalError"
    @close="resetModals()"
    @create="(categoryName) => confirmCreate(categoryName)"
  ></CreateCategoryModal>

  <!-- Modal for moving a category, or merging it into another -->
  <MoveCategoryModal
    v-if="showMoveModal"
    :mode="moveMode"
    :category="currentCategory"
    :categories="allCategories"
    :initialTarget="moveMode === 'move' ? currentParentID(currentCategory) : null"
    :isLoading="isLoading"
    :error="modalError"
    @close="resetModals()"
    @confirm="(targetID) => confirmMove(targetID)"
  ></MoveCategoryModal>

  <!-- Modal for deleting a category -->
  <DeleteCategoryModal
    v-if="showDeleteModal"
    :category="currentCategory"
    :isLoading="isLoading"
    :error="modalError"
    @close="resetModals()"
    @delete="confirmDelete()"
  ></DeleteCategoryModal>
</template>

<style scoped></style>
