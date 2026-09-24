<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { axios_api } from '@/scripts/global'
import BarChart from '@/components/admin/stats/BarChart.vue'
import ColumnChart from '@/components/admin/stats/ColumnChart.vue'
import CategoryStatsTable from '@/components/admin/stats/CategoryStatsTable.vue'
import TopProducts from '@/components/admin/stats/TopProducts.vue'
import AttentionList from '@/components/admin/stats/AttentionList.vue'
import {
  MEASURES,
  count,
  money,
  moneyRound,
  percent,
  priceBandLabel,
  stockLevelLabel,
} from '@/components/admin/stats/statsFormat'

// Figures about the whole catalogue: what the stock is worth, how prices and stock are spread,
// which categories hold the most and what needs tidying up
const stats = ref(null)
const isLoading = ref(false)
const error = ref('')

async function load() {
  isLoading.value = true
  error.value = ''
  try {
    const response = await axios_api.get('/admin/stats')
    stats.value = response.data
  } catch (err) {
    console.error('Error loading the stats:', err)
    error.value = err.response?.data?.message || 'The stats could not be loaded. Please try again.'
  } finally {
    isLoading.value = false
  }
}
onMounted(load)

const totals = computed(() => stats.value?.totals)
const updatedAt = computed(() =>
  stats.value
    ? new Date(stats.value.generatedAt).toLocaleString('en-ZA', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '',
)

const tiles = computed(() => {
  const t = totals.value
  if (!t) return []
  return [
    {
      label: 'Products',
      value: count(t.products),
      note: `${count(t.shown)} shown · ${count(t.hidden)} hidden`,
    },
    {
      label: 'Units in stock',
      value: count(t.units),
      note: `${money(t.averageUnitValue)} per unit on average`,
    },
    {
      label: 'Average price',
      value: money(t.averagePrice),
      note: `Median ${money(t.medianPrice)} · ${moneyRound(t.minPrice)} to ${moneyRound(t.maxPrice)}`,
    },
    {
      label: 'On special',
      value: count(t.onSpecial),
      note:
        t.specialDiscount > 0
          ? `${money(t.specialDiscount)} off the stock's full price`
          : 'No stock is discounted',
    },
    { label: 'Featured', value: count(t.featured), note: 'On the home page' },
    {
      label: 'Categories',
      value: count(t.categories),
      note: `${count(t.emptyCategories)} without products`,
    },
  ]
})

// ---- the measure every chart shows
const measureKey = ref('value')
const measure = computed(() => MEASURES.find((m) => m.key === measureKey.value))

const figureRows = (item) => [
  ['stock value', money(item.value)],
  ['products', count(item.products)],
  ['units in stock', count(item.units)],
]

// ---- categories chart, which can be drilled into
const MAX_BARS = 12
const drillPath = ref([]) // the categories opened, from the top level down

const drillNode = computed(() => drillPath.value.at(-1) || null)
const chartCategories = computed(() => {
  if (!stats.value) return []
  // follow the path through the fresh figures, so a refresh keeps the place
  let nodes = stats.value.categories
  for (const step of drillPath.value) {
    const found = nodes.find((node) => node.id === step.id)
    if (!found) return []
    nodes = found.subcategories
  }
  return nodes
})

// the categories that have some of the measure, biggest first
const rankedCategories = computed(() => {
  const key = measureKey.value
  return chartCategories.value
    .filter((node) => node[key] > 0)
    .sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name))
})
// the longest bars first; the rest come out with "Show all" (they are not lumped into one bar, which would
// dwarf the others and squash the scale)
const showAllCategories = ref(false)
const moreCategories = computed(() => Math.max(0, rankedCategories.value.length - MAX_BARS))
const categoryBars = computed(() =>
  (showAllCategories.value
    ? rankedCategories.value
    : rankedCategories.value.slice(0, MAX_BARS)
  ).map((node) => ({
    key: node.id,
    label: node.name,
    value: node[measureKey.value],
    display: measure.value.format(node[measureKey.value]),
    tip: [
      ...figureRows(node),
      ['in stock', `${count(node.inStock)} of ${count(node.products)} products`],
    ],
    drill: node.subcategories.some((sub) => sub.products > 0),
    node,
  })),
)
const hiddenCategories = computed(
  () => chartCategories.value.filter((node) => !(node[measureKey.value] > 0)).length,
)
// products that sit in the opened category itself rather than in one of its subcategories
const directProducts = computed(() => {
  if (!drillNode.value) return 0
  const node = findNode(drillNode.value.id)
  return node ? node.directProducts : 0
})

function findNode(id, nodes = stats.value?.categories || []) {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(id, node.subcategories)
    if (found) return found
  }
  return null
}

