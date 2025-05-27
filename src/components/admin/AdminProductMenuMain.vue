<script setup>
import { onMounted, ref } from 'vue'
import EditButton from '@/components/admin/EditButton.vue'
import DeleteButton from '@/components/admin/DeleteButton.vue'
import RenameCategoryModal from '@/components/admin/RenameCategoryModal.vue'
import { axios_api } from '@/scripts/global'
import CreateCategoryModal from './CreateCategoryModal.vue'

const allCategories = ref([])
const props = defineProps(['productData'])
const showRenameModal = ref(false)
const showCreateModal = ref(false)
const currentCategory = ref(null)
const currentCategoryID = ref(null)
const currentCategoryLevel = ref(null)
const modalMessage = ref('')

onMounted(() => {
  allCategories.value = JSON.parse(JSON.stringify(props.productData)) // Create a deep copy of the producData prop
})

function renameCategory(category, id, categoryLevel) {
  currentCategory.value = category // Stores the name of the category being edited
  currentCategoryID.value = id // Stores the ID of the category being edited
  currentCategoryLevel.value = categoryLevel // Stores the category level of the category being edited

  modalMessage.value = 'Enter the new category name:'
  showRenameModal.value = true
}

function resetModal() {
  currentCategory.value = null
  currentCategoryID.value = null
  currentCategoryLevel.value = null
  showRenameModal.value = false
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
        resetModal()
      } else {
        console.warn(
          'Category not found in local data after successful API update. This might indicate a data mismatch or an issue in your search logic.',
        )
        resetModal()
      }
    } else {
      console.warn('API call successful, but unexpected status:', response.status)
      alert('Category update failed or no change needed.')
      resetModal()
    }
  } catch (err) {
    console.error('Error updating category name:', err)
    alert('Failed to update category name. Please try again. Check console for details.')
    resetModal()
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
            <DeleteButton text="Delete" class="ml-1"></DeleteButton>
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
                <DeleteButton class="ml-1"></DeleteButton>
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
                    <DeleteButton class="ml-1"></DeleteButton>
                  </div>
                </div>
              </li>
              <li
                class="mt-4 mb-2 cursor-pointer rounded-lg bg-white p-2 text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
              >
                <p>+ Add new level 3 category</p>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li
        class="mt-4 mb-2 cursor-pointer rounded-lg bg-blue-100 p-2 text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
      >
        <p>+ Add new level 2 category</p>
      </li>
    </ul>
    <ul
      class="mt-4 cursor-pointer rounded-lg bg-white p-4 text-center font-semibold shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-black/25"
    >
      <li><p>+ Add new top level category</p></li>
    </ul>
  </div>

  <RenameCategoryModal
    v-if="showRenameModal"
    :title="currentCategory"
    @close="resetModal()"
    @update="(categoryName) => confirmUpdate(categoryName)"
  ></RenameCategoryModal>
  <CreateCategoryModal
    v-if="showCreateModal"
    :title="currentCategory"
    @close="resetModal()"
    @update="(categoryName) => confirmUpdate(categoryName)"
  ></CreateCategoryModal>
</template>
<style scoped></style>
