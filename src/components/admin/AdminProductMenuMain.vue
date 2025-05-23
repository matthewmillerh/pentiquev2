<script setup>
import { onMounted, ref } from 'vue'
import EditButton from '@/components/admin/EditButton.vue'
import DeleteButton from '@/components/admin/DeleteButton.vue'
import GeneralModal from '@/components/shared/GeneralModal.vue'

const allCategories = ref([])
const props = defineProps(['product-data'])
const showModal = ref(false)
const currentCategory = ref(null)
const currentCategoryID = ref(null)
const modalMessage = ref('')

onMounted(() => {
  allCategories.value = props.productData
})

function renameCategory(category, id) {
  currentCategory.value = category
  currentCategoryID.value = id
  modalMessage.value = 'Enter the new category name:'
  showModal.value = true
}

function resetModal() {
  showModal.value = false
}
</script>
<template>
  <div
    class="mx-auto max-h-[80%] w-[50%] max-w-[50%] overflow-x-hidden overflow-y-auto rounded-lg border border-blue-300 bg-blue-200 p-4 shadow"
  >
    <!-- Category List -->
    <!-- Level 1 categories -->
    <ul
      v-for="(category1, index) in allCategories"
      :key="index"
      class="mb-4 rounded-lg bg-white p-4 shadow-md"
    >
      <li class="rounded-lg">
        <div class="mb-4 flex items-center">
          <input class="text-lg font-bold" :value="category1.name" disabled />

          <!-- Level 1 category rename/delete buttons -->
          <div class="ml-auto">
            <EditButton
              text="Rename"
              @click="renameCategory(category1.name, category1.id)"
            ></EditButton>
            <DeleteButton text="Delete" class="ml-1"></DeleteButton>
          </div>
        </div>

        <!-- Level 2 categories -->
        <ul
          v-for="(category2, index) in category1.subcategories"
          :key="index"
          class="mb-4 rounded-lg bg-blue-100 p-2 shadow-md"
        >
          <li>
            <div class="flex items-center">
              <span class="font-semibold">{{ category2.name }}</span>

              <!-- Level 2 category rename/delete buttons -->
              <div class="ml-auto">
                <EditButton></EditButton>
                <DeleteButton class="ml-1"></DeleteButton>
              </div>
            </div>

            <!-- Level 3 categories -->
            <ul>
              <li
                v-for="(category3, index) in category2.subcategories"
                :key="index"
                class="my-2 rounded-lg bg-white p-2 shadow-md"
              >
                <div class="flex items-center">
                  <p>{{ category3.name }}</p>

                  <!-- Level 2 category rename/delete buttons -->
                  <div class="ml-auto">
                    <EditButton></EditButton>
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

  <!-- Modal for adding and renaming categories -->
  <GeneralModal
    v-if="showModal"
    @close-modal="resetModal()"
    :title="currentCategory"
    :message="modalMessage"
  ></GeneralModal>
</template>
<style scoped></style>
