<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createArrivalScene } from './arrivalScene'

// A car drives onto the cart page along the heading, stops beside it, and races off again. Drawn on a see-through
// canvas the width of the window, laid over the page level with the heading (clicks go straight through, the menu bar
// stays on top). Plays once, then removes itself.
const props = defineProps({
  // the heading the car stops beside
  heading: { type: Object, default: null },
})
const emit = defineEmits(['done'])

const canvas = ref(null)
let scene = null
let unmounted = false
let follow = 0

const CANVAS_HEIGHT = 170 // px; the road is 20px above its bottom
const carPixels = () => Math.min(240, Math.max(130, window.innerWidth * 0.2))

// keep the road just under the heading's text (inside its bottom padding) while the page scrolls
function followHeading() {
  if (props.heading && canvas.value) {
    const bottom = props.heading.getBoundingClientRect().bottom
    canvas.value.style.top = `${Math.round(bottom - 24 + 20 - CANVAS_HEIGHT)}px`
  }
  follow = requestAnimationFrame(followHeading)
}

// Where the car should stop: in the middle of the empty space to the right of the heading's text, when a car fits
// there, otherwise in the middle (the cart page leaves room under the title for that on narrow screens)
// (the canvas starts at the left edge of the window, so its pixels are the window's)
function stopPixel() {
  if (!props.heading) return window.innerWidth / 2
  const row = props.heading.getBoundingClientRect()
  const range = document.createRange()
  range.selectNodeContents(props.heading)
  const text = range.getBoundingClientRect()
  const space = row.right - text.right
  return space > carPixels() * 1.1 + 40 ? text.right + space / 2 : row.left + row.width / 2
}

function layout() {
  scene.resize(window.innerWidth, CANVAS_HEIGHT, carPixels())
  scene.setStop(stopPixel())
}

onMounted(async () => {
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
      class="pointer-events-none fixed left-0 z-30 w-screen"
      :style="{ height: `${CANVAS_HEIGHT}px`, top: '-9999px' }"
      aria-hidden="true"
    ></canvas>
  </Teleport>
</template>
