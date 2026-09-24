<script setup>
import { computed, ref } from 'vue'
import ChartTooltip from './ChartTooltip.vue'
import { useChartTooltip } from './useChartTooltip'

// Horizontal bars, one per item, with the value at the tip of each bar.
// items: [{ key, label, value, display, tip: [[label, value]], drill }] - a `drill` item can be clicked.
const props = defineProps({
  items: { type: Array, required: true },
  label: { type: String, required: true }, // what the chart shows, for screen readers
})
const emit = defineEmits(['select'])

const box = ref(null)
const { tip, show, hide } = useChartTooltip(box)

const max = computed(() => Math.max(0, ...props.items.map((item) => item.value)))
// the longest bar leaves room for its value label at the tip, and a tiny value still shows a sliver
const width = (item) =>
  item.value > 0 && max.value > 0
    ? `max(3px, calc((100% - 7rem) * ${item.value / max.value}))`
    : '0px'
</script>
<template>
  <div ref="box" class="relative" @pointerleave="hide">
    <ul class="flex flex-col" :aria-label="label">
      <li v-for="item in items" :key="item.key">
        <component
          :is="item.drill ? 'button' : 'div'"
          :type="item.drill ? 'button' : undefined"
          :tabindex="item.drill ? undefined : 0"
          class="group grid w-full grid-cols-1 items-center gap-x-3 rounded-md px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:grid-cols-[minmax(0,13rem)_1fr]"
          :class="item.drill ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'"
          @pointermove="show($event, item.label, item.tip)"
          @focus="show($event, item.label, item.tip)"
          @blur="hide"
          @click="item.drill && emit('select', item)"
        >
          <span class="text-sm leading-snug [overflow-wrap:anywhere] text-gray-700">
            {{ item.label }}
            <span v-if="item.drill" class="text-gray-400" aria-hidden="true">›</span>
          </span>
          <span class="flex min-w-0 items-center gap-2">
            <!-- a single series: one colour for every bar -->
            <span
              class="block h-4 shrink-0 rounded-r bg-[#2a78d6] transition-[filter] group-hover:brightness-110"
              :style="{ width: width(item) }"
            ></span>
            <span class="shrink-0 text-sm font-medium whitespace-nowrap text-gray-900 tabular-nums">
              {{ item.display }}
            </span>
          </span>
        </component>
      </li>
    </ul>
    <ChartTooltip :tip="tip" />
  </div>
</template>
