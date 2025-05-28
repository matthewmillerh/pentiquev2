<script setup>
import { onMounted, ref } from 'vue'
import EditButton from '@/components/admin/EditButton.vue'
import DeleteButton from '@/components/admin/DeleteButton.vue'
import RenameCategoryModal from '@/components/admin/RenameCategoryModal.vue'
import DeleteCategoryModal from '@/components/admin/DeleteCategoryModal.vue'
import { axios_api } from '@/scripts/global'
import CreateCategoryModal from './CreateCategoryModal.vue'

const allCategories = ref([])
const props = defineProps(['productData'])
const showRenameModal = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const currentCategory = ref(null)
const currentCategoryID = ref(null)
const currentCategoryLevel = ref(null)
const modalMessage = ref('')

onMounted(() => {
  allCategories.value = JSON.parse(JSON.stringify(props.productData)) // Create a deep copy of the producData prop
})

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
const deleteCategory = (level, id) => {
  currentCategoryLevel.value = level
  currentCategoryID.value = id
  showDeleteModal.value = true
}

// Reset the modal state after closing it
const resetModals = () => {
  currentCategory.value = null
  currentCategoryID.value = null
  currentCategoryLevel.value = null
  showRenameModal.value = false
  showCreateModal.value = false
  showDeleteModal.value = false
}

// Save the new category name to the database
const confirmUpdate = async (newCategoryName) => {
  try {
    const response = await axios_api.put('/categories/rename', {
      categoryName: newCategoryName,
      categoryID: currentCategoryID.value,
      categoryLevel: currentCategoryLevel.value,
    })

    if (response.status === 200) {
      const categoryIdToUpdate = currentCategoryID.value
      const categoryLevelToUpdate = currentCategoryLevel.value
      let categoryFoundAndUpdated = false

      // Find the category in allCategories and update its name
      for (const category of allCategories.value) {
        if (categoryLevelToUpdate === 1 && category.id === categoryIdToUpdate) {
          category.name = newCategoryName
          categoryFoundAndUpdated = true
          break
        }
        for (const category2 of category.subcategories) {
          if (categoryLevelToUpdate === 2 && category2.id === categoryIdToUpdate) {
            category2.name = newCategoryName
            categoryFoundAndUpdated = true
            break
          }

          for (const category3 of category2.subcategories) {
            if (categoryLevelToUpdate === 3 && category3.id === categoryIdToUpdate) {
              category3.name = newCategoryName
              categoryFoundAndUpdated = true
              break
            }
          }
        }
      }

      // Reset the modal and display error messages
      if (categoryFoundAndUpdated) {
        console.log('Category name updated in UI successfully!')
        resetModals()
      } else {
        console.warn(
          'Category not found in local data after successful API update. This might indicate a data mismatch or an issue in your search logic.',
        )
        resetModals()
      }
    } else {
      console.warn('API call successful, but unexpected status:', response.status)
      alert('Category update failed or no change needed.')
      resetModals()
    }
  } catch (err) {
    console.error('Error updating category name:', err)
    alert('Failed to update category name. Please try again. Check console for details.')
    resetModals()
  }
}

// Save the new category to the database
const confirmCreate = async (newCategoryName) => {
  try {
    const response = await axios_api.post('/categories/create', {
      categoryName: newCategoryName,
      categoryLevel: currentCategoryLevel.value,
      parentId: currentCategoryID.value,
    })

    if (response.status === 201) {
      // Add the new category to the allCategories array
      const newCategory = {
        id: response.data.id,
        name: newCategoryName,
        subcategories: [],
      }

      if (currentCategoryLevel.value === 1) {
        allCategories.value.push(newCategory)
      } else if (currentCategoryLevel.value === 2) {
        const parentCategory = allCategories.value.find((cat) => cat.id === response.data.parentId)
        if (parentCategory) {
          parentCategory.subcategories.push(newCategory)
        }
      } else if (currentCategoryLevel.value === 3) {
        for (const category of allCategories.value) {
          for (const subcategory of category.subcategories) {
            if (subcategory.id === response.data.parentId) {
              subcategory.subcategories.push(newCategory)
              break
            }
          }
        }
      }

      resetModals()
    } else {
      console.warn('API call successful, but unexpected status:', response.status)
      alert('Failed to create category. Please try again.')
      resetModals()
    }
  } catch (err) {
    console.error('Error creating category:', err)
    alert('Failed to create category. Please try again. Check console for details.')
    resetModals()
  }
}

