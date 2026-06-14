<script setup>
import { onMounted, ref, nextTick } from 'vue'
import EditButton from '@/components/shared/buttons/EditButton.vue'
import DeleteButton from '@/components/shared/buttons/DeleteButton.vue'
import RenameCategoryModal from '@/components/admin/RenameCategoryModal.vue'
import DeleteCategoryModal from '@/components/admin/DeleteCategoryModal.vue'
import { axios_api } from '@/scripts/global'
import CreateCategoryModal from './CreateCategoryModal.vue'
import AddButton from '../shared/buttons/AddButton.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const allCategories = ref([])
const props = defineProps(['productData'])
const showRenameModal = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const isLoading = ref(false)
const currentCategory = ref(null)
const currentCategoryID = ref(null)
const currentCategoryLevel = ref(null)
const modalMessage = ref('')
const categoryPath = ref('')

onMounted(() => {
  allCategories.value = JSON.parse(JSON.stringify(props.productData)) // Create a deep copy of the producData prop
})

// Function to refresh categories from the server
const refreshCategoriesFromServer = async () => {
  try {
    const response = await axios_api.get('/admin/get-all-categories')
    if (response.status === 200 && response.data) {
      allCategories.value = response.data
      await nextTick()
      return true
    } else {
      console.warn('Failed to refresh categories from server:', response.status)
      return false
    }
  } catch (error) {
    console.error('Error refreshing categories from server:', error)
    return false
  }
}

// Function to handle renaming a category
const renameCategory = (category, id, categoryLevel) => {
  currentCategory.value = category
  currentCategoryID.value = id
  currentCategoryLevel.value = categoryLevel

  modalMessage.value = 'Enter the new category name:'
  showRenameModal.value = true
}

// Function to handle creating a new category
const createCategory = (level, parentID) => {
  currentCategoryLevel.value = level
  currentCategoryID.value = parentID || null // If creating a top-level category, parentID will be null
  modalMessage.value = 'Enter the new category name:'
  showCreateModal.value = true
}

// Function to handle deleting a category
const deleteCategory = (level, id, category, path) => {
  currentCategory.value = category
  currentCategoryLevel.value = level
  currentCategoryID.value = id
  categoryPath.value = path
  showDeleteModal.value = true
}

// Reset the modal state after closing it
const resetModals = () => {
  currentCategory.value = null
  currentCategoryID.value = null
  currentCategoryLevel.value = null
  categoryPath.value = ''
  showRenameModal.value = false
  showCreateModal.value = false
  showDeleteModal.value = false
  isLoading.value = false
}

// Save the new category name to the database
const confirmUpdate = async (newCategoryName) => {
  isLoading.value = true

  try {
    const response = await axios_api.put('/categories/rename', {
      categoryName: newCategoryName,
      categoryID: currentCategoryID.value,
      categoryLevel: currentCategoryLevel.value,
    })

    if (response.status === 200) {
      // Immediately refresh categories from server after successful update
      const refreshSuccess = await refreshCategoriesFromServer()

      if (refreshSuccess) {
        isLoading.value = false
        resetModals()
      } else {
        console.warn('Category updated but failed to refresh UI')
        isLoading.value = false
        alert('Category updated but UI refresh failed. Please refresh the page to see changes.')
      }
    } else {
      console.warn('API call successful, but unexpected status:', response.status)
      isLoading.value = false
      alert('Category update failed or no change needed.')
    }
  } catch (err) {
    console.error('Error updating category name:', err)
    isLoading.value = false
    alert('Failed to update category name. Please try again. Check console for details.')
  }
}

// Save the new category to the database
const confirmCreate = async (newCategoryName) => {
  isLoading.value = true

  try {
    const response = await axios_api.post('/categories/create', {
      categoryName: newCategoryName,
      categoryLevel: currentCategoryLevel.value,
      parentId: currentCategoryID.value,
    })

    if (response.status === 201 && response.data && response.data.id) {
      // Immediately refresh categories from server after successful creation
      const refreshSuccess = await refreshCategoriesFromServer()

      if (refreshSuccess) {
        isLoading.value = false
        resetModals()
      } else {
        console.warn('Category created but failed to refresh UI')
        isLoading.value = false
        alert('Category created but UI refresh failed. Please refresh the page to see changes.')
      }
    } else {
      console.warn('Invalid response structure:', response)
      console.warn('Expected status 201 and response.data.id, but got:', {
        status: response.status,
        hasData: !!response.data,
        hasId: !!(response.data && response.data.id),
      })
      isLoading.value = false
      alert('Failed to create category: Invalid server response. Please try again.')
    }
  } catch (err) {
    console.error('Error creating category:', err)
    isLoading.value = false
    alert('Failed to create category. Please try again. Check console for details.')
  }
}

