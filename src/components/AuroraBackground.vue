<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// Animated page background: two soft ribbons of the Pentique colours drifting across a light background.
// The shader is the aurora from Slate (itself adapted from Vue Bits' Aurora), written for plain WebGL here.
//
// It draws premultiplied alpha over the page's own background colour (index.html). Without WebGL the page keeps a
// still CSS version of the same colours. Visitors who ask for reduced motion get a still frame.

const props = defineProps({
  // Left to right across the page. Yellow and blue are kept apart: mixed directly they turn a muddy green.
  colorStops: { type: Array, default: () => ['#FECB41', '#FAA1C9', '#78A3C9'] },
  strength: { type: Number, default: 0.62 },
  amplitude: { type: Number, default: 1 },
  blend: { type: Number, default: 0.6 },
  speed: { type: Number, default: 0.4 },
})

const canvas = ref(null)

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform float uBlend;
uniform float uStrength;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  return t < 0.5
    ? mix(uColorStops[0], uColorStops[1], t * 2.0)
    : mix(uColorStops[1], uColorStops[2], (t - 0.5) * 2.0);
}

// Interleaved gradient noise: cheap, stable per pixel, good at hiding banding
float dither(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

// A soft horizontal band whose centre line wanders with noise
float ribbon(vec2 uv, float centre, float phase, float thickness) {
  float wave = snoise(vec2(uv.x * 1.3 + uTime * 0.06 + phase, uTime * 0.12 + phase)) * 0.16 * uAmplitude;
  float d = (uv.y - centre - wave) / thickness;
  return exp(-d * d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float width = 0.1 + uBlend * 0.12;

  float glow = ribbon(uv, 0.66, 0.0, width) + 0.7 * ribbon(uv, 0.30, 4.1, width * 0.85);
  // Slow shimmer along the ribbons so they breathe rather than sit as flat bands
  glow *= 0.72 + 0.28 * snoise(vec2(uv.x * 3.0 - uTime * 0.15, uv.y * 1.5 + uTime * 0.04));
  // A faint wash keeps the space between the ribbons from going dead
  glow += 0.04;

  vec3 color = ramp(uv.x + 0.18 * sin(uTime * 0.05) + 0.1 * snoise(vec2(uv.y * 1.2, uTime * 0.03)));
  float alpha = clamp(glow * uStrength, 0.0, 1.0);

  vec3 premultiplied = color * alpha + (dither(gl_FragCoord.xy) - 0.5) * (2.0 / 255.0);
  gl_FragColor = vec4(max(premultiplied, 0.0), alpha);
}
`

// A soft, slow gradient: half resolution and ~30fps look the same as full, at a fraction of the GPU cost
const RENDER_SCALE = 0.5
const FRAME_INTERVAL = 1000 / 30 - 2
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')

// The context belongs to the canvas for the life of this component. The program, buffer and uniform locations
// belong to the context: a lost context wipes them, so they are created again when it is restored.
let gl = null
let resources = null // { program, buffer, uniforms }
let frame = 0
let lastDraw = 0
let resizeObserver = null

const toRgb = (hex) => {
  const value = parseInt(hex.replace('#', ''), 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

function compile(type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(log || 'Shader did not compile')
  }
  return shader
}

// Create the program and the full screen triangle. Cleans up after itself if anything fails.
function createResources() {
  let vertex = null
  let fragment = null
  let program = null
  let buffer = null
  try {
    vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
    fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    program = gl.createProgram()
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Program did not link')
    }
    gl.useProgram(program)

    // One triangle that covers the whole screen
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uniforms = {}
    for (const name of [
      'uTime',
      'uAmplitude',
      'uBlend',
      'uStrength',
      'uColorStops',
      'uResolution',
    ]) {
      uniforms[name] = gl.getUniformLocation(program, name)
    }
    resources = { program, buffer, uniforms }
  } catch (error) {
    if (buffer) gl.deleteBuffer(buffer)
    if (program) gl.deleteProgram(program)
    throw error
  } finally {
    // The linked program keeps what it needs, the shader objects are no longer needed either way
    for (const shader of [vertex, fragment]) {
      if (!shader) continue
      if (program) gl.detachShader(program, shader)
      gl.deleteShader(shader)
    }
  }
}

function releaseResources() {
  // Objects of a lost context are already gone, deleting them would only produce warnings
  if (resources && gl && !gl.isContextLost()) {
    gl.deleteBuffer(resources.buffer)
    gl.deleteProgram(resources.program)
  }
  resources = null
}

const canDraw = () => gl && resources && !gl.isContextLost()

function resize() {
  if (!canDraw()) return
  const width = Math.max(1, Math.round(canvas.value.clientWidth * RENDER_SCALE))
  const height = Math.max(1, Math.round(canvas.value.clientHeight * RENDER_SCALE))
  if (canvas.value.width !== width || canvas.value.height !== height) {
    canvas.value.width = width
    canvas.value.height = height
  }
  gl.viewport(0, 0, width, height)
  // a still background has to be redrawn after a resize, an animated one catches up on its next frame
  if (reducedMotion?.matches) draw(performance.now())
}

function draw(now) {
  if (!canDraw()) return
  const u = resources.uniforms
  // gl_FragCoord is in drawing buffer pixels, which are scaled down
  gl.uniform2f(u.uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.uniform1f(u.uTime, now * 0.001 * props.speed)
  gl.uniform1f(u.uAmplitude, props.amplitude)
  gl.uniform1f(u.uBlend, props.blend)
  gl.uniform1f(u.uStrength, props.strength)
  gl.uniform3fv(u.uColorStops, props.colorStops.flatMap(toRgb))
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  // the first frame fades the canvas in, rather than popping on
  canvas.value?.classList.add('is-drawn')
}

function loop(now) {
  frame = requestAnimationFrame(loop)
  if (now - lastDraw < FRAME_INTERVAL) return
  lastDraw = now
  draw(now)
}

function stop() {
  cancelAnimationFrame(frame)
  frame = 0
}

function start() {
  stop()
  if (!canDraw()) return
  if (reducedMotion?.matches) draw(performance.now())
  else frame = requestAnimationFrame(loop)
}

// While the animation runs, index.html drops the still CSS fallback so the two do not stack
function showAnimatedBackground(show) {
  document.documentElement.classList.toggle('has-webgl-bg', show)
}

// Set everything up on a fresh or restored context and start drawing
function setUp() {
  createResources()
  resize()
  draw(performance.now())
  showAnimatedBackground(true)
  start()
}

// The browser can take the context away (GPU reset, macOS reclaiming memory from a background tab, too many
// contexts). Without preventDefault() it never tries to restore it.
function onContextLost(event) {
  event.preventDefault()
  stop()
  resources = null
  showAnimatedBackground(false)
}

function onContextRestored() {
  try {
    setUp()
  } catch (error) {
    console.warn('Animated background could not be restored:', error)
    releaseResources()
  }
}

onMounted(() => {
  gl = canvas.value.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  })
  if (!gl) return // no WebGL: the still CSS background stays
  gl.disable(gl.BLEND) // one full screen draw, written straight to the canvas

  canvas.value.addEventListener('webglcontextlost', onContextLost)
  canvas.value.addEventListener('webglcontextrestored', onContextRestored)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.value)
  reducedMotion?.addEventListener?.('change', start)

  try {
    setUp()
  } catch (error) {
    console.warn('Animated background not available:', error)
    releaseResources()
  }
})

// By now the canvas is off the page: giving the context back while it was still showing can paint it solid white
// on some GPUs. Giving it back straight away, instead of waiting for garbage collection, matters because browsers
// only allow a handful of contexts (most of all during development, where hot reloading mounts this again and again).
onUnmounted(() => {
  stop()
  resizeObserver?.disconnect()
  reducedMotion?.removeEventListener?.('change', start)
  showAnimatedBackground(false)
  if (!gl) return

  gl.canvas.removeEventListener('webglcontextlost', onContextLost)
  gl.canvas.removeEventListener('webglcontextrestored', onContextRestored)
  releaseResources()
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  gl = null
})
</script>
<template>
  <canvas ref="canvas" class="aurora-background" aria-hidden="true"></canvas>
</template>
<style scoped>
.aurora-background {
  position: fixed;
  inset: 0 0 auto 0;
  width: 100vw;
  height: 100vh;
  height: 100lvh; /* stays put while the address bar on phones slides in and out */
  z-index: -1;
  pointer-events: none;
  display: block;
  opacity: 0;
  transition: opacity 900ms cubic-bezier(0.37, 0, 0.63, 1);
}
/* 0.999 rather than 1: at exactly 1 Safari 26 clips a full screen fixed layer to the space between its bars */
.aurora-background.is-drawn {
  opacity: 0.999;
}
</style>