// delete the category from the database
const confirmDelete = async () => {
  try {
    const response = await axios_api.delete('/categories/delete', {
      data: {
        categoryLevel: currentCategoryLevel.value,
        categoryID: currentCategoryID.value,
      },
    })

    if (response.status === 200) {
      // Remove the category from the allCategories array
      allCategories.value = allCategories.value.filter((cat) => cat.id !== currentCategoryID.value)
      console.log('Category deleted successfully!')
      resetModals()
    } else {
      console.warn('API call successful, but unexpected status:', response.status)
      alert('Failed to delete category. Please try again.')
      resetModals()
    }
  } catch (err) {
    console.error('Error deleting category:', err)
    alert('Failed to delete category. Please try again. Check console for details.')
    resetModals()
  }
}
</script>

<template>
  <div
    class="mx-auto max-h-[80%] w-[50%] max-w-[50%] overflow-x-hidden overflow-y-auto rounded-lg border border-blue-300 bg-blue-200 p-4 shadow"
  >
    <ul
      v-for="category1 in allCategories"
      :key="category1.id"
      class="mb-4 rounded-lg bg-white p-4 shadow-md"
    >
      <li class="rounded-lg">
        <div class="mb-4 flex items-center">
          <input class="text-lg font-bold" :value="category1.name" disabled />

          <div class="ml-auto">
            <EditButton
              text="Rename"
              @click="renameCategory(category1.name, category1.id, 1)"
            ></EditButton>
            <DeleteButton
              text="Delete"
              class="ml-1"
              @click="deleteCategory(1, category1.id)"
            ></DeleteButton>
          </div>
        </div>

        <ul
          v-for="category2 in category1.subcategories"
          :key="category2.id"
          class="mb-4 rounded-lg bg-blue-100 p-2 shadow-md"
        >
          <li>
            <div class="flex items-center">
              <span class="font-semibold">{{ category2.name }}</span>

              <div class="ml-auto">
                <EditButton @click="renameCategory(category2.name, category2.id, 2)"></EditButton>
                <DeleteButton class="ml-1" @click="deleteCategory(2, category2.id)"></DeleteButton>
              </div>
            </div>

            <ul>
              <li
                v-for="category3 in category2.subcategories"
                :key="category3.id"
                class="my-2 rounded-lg bg-white p-2 shadow-md"
              >
                <div class="flex items-center">
                  <p>{{ category3.name }}</p>

                  <div class="ml-auto">
                    <EditButton
                      @click="renameCategory(category3.name, category3.id, 3)"
                    ></EditButton>
                    <DeleteButton
                      class="ml-1"
                      @click="deleteCategory(3, category3.id)"
                    ></DeleteButton>
                  </div>
                </div>
              </li>
              <li
                class="mt-4 mb-2 cursor-pointer rounded-lg bg-white text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
              >
                <button class="cursor-pointer p-2" @click="createCategory(3, category2.id)">
                  + Add new level 3 category
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li
        class="mt-4 mb-2 rounded-lg bg-blue-100 text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
      >
        <button class="cursor-pointer p-2" @click="createCategory(2, category1.id)">
          + Add new level 2 category
        </button>
      </li>
    </ul>
    <ul
      class="mt-4 cursor-pointer rounded-lg bg-white text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
    >
      <li>
        <button class="h-full w-full cursor-pointer p-4" @click="createCategory(1, null)">
          + Add new top level category
        </button>
      </li>
    </ul>
  </div>

  <!-- Modal for renaming categories -->
  <RenameCategoryModal
    v-if="showRenameModal"
    :title="currentCategory"
    @close="resetModals()"
    @update="(categoryName) => confirmUpdate(categoryName)"
  ></RenameCategoryModal>

  <!-- Modal for creating new categories -->
  <CreateCategoryModal
    v-if="showCreateModal"
    :title="`Create a New Category (Level: ${currentCategoryLevel || ''})`"
    @close="resetModals()"
    @create="(categoryName) => confirmCreate(categoryName)"
  ></CreateCategoryModal>

  <!-- Modal for deleting a category -->
  <DeleteCategoryModal
    v-if="showDeleteModal"
    :title="currentCategory"
    @close="resetModals()"
    @delete="confirmDelete()"
  ></DeleteCategoryModal>
</template>

<style scoped></style>