// delete the category from the database
const confirmDelete = async () => {
  isLoading.value = true

  try {
    const response = await axios_api.delete('/categories/delete', {
      data: {
        categoryLevel: currentCategoryLevel.value,
        categoryID: currentCategoryID.value,
      },
    })

    if (response.status === 200) {
      // Immediately refresh categories from server after successful deletion
      const refreshSuccess = await refreshCategoriesFromServer()

      if (refreshSuccess) {
        isLoading.value = false
        resetModals()
      } else {
        console.warn('Category deleted but failed to refresh UI')
        isLoading.value = false
        alert('Category deleted but UI refresh failed. Please refresh the page to see changes.')
      }
    } else {
      console.warn('API call successful, but unexpected status:', response.status)
      isLoading.value = false
      alert('Failed to delete category. Please try again.')
    }
  } catch (err) {
    console.error('Error deleting category:', err)
    isLoading.value = false
    alert('Failed to delete category. Please try again. Check console for details.')
  }
}
</script>

<template>
  <div
    class="mx-auto max-h-[80%] w-[50%] max-w-[50%] overflow-x-hidden overflow-y-auto rounded-lg border border-blue-300 bg-blue-200 p-4 shadow"
  >
    <ul
      class="mb-4 cursor-pointer rounded-lg bg-white text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
    >
      <li>
        <button
          class="flex h-full w-full cursor-pointer items-center justify-center p-4"
          @click="createCategory(1, null)"
        >
          <span class="mr-2">
            <font-awesome-icon :icon="['fas', 'square-plus']" style="color: black" />
          </span>
          <span>Add new top level category</span>
        </button>
      </li>
    </ul>
    <!-- Category List -->
    <ul
      v-for="category1 in allCategories"
      :key="category1.id"
      class="group/category1 mb-4 rounded-lg bg-white p-4 shadow-md"
    >
      <li class="rounded-lg">
        <div class="mb-4 flex items-center">
          <input class="text-lg font-bold" :value="category1.name" disabled />

          <div
            class="ml-auto opacity-0 transition-opacity duration-300 ease-in group-hover/category1:opacity-100"
          >
            <AddButton text="Add Subcategory" @add="createCategory(2, category1.id)"></AddButton>
            <EditButton
              text="Rename"
              @edit="renameCategory(category1.name, category1.id, 1)"
              class="ml-1"
            ></EditButton>
            <DeleteButton
              text="Delete"
              class="ml-1"
              @delete="deleteCategory(1, category1.id, category1.name)"
            ></DeleteButton>
          </div>
        </div>
        <!-- Category level 2 List -->
        <ul
          v-for="category2 in category1.subcategories"
          :key="category2.id"
          class="group/category2 mb-4 rounded-lg bg-blue-100 p-2 shadow-md"
        >
          <li>
            <div class="flex items-center">
              <span class="font-semibold">{{ category2.name }}</span>

              <div
                class="ml-auto flex items-center gap-2 opacity-0 transition-opacity duration-300 ease-in group-hover/category2:opacity-100"
              >
                <AddButton @add="createCategory(3, category2.id)"></AddButton>
                <EditButton @edit="renameCategory(category2.name, category2.id, 2)"></EditButton>
                <DeleteButton
                  @delete="deleteCategory(2, category2.id, category2.name)"
                ></DeleteButton>
              </div>
            </div>

            <!-- Category level 3 List -->
            <ul>
              <li
                v-for="category3 in category2.subcategories"
                :key="category3.id"
                class="group/category3 my-2 rounded-lg bg-white p-2 shadow-md"
              >
                <div class="flex items-center">
                  <p>{{ category3.name }}</p>

                  <div
                    class="ml-auto flex items-center gap-2 opacity-0 transition-opacity duration-300 ease-in group-hover/category3:opacity-100"
                  >
                    <EditButton
                      @edit="renameCategory(category3.name, category3.id, 3)"
                    ></EditButton>
                    <DeleteButton
                      @delete="deleteCategory(3, category3.id, category3.name)"
                    ></DeleteButton>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>

  <!-- Modal for renaming categories -->
  <RenameCategoryModal
    v-if="showRenameModal"
    :title="currentCategory"
    :isLoading="isLoading"
    @close="resetModals()"
    @update="(categoryName) => confirmUpdate(categoryName)"
  ></RenameCategoryModal>

  <!-- Modal for creating new categories -->
  <CreateCategoryModal
    v-if="showCreateModal"
    :title="`Create a New Category (Level: ${currentCategoryLevel || ''})`"
    :isLoading="isLoading"
    @close="resetModals()"
    @create="(categoryName) => confirmCreate(categoryName)"
  ></CreateCategoryModal>

  <!-- Modal for deleting a category -->
  <DeleteCategoryModal
    v-if="showDeleteModal"
    :title="currentCategory"
    :isLoading="isLoading"
    @close="resetModals()"
    @delete="confirmDelete()"
  ></DeleteCategoryModal>
</template>

<style scoped></style>

