<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createArrivalScene } from './arrivalScene'

// A car drives onto the cart page along the heading, stops beside it, and races off again. Drawn on a see-through
// canvas the width of the window, laid over the page level with the heading. It is drawn above everything, the menu
// bar included, so neither the car nor its smoke is ever cut off (clicks go straight through it). Plays once, then removes itself.
const props = defineProps({
  // the heading the car stops beside
  heading: { type: Object, default: null },
})
// placement: 'beside' the title or 'below' it (the page then makes room under the title)
const emit = defineEmits(['done', 'placement'])

const canvas = ref(null)
let scene = null
let unmounted = false
let follow = 0

const CANVAS_HEIGHT = 340 // px: room for the car and its smoke above the road
const BELOW_ROAD = 80 // px of canvas under the road, for the near corner of a car turned towards the viewer
const carPixels = () => Math.min(240, Math.max(130, window.innerWidth * 0.2))

// keep the road just under the heading's text (inside its bottom padding) while the page scrolls
function followHeading() {
  if (props.heading && canvas.value) {
    const bottom = props.heading.getBoundingClientRect().bottom
    canvas.value.style.top = `${Math.round(bottom - 24 + BELOW_ROAD - CANVAS_HEIGHT)}px`
  }
  follow = requestAnimationFrame(followHeading)
}

// The empty space to the right of the heading's text
function spaceBeside() {
  const row = props.heading.getBoundingClientRect()
  const range = document.createRange()
  range.selectNodeContents(props.heading)
  const text = range.getBoundingClientRect()
  return { row, left: text.right, width: row.right - text.right }
}
const fitsBeside = () => !!props.heading && spaceBeside().width > carPixels() * 1.1 + 40

// Where the car should stop: in the middle of the space beside the title when it fits there, otherwise under the
// middle of the title. (The canvas starts at the left edge of the window, so its pixels are the window's.)
function stopPixel() {
  if (!props.heading) return window.innerWidth / 2
  const space = spaceBeside()
  return fitsBeside() ? space.left + space.width / 2 : space.row.left + space.row.width / 2
}

function layout() {
  scene.resize(window.innerWidth, CANVAS_HEIGHT, carPixels(), BELOW_ROAD)
  scene.setStop(stopPixel())
}

onMounted(async () => {
  // decided before the model loads, so the page has made any room it needs by the time the car arrives
  emit('placement', fitsBeside() ? 'beside' : 'below')
  try {
    const created = await createArrivalScene(canvas.value, { onDone: () => emit('done') })
    if (unmounted) return created.dispose()
    scene = created
    if (import.meta.env.DEV) window.__arrival = created // for looking at single frames while working on it
    layout()
    followHeading()
    scene.start()
    window.addEventListener('resize', layout)
  } catch (error) {
    // no WebGL, or the model could not load: the page simply goes without
    console.warn('The car arrival could not start:', error)
    emit('done')
  }
})

onBeforeUnmount(() => {
  unmounted = true
  cancelAnimationFrame(follow)
  window.removeEventListener('resize', layout)
  scene?.dispose()
  scene = null
})
</script>

<template>
  <Teleport to="body">
    <canvas
      ref="canvas"
      class="pointer-events-none fixed left-0 z-[60] w-screen"
      :style="{ height: `${CANVAS_HEIGHT}px`, top: '-9999px' }"
      aria-hidden="true"
    ></canvas>
  </Teleport>
</template>
