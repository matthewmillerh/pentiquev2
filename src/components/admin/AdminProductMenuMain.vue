<script setup>
import { onMounted, ref } from 'vue'
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
const currentCategory = ref(null)
const currentCategoryID = ref(null)
const currentCategoryLevel = ref(null)
const modalMessage = ref('')
const categoryPath = ref('')

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
const createCategory = (level, parentID, path) => {
  currentCategoryLevel.value = level
  currentCategoryID.value = parentID || null // If creating a top-level category, parentID will be null
  categoryPath.value = path
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
  categoryPath.value += newCategoryName
  try {
    const response = await axios_api.post('/categories/create', {
      categoryName: newCategoryName,
      categoryLevel: currentCategoryLevel.value,
      parentId: currentCategoryID.value,
      categoryPath: categoryPath.value,
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
        categoryPath: categoryPath.value,
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
      class="mb-4 cursor-pointer rounded-lg bg-white text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
    >
      <li>
        <button
          class="flex h-full w-full cursor-pointer items-center justify-center p-4"
          @click="createCategory(1, null, '')"
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
      class="mb-4 rounded-lg bg-white p-4 shadow-md"
    >
      <li class="rounded-lg">
        <div class="mb-4 flex items-center">
          <input class="text-lg font-bold" :value="category1.name" disabled />

          <div class="ml-auto">
            <AddButton
              text="Add Subcategory"
              @add="createCategory(2, category1.id, `${category1.name}/`)"
            ></AddButton>
            <EditButton
              text="Rename"
              @edit="renameCategory(category1.name, category1.id, 1)"
              class="ml-1"
            ></EditButton>
            <DeleteButton
              text="Delete"
              class="ml-1"
              @delete="deleteCategory(1, category1.id, category1.name, category1.name)"
            ></DeleteButton>
          </div>
        </div>
        <!-- Category level 2 List -->
        <ul
          v-for="category2 in category1.subcategories"
          :key="category2.id"
          class="mb-4 rounded-lg bg-blue-100 p-2 shadow-md"
        >
          <li>
            <div class="flex items-center">
              <span class="font-semibold">{{ category2.name }}</span>

              <div class="ml-auto">
                <AddButton
                  @add="createCategory(3, category2.id, `${category1.name}/${category2.name}/`)"
                ></AddButton>
                <EditButton
                  @edit="renameCategory(category2.name, category2.id, 2)"
                  class="ml-1"
                ></EditButton>
                <DeleteButton
                  class="ml-1"
                  @delete="
                    deleteCategory(
                      2,
                      category2.id,
                      category2.name,
                      `${category1.name}/${category2.name}`,
                    )
                  "
                ></DeleteButton>
              </div>
            </div>

            <!-- Category level 3 List -->
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
                      @edit="renameCategory(category3.name, category3.id, 3)"
                    ></EditButton>
                    <DeleteButton
                      class="ml-1"
                      @delete="
                        deleteCategory(
                          3,
                          category3.id,
                          category3.name,
                          `${category1.name}/${category2.name}/${category3.name}`,
                        )
                      "
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
