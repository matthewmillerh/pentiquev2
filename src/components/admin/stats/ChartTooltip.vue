<script setup>
// The hover / focus readout of a chart. Placed inside the chart's (relatively positioned) box at x, y.
// Rows are [label, value]: the value leads, the label follows.
defineProps({
  tip: Object, // { x, y, title, rows, alignRight }
})
</script>
<template>
  <div
    v-if="tip"
    class="pointer-events-none absolute z-10 w-max max-w-64 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-lg"
    :style="{
      left: `${tip.x}px`,
      top: `${tip.y}px`,
      transform: `translate(${tip.alignRight ? 'calc(-100% - 12px)' : '12px'}, -50%)`,
    }"
    role="status"
  >
    <p class="mb-1 font-semibold text-gray-900">{{ tip.title }}</p>
    <p
      v-for="[label, value] in tip.rows"
      :key="label"
      class="flex items-baseline gap-2 whitespace-nowrap"
    >
      <span class="font-semibold text-gray-900 tabular-nums">{{ value }}</span>
      <span class="text-gray-500">{{ label }}</span>
    </p>
  </div>
</template>
