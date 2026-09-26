<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createArrivalScene } from './arrivalScene'
import { carShow } from '@/composables/useCarShow'

// A car drives into the menu bar, slides to a stop where the logo is (the logo steps aside and the menu dims while
// it is there), waits, and races off along the bar. The bar is always on screen, so the show is seen however far the
// page has scrolled. Drawn on a see-through canvas over the bar: clicks go straight through to the menu. Plays once,
// then removes itself.
const emit = defineEmits(['done'])

const canvas = ref(null)
let scene = null
let unmounted = false
let follow = 0
let giveBack = 0

const CANVAS_HEIGHT = 240 // px: room for the car and its smoke above the road
const BELOW_ROAD = 60 // px of canvas under the road, for the near corner of a car turned towards the viewer

// the menu bar's logo marks the spot (MainNavMenu.vue)
const spot = () => document.querySelector('[data-car-spot]')
// a little bigger than the logo on wide screens; on phones, where the bar is tighter, about the logo's size
const carPixels = () => {
  const logo = spot()?.getBoundingClientRect()
  const scale = window.innerWidth >= 1024 ? 1.35 : 1.05
  return Math.min(170, Math.max(100, (logo?.width || 100) * scale))
}

// keep the road just above the bottom of the logo, so the car's near corner stays clear of the search box under it
// on phones (the bar can change size, e.g. when the window is resized)
const ROAD_ABOVE_LOGO_BOTTOM = 11
function followSpot() {
  const logo = spot()?.getBoundingClientRect()
  if (logo && canvas.value) {
    canvas.value.style.top = `${Math.round(logo.bottom - ROAD_ABOVE_LOGO_BOTTOM + BELOW_ROAD - CANVAS_HEIGHT)}px`
  }
  follow = requestAnimationFrame(followSpot)
}

// the car stops where the logo is, but never so close to the edge that its tail leaves the screen (the canvas starts
// at the left edge of the window, so its pixels are the window's)
function stopPixel() {
  const logo = spot()?.getBoundingClientRect()
  return Math.max(logo ? logo.left + logo.width / 2 : 80, carPixels() * 0.6 + 8)
}

function layout() {
  scene.resize(window.innerWidth, CANVAS_HEIGHT, carPixels(), BELOW_ROAD)
  scene.setStop(stopPixel())
}

onMounted(async () => {
  try {
    const created = await createArrivalScene(canvas.value, {
      // the logo comes back once the car has pulled clear of it
      onLaunch: () => (giveBack = setTimeout(() => (carShow.active = false), 350)),
      onDone: () => emit('done'),
    })
    if (unmounted) return created.dispose()
    scene = created
    if (import.meta.env.DEV) window.__arrival = created // for looking at single frames while working on it
    layout()
    followSpot()
    carShow.active = true // the logo fades out while the car is on its way in
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
  clearTimeout(giveBack)
  carShow.active = false
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