const drillInto = (bar) =>
  bar.node && (drillPath.value = [...drillPath.value, { id: bar.node.id, name: bar.node.name }])
const drillTo = (depth) => (drillPath.value = drillPath.value.slice(0, depth))
// a new level starts with only its longest bars
watch(drillPath, () => (showAllCategories.value = false))

// ---- spreads
const priceColumns = computed(() =>
  (stats.value?.priceBands || []).map((band) => ({
    key: band.min,
    label: priceBandLabel(band),
    value: band[measureKey.value],
    display: measure.value.format(band[measureKey.value]),
    short: measure.value.short(band[measureKey.value]),
    tip: figureRows(band),
  })),
)
const stockColumns = computed(() =>
  (stats.value?.stockLevels || []).map((level) => ({
    key: level.min,
    label: stockLevelLabel(level),
    value: level[measureKey.value],
    display: measure.value.format(level[measureKey.value]),
    short: measure.value.short(level[measureKey.value]),
    tip: figureRows(level),
  })),
)

const attentionCount = computed(() =>
  stats.value ? Object.values(stats.value.attention).filter((check) => check.count > 0).length : 0,
)

const card = 'overflow-hidden rounded-xl border border-blue-300 bg-white/95 shadow'
const cardTitle = 'text-base font-semibold text-gray-900'
</script>

