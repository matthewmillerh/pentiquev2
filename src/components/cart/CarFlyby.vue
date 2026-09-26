<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { createFlybyScene } from './flybyScene'

// The fly-by banner on the cart page, shown while there is a car in the cart

const box = ref(null)
const canvas = ref(null)
const canvasKey = ref(0) // a new canvas (and WebGL context) after the browser takes the old one away
const ready = ref(false)
const failed = ref(false)
const showCredit = ref(false)

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
const small = window.matchMedia?.('(max-width: 640px), (pointer: coarse)').matches ?? false

let scene = null
let resizeObserver = null
let visibilityObserver = null
let unmounted = false

async function build() {
  ready.value = false
  try {
    const created = await createFlybyScene(canvas.value, {
      reducedMotion,
      small,
      onContextLost: rebuildLater,
    })
    if (unmounted) return created.dispose()
    scene = created
    if (import.meta.env.DEV) window.__flyby = created // for looking at single frames while working on it
    const { width, height } = box.value.getBoundingClientRect()
    scene.resize(width, height)
    scene.start()
    ready.value = true
  } catch (error) {
    // no WebGL, or the model could not load: the cart simply shows without the banner
    console.warn('The car fly-by could not start:', error)
    failed.value = true
  }
}

// The browser can take the WebGL context away (e.g. after the GPU driver restarts). Start over on a fresh canvas.
function rebuildLater() {
  scene?.dispose()
  scene = null
  ready.value = false
  setTimeout(async () => {
    if (unmounted) return
    canvasKey.value++
    await nextTick()
    build()
  }, 500)
}

function closeCredit(event) {
  if (event.key === 'Escape') showCredit.value = false
}

onMounted(() => {
  build()
  resizeObserver = new ResizeObserver(([entry]) =>
    scene?.resize(entry.contentRect.width, entry.contentRect.height),
  )
  resizeObserver.observe(box.value)
  // no drawing while the banner is scrolled out of view
  visibilityObserver = new IntersectionObserver(([entry]) =>
    scene?.setVisible(entry.isIntersecting),
  )
  visibilityObserver.observe(box.value)
  window.addEventListener('keydown', closeCredit)
})

onBeforeUnmount(() => {
  unmounted = true
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  window.removeEventListener('keydown', closeCredit)
  scene?.dispose()
  scene = null
})
</script>

<template>
  <section
    v-if="!failed"
    ref="box"
    class="relative mb-4 h-52 overflow-hidden rounded-2xl border border-white/40 bg-[#060a15] shadow-lg shadow-blue-900/20 sm:h-64 lg:h-80"
    aria-label="A supercar racing past at night"
  >
    <canvas
      :key="canvasKey"
      ref="canvas"
      class="absolute inset-0 h-full w-full transition-opacity duration-700"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      @click="scene?.replay()"
    ></canvas>

    <!-- the model's credit (CC-BY) -->
    <div class="absolute right-2 bottom-2 flex flex-col items-end gap-1 sm:right-3 sm:bottom-3">
      <p
        v-if="showCredit"
        id="flyby-credit"
        class="w-56 rounded-lg bg-black/75 px-3 py-2 text-[11px] leading-snug text-white/85 backdrop-blur"
      >
        "CAR" Model by Ignition Labs
        <a
          href="https://creativecommons.org/licenses/by/3.0/"
          target="_blank"
          rel="noopener noreferrer"
          class="underline"
        >
          [CC-BY]
        </a>
        via
        <a href="https://poly.pizza" target="_blank" rel="noopener noreferrer" class="underline">
          Poly Pizza
        </a>
        . Textures resized for the web.
      </p>
      <button
        type="button"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur transition-colors hover:bg-white/25 hover:text-white"
        :aria-expanded="showCredit"
        aria-controls="flyby-credit"
        aria-label="About the car model"
        @click="showCredit = !showCredit"
      >
        <font-awesome-icon icon="circle-info" class="text-sm" />
      </button>
    </div>
  </section>
</template>
