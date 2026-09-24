<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useStoreCategoryTree } from '@/composables/useStoreCategoryTree'
import { useCartCount } from '@/composables/useCartCount'
import { findNode, findPathIDs } from '@/utils/categoryTree'

// The menu on phones and tablets: the page links in a row of icons, then the categories one level at a time.
// A category with subcategories opens its level (with a Back button and an "All ..." link to its page), a category
// without subcategories goes straight to its page.
const emit = defineEmits(['close-mobile-menu'])

const route = useRoute()
const { tree } = useStoreCategoryTree()
const cartCount = useCartCount()

const pageLinks = [
  { to: '/', label: 'Home', icon: 'house' },
  { to: '/about', label: 'About', icon: 'circle-info' },
  { to: '/contact', label: 'Contact', icon: 'address-book' },
  { to: '/shipping', label: 'Shipping', icon: 'truck-fast' },
  { to: '/shopping-cart', label: 'Cart', icon: 'cart-shopping', isCart: true },
]

// The category being viewed and the categories above it, to highlight them
const currentID = computed(() =>
  route.name === 'category' ? Number(route.params.categoryID) : null,
)
const currentPath = computed(() =>
  currentID.value ? findPathIDs(tree.value, currentID.value) : [],
)

// The category whose subcategories are listed, null for the top level. The menu opens where the visitor is: at the
// category being viewed, or at its parent when it has no subcategories of its own.
const levelID = ref(null)
const startLevel = () => {
  for (const id of [...currentPath.value].reverse()) {
    if (findNode(tree.value, id)?.subcategories.length) return id
  }
  return null
}
levelID.value = startLevel()
// The categories may still be loading when the menu opens
const stopWatching = watch(tree, () => {
  levelID.value = startLevel()
  stopWatching()
})

const level = computed(() => (levelID.value ? findNode(tree.value, levelID.value) : null))
const items = computed(() => (level.value ? level.value.subcategories : tree.value))
const parentID = computed(() => {
  const path = levelID.value ? findPathIDs(tree.value, levelID.value) : []
  return path.length > 1 ? path[path.length - 2] : null
})
const parentName = computed(() =>
  parentID.value ? findNode(tree.value, parentID.value)?.name : 'all categories',
)

// Which way the list slides when changing level
const direction = ref('forward')
const openLevel = (node) => {
  direction.value = 'forward'
  levelID.value = node.id
}
const goBack = () => {
  direction.value = 'back'
  levelID.value = parentID.value
}

const close = () => emit('close-mobile-menu')
const categoryLink = (node) => ({
  name: 'category',
  params: { categoryID: node.id, categoryName: node.name },
})

const rowClass =
  'flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-gray-800 transition-colors hover:bg-blue-50 active:bg-blue-100'
const rowState = (node) =>
  node.id === currentID.value
    ? 'bg-blue-50 font-semibold text-blue-900'
    : currentPath.value.includes(node.id)
      ? 'font-semibold text-gray-900'
      : ''
</script>
<template>
  <!-- Dimmed page behind the menu, tapping it closes the menu -->
  <div
    class="fixed inset-x-0 top-30 bottom-0 z-50 bg-black/20 backdrop-blur-[2px]"
    @click.self="close"
  >
    <nav
      aria-label="Menu"
      class="mx-3 mt-2 flex max-h-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-2xl border border-blue-300 bg-white/95 shadow-xl"
    >
      <!-- Page links -->
      <ul class="grid grid-cols-5 gap-1 border-b border-gray-200 p-2">
        <li v-for="page in pageLinks" :key="page.to">
          <RouterLink
            :to="page.to"
            class="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-xs text-gray-700 transition-colors hover:bg-blue-50"
            exact-active-class="bg-blue-100 font-semibold text-gray-900"
            @click="close"
          >
            <span class="relative">
              <font-awesome-icon :icon="['fas', page.icon]" class="text-lg text-blue-500" />
              <span
                v-if="page.isCart && cartCount"
                class="absolute -top-2 -right-3 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] leading-4 font-semibold text-white"
              >
                {{ cartCount }}
              </span>
            </span>
            {{ page.label }}
          </RouterLink>
        </li>
      </ul>

      <!-- Where in the categories we are -->
      <div class="flex min-h-12 items-center gap-2 border-b border-gray-200 px-3 py-2">
        <button
          v-if="level"
          type="button"
          class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-blue-700 hover:bg-blue-50"
          :aria-label="`Back to ${parentName}`"
          @click="goBack"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-xs" />
          Back
        </button>
        <h2 class="min-w-0 flex-1 truncate px-1 text-sm font-semibold text-gray-900">
          {{ level ? level.name : 'Shop by category' }}
        </h2>
      </div>

      <!-- The categories of this level -->
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <p v-if="!tree.length" class="px-4 py-6 text-center text-sm text-gray-500">
          Loading categories…
        </p>
        <Transition v-else :name="`slide-${direction}`" mode="out-in">
          <ul :key="levelID ?? 'top'" class="divide-y divide-gray-100">
            <li v-if="level">
              <RouterLink
                :to="categoryLink(level)"
                :class="[
                  rowClass,
                  'font-semibold',
                  level.id === currentID ? 'bg-blue-50 text-blue-900' : '',
                ]"
                @click="close"
              >
                <span class="min-w-0 flex-1">All {{ level.name }}</span>
                <span class="rounded-full bg-blue-100 px-2 text-xs font-normal text-gray-600">
                  {{ level.productCount }}
                </span>
                <span class="w-[9px]"></span>
              </RouterLink>
            </li>
            <li v-for="node in items" :key="node.id">
              <button
                v-if="node.subcategories.length"
                type="button"
                :class="[rowClass, rowState(node), 'cursor-pointer']"
                @click="openLevel(node)"
              >
                <span class="min-w-0 flex-1">{{ node.name }}</span>
                <span class="rounded-full bg-gray-100 px-2 text-xs font-normal text-gray-600">
                  {{ node.productCount }}
                </span>
                <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-xs text-gray-400" />
              </button>
              <RouterLink
                v-else
                :to="categoryLink(node)"
                :class="[rowClass, rowState(node)]"
                :aria-current="node.id === currentID ? 'page' : undefined"
                @click="close"
              >
                <span class="min-w-0 flex-1">{{ node.name }}</span>
                <span class="rounded-full bg-gray-100 px-2 text-xs font-normal text-gray-600">
                  {{ node.productCount }}
                </span>
                <!-- keeps the counts lined up with the rows that have a chevron -->
                <span class="w-[9px]"></span>
              </RouterLink>
            </li>
          </ul>
        </Transition>
      </div>
    </nav>
  </div>
</template>
<style scoped>
/* Changing level: going in slides the new level in from the right, going back from the left */
.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-back-enter-active,
.slide-back-leave-active {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}
.slide-forward-enter-from,
.slide-back-leave-to {
  transform: translateX(24px);
  opacity: 0;
}
.slide-forward-leave-to,
.slide-back-enter-from {
  transform: translateX(-24px);
  opacity: 0;
}
</style>