<template>
  <div class="mx-auto mb-8 flex w-[95%] max-w-6xl flex-col gap-5">
    <!-- header -->
    <div :class="card" class="flex flex-wrap items-center gap-3 px-5 py-4">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Stats</h1>
        <p class="text-sm text-gray-500">
          <template v-if="stats">The product catalogue as of {{ updatedAt }}</template>
          <template v-else>Figures about the product catalogue</template>
        </p>
      </div>
      <button
        type="button"
        class="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
        :disabled="isLoading"
        @click="load"
      >
        <font-awesome-icon icon="rotate-right" :class="isLoading ? 'animate-spin' : ''" />
        Refresh
      </button>
    </div>

    <p v-if="error" :class="card" class="px-5 py-4 text-sm text-red-700" role="alert">
      {{ error }}
    </p>
    <p
      v-if="!stats && isLoading"
      :class="card"
      class="px-5 py-10 text-center text-sm text-gray-500"
    >
      Working out the stats…
    </p>

    <!-- a refresh keeps the figures on screen, dimmed, until the new ones arrive -->
    <div
      v-if="stats"
      class="flex flex-col gap-5 transition-opacity"
      :class="isLoading ? 'pointer-events-none opacity-60' : ''"
    >
      <!-- headline figures -->
      <section
        class="grid gap-px overflow-hidden rounded-xl border border-blue-300 bg-gray-200 shadow lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]"
      >
        <div class="flex flex-col justify-center gap-4 bg-white px-6 py-6">
          <div>
            <h2 class="text-sm text-gray-500">Stock value</h2>
            <p class="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              {{ money(totals.sellingValue) }}
            </p>
            <p class="mt-1 text-sm text-gray-500">
              {{ count(totals.units) }} units at today's prices
              <template v-if="totals.specialDiscount > 0">
                · {{ money(totals.listValue) }} at full price
              </template>
            </p>
          </div>
          <div>
            <div class="mb-1 flex items-baseline justify-between text-sm">
              <span class="text-gray-700">
                <span class="font-semibold text-gray-900">{{ count(totals.inStock) }}</span>
                of {{ count(totals.products) }} products in stock
              </span>
              <span class="font-semibold text-gray-900">
                {{ percent(totals.inStock, totals.products) }}
              </span>
            </div>
            <!-- meter: the track is a light step of the fill's own blue -->
            <div
              class="h-2.5 overflow-hidden rounded-full bg-[#cde2fb]"
              role="meter"
              aria-label="Products in stock"
              :aria-valuenow="totals.inStock"
              aria-valuemin="0"
              :aria-valuemax="totals.products"
            >
              <div
                class="h-full rounded-full bg-[#2a78d6]"
                :style="{ width: percent(totals.inStock, totals.products) }"
              ></div>
            </div>
            <p class="mt-1 text-xs text-gray-500">{{ count(totals.outOfStock) }} out of stock</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-px sm:grid-cols-3">
          <div v-for="tile in tiles" :key="tile.label" class="bg-white px-5 py-4">
            <h3 class="text-sm text-gray-500">{{ tile.label }}</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ tile.value }}</p>
            <p class="text-xs leading-snug text-gray-500">{{ tile.note }}</p>
          </div>
        </div>
      </section>

      <!-- the measure the charts show -->
      <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Charts show">
        <span class="text-sm font-medium text-gray-700">Charts show</span>
        <button
          v-for="m in MEASURES"
          :key="m.key"
          type="button"
          role="radio"
          :aria-checked="measureKey === m.key"
          class="cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors"
          :class="
            measureKey === m.key
              ? 'border-blue-600 bg-blue-600 font-semibold text-white shadow-sm'
              : 'border-gray-300 bg-white/90 text-gray-700 hover:bg-white'
          "
          @click="measureKey = m.key"
        >
          {{ m.label }}
        </button>
      </div>

      <!-- by category -->
      <section :class="card">
        <div class="border-b border-gray-200 px-5 py-4">
          <h2 :class="cardTitle">{{ measure.label }} by category</h2>
          <nav class="mt-1 flex flex-wrap items-center gap-1 text-sm" aria-label="Category level">
            <button
              type="button"
              class="cursor-pointer text-blue-700 hover:underline disabled:cursor-default disabled:text-gray-500 disabled:no-underline"
              :disabled="!drillPath.length"
              @click="drillTo(0)"
            >
              All categories
            </button>
            <template v-for="(step, i) in drillPath" :key="step.id">
              <span class="text-gray-400" aria-hidden="true">›</span>
              <button
                type="button"
                class="cursor-pointer text-blue-700 hover:underline disabled:cursor-default disabled:text-gray-900 disabled:no-underline"
                :disabled="i === drillPath.length - 1"
                @click="drillTo(i + 1)"
              >
                {{ step.name }}
              </button>
            </template>
          </nav>
        </div>
        <div class="px-3 py-3">
          <BarChart
            v-if="categoryBars.length"
            :items="categoryBars"
            :label="`${measure.label} by category`"
            @select="drillInto"
          />
          <p v-else class="px-2 py-6 text-center text-sm text-gray-500">Nothing to show here.</p>
          <button
            v-if="moreCategories"
            type="button"
            class="mx-2 mt-1 cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-50"
            :aria-expanded="showAllCategories"
            @click="showAllCategories = !showAllCategories"
          >
            {{
              showAllCategories
                ? `Show the top ${MAX_BARS} only`
                : `Show all ${count(rankedCategories.length)} categories`
            }}
          </button>
          <p class="px-2 pt-2 text-xs text-gray-500">
            <template v-if="categoryBars.some((bar) => bar.drill)">
              Click a category with › to see inside it.
            </template>
            <template v-if="directProducts">
              {{ count(directProducts) }} product{{
                directProducts === 1 ? ' sits' : 's sit'
              }}
              directly in {{ drillNode.name }}, not in a subcategory.
            </template>
            <template v-if="hiddenCategories">
              {{ count(hiddenCategories) }}
              {{ hiddenCategories === 1 ? 'category has' : 'categories have' }} none and
              {{ hiddenCategories === 1 ? 'is' : 'are' }} left out.
            </template>
          </p>
        </div>
      </section>

      <!-- spreads -->
      <div class="grid gap-5 lg:grid-cols-2">
        <section :class="card">
          <div class="border-b border-gray-200 px-5 py-4">
            <h2 :class="cardTitle">{{ measure.label }} by price</h2>
            <p class="text-sm text-gray-500">Products grouped by their normal price</p>
          </div>
          <div class="px-5 pt-5 pb-4">
            <ColumnChart :items="priceColumns" :label="`${measure.label} by price`" />
          </div>
        </section>
        <section :class="card">
          <div class="border-b border-gray-200 px-5 py-4">
            <h2 :class="cardTitle">{{ measure.label }} by stock level</h2>
            <p class="text-sm text-gray-500">Products grouped by how many units are in stock</p>
          </div>
          <div class="px-5 pt-5 pb-4">
            <ColumnChart :items="stockColumns" :label="`${measure.label} by stock level`" />
          </div>
        </section>
      </div>

      <!-- every category, as a table -->
      <section :class="card">
        <div class="px-5 pt-4 pb-2">
          <h2 :class="cardTitle">All categories</h2>
          <p class="text-sm text-gray-500">Each category counts everything beneath it</p>
        </div>
        <CategoryStatsTable :categories="stats.categories" :total-value="totals.sellingValue" />
      </section>

      <div class="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section :class="card">
          <div class="px-5 pt-4 pb-3">
            <h2 :class="cardTitle">Top products</h2>
          </div>
          <TopProducts :top="stats.top" />
        </section>

        <section :class="card">
          <div class="border-b border-gray-200 px-5 py-4">
            <h2 :class="cardTitle">Needs attention</h2>
            <p class="text-sm text-gray-500">
              {{
                attentionCount
                  ? `${attentionCount} check${attentionCount === 1 ? '' : 's'} found something`
                  : 'Everything looks tidy'
              }}
            </p>
          </div>
          <AttentionList :attention="stats.attention" />
        </section>
      </div>
    </div>
  </div>
</template>
