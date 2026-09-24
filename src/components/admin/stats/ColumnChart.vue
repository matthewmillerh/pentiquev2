<script setup>
import { computed, ref } from 'vue'
import ChartTooltip from './ChartTooltip.vue'
import { useChartTooltip } from './useChartTooltip'

// Columns over ordered groups (price bands, stock levels) with the value on each cap.
// items: [{ key, label, value, display, short, tip: [[label, value]] }] - `short` is the value label on small screens
const props = defineProps({
  items: { type: Array, required: true },
  label: { type: String, required: true }, // what the chart shows, for screen readers
})

const box = ref(null)
const { tip, show, hide } = useChartTooltip(box)

const max = computed(() => Math.max(0, ...props.items.map((item) => item.value)))
// the tallest column leaves room for its value label on top
const height = (item) =>
  item.value > 0 && max.value > 0
    ? `max(3px, calc((100% - 1.75rem) * ${item.value / max.value}))`
    : '0px'
</script>
<template>
  <div ref="box" class="relative" @pointerleave="hide">
    <ul class="flex h-52 items-stretch gap-1 border-b border-[#c3c2b7]" :aria-label="label">
      <li
        v-for="item in items"
        :key="item.key"
        tabindex="0"
        class="group flex min-w-0 flex-1 flex-col items-center justify-end rounded-t-md outline-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500"
        :aria-label="`${item.label}: ${item.display}`"
        @pointermove="show($event, item.label, item.tip)"
        @focus="show($event, item.label, item.tip)"
        @blur="hide"
      >
        <span class="mb-1 text-xs font-medium whitespace-nowrap text-gray-900 tabular-nums">
          <span :class="item.short ? 'hidden sm:inline' : ''">{{ item.display }}</span>
          <span v-if="item.short" class="sm:hidden">{{ item.short }}</span>
        </span>
        <span
          class="block w-6 rounded-t bg-[#2a78d6] transition-[filter] group-hover:brightness-110"
          :style="{ height: height(item) }"
        ></span>
      </li>
    </ul>
    <div class="flex gap-1 pt-2" aria-hidden="true">
      <span
        v-for="item in items"
        :key="item.key"
        class="min-w-0 flex-1 text-center text-xs leading-tight text-gray-500"
      >
        {{ item.label }}
      </span>
    </div>
    <ChartTooltip :tip="tip" />
  </div>
</template>
