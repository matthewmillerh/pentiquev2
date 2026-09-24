import { ref } from 'vue'

// Shows a ChartTooltip next to the pointer, or next to the mark when it got keyboard focus
export function useChartTooltip(boxRef) {
  const tip = ref(null)

  function show(event, title, rows) {
    const box = boxRef.value?.getBoundingClientRect()
    if (!box) return
    let x, y
    if (event.type.startsWith('pointer') || event.type.startsWith('mouse')) {
      x = event.clientX - box.left
      y = event.clientY - box.top
    } else {
      const mark = event.currentTarget.getBoundingClientRect()
      x = mark.left + mark.width / 2 - box.left
      y = mark.top + mark.height / 2 - box.top
    }
    // past the middle the readout opens to the left, so it never runs off the card
    tip.value = { x, y, title, rows, alignRight: x > box.width / 2 }
  }

  const hide = () => (tip.value = null)

  return { tip, show, hide }
}
