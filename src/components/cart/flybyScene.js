// The night-time fly-by shown above the cart when there is a car in it: a supercar tears past the camera on a wet
// road, comes back round and settles into a slow tracking shot along a lit highway.
//
// createFlybyScene(canvas, options) builds everything and returns a small controller. The caller owns the canvas and
// must call dispose() when done; the WebGL context is released then.
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const MODEL_URL = '/models/car.glb'
const CAR_LENGTH = 4.8 // metres, an Aventador
const LANE_Z = 1.7 // the lane the car drives in (the road runs along x, the camera is on the +z side)
const CRUISE = 26 // metres per second the world streams past during the tracking shot

// The intro, in seconds after the car has loaded
const T = { flyStart: 0.35, flyEnd: 2.15, settleStart: 2.55, settleEnd: 5.6 }

const NIGHT = new THREE.Color('#060a15')
const WARM = new THREE.Color('#ffc98a')
const PINK = new THREE.Color('#ff7eb8')
const BLUE = new THREE.Color('#79a8ff')

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeOutCubic = (x) => 1 - (1 - x) ** 3
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
const smooth = (x) => x * x * (3 - 2 * x)
// keeps a scrolling object inside a window of `length` metres around `centre`
const wrap = (value, length, centre = 0) =>
  ((((value - centre + length / 2) % length) + length) % length) - length / 2 + centre

// ---- small generated textures

function canvasTexture(width, height, draw, { srgb = true } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d'), width, height)
  const texture = new THREE.CanvasTexture(canvas)
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const glowTexture = () =>
  canvasTexture(128, 128, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2)
    r.addColorStop(0, 'rgba(255,255,255,1)')
    r.addColorStop(0.18, 'rgba(255,255,255,0.55)')
    r.addColorStop(0.5, 'rgba(255,255,255,0.12)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, w)
  })

// fades from opaque at the right edge to clear at the left (trails and streaks)
const fadeTexture = () =>
  canvasTexture(256, 8, (g, w, h) => {
    const l = g.createLinearGradient(0, 0, w, 0)
    l.addColorStop(0, 'rgba(255,255,255,0)')
    l.addColorStop(0.75, 'rgba(255,255,255,0.55)')
    l.addColorStop(1, 'rgba(255,255,255,1)')
    g.fillStyle = l
    g.fillRect(0, 0, w, h)
  })

// soft on every side, brightest near one end (light pools, reflections, the headlight beam)
const poolTexture = () =>
  canvasTexture(128, 128, (g, w) => {
    const r = g.createRadialGradient(w / 2, w * 0.35, 0, w / 2, w * 0.45, w * 0.55)
    r.addColorStop(0, 'rgba(255,255,255,0.9)')
    r.addColorStop(0.45, 'rgba(255,255,255,0.3)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, w)
  })

const asphaltTexture = () => {
  const t = canvasTexture(256, 256, (g, w) => {
    const img = g.createImageData(w, w)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 18 + Math.random() * 22
      img.data[i] = v
      img.data[i + 1] = v + 2
      img.data[i + 2] = v + 6
      img.data[i + 3] = 255
    }
    g.putImageData(img, 0, 0)
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(60, 3)
  return t
}

const windowsTexture = () => {
  const t = canvasTexture(64, 64, (g, w) => {
    g.fillStyle = '#05070d'
    g.fillRect(0, 0, w, w)
    for (let y = 4; y < w; y += 8) {
      for (let x = 3; x < w; x += 7) {
        if (Math.random() < 0.3) {
          g.fillStyle = Math.random() < 0.8 ? '#ffd9a0' : '#9fc0ff'
          g.globalAlpha = 0.35 + Math.random() * 0.65
          g.fillRect(x, y, 3, 4)
        }
      }
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

const skyTexture = () =>
  canvasTexture(8, 256, (g, w, h) => {
    const l = g.createLinearGradient(0, 0, 0, h)
    l.addColorStop(0, '#04060d')
    l.addColorStop(0.55, '#0b1330')
    l.addColorStop(0.8, '#3a2447')
    l.addColorStop(1, '#6b3a52')
    g.fillStyle = l
    g.fillRect(0, 0, w, h)
  })

// A little night city for the paint to reflect: dark all round with warm street light strips above and a pink and a
// blue glow at the sides
function nightEnvironment(renderer) {
  const env = new THREE.Scene()
  env.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(40, 20, 40),
      new THREE.MeshBasicMaterial({ color: '#0a0f1f', side: THREE.BackSide }),
    ),
  )
  const strip = (color, strength, w, h, position) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: color.clone().multiplyScalar(strength),
        side: THREE.DoubleSide,
      }),
    )
    mesh.position.copy(position)
    mesh.lookAt(0, 0, 0)
    env.add(mesh)
  }
  strip(WARM, 6, 30, 1.2, new THREE.Vector3(0, 9, -6))
  strip(WARM, 4, 30, 0.8, new THREE.Vector3(0, 9, 6))
  strip(PINK, 3, 3, 10, new THREE.Vector3(-19, 1, 0))
  strip(BLUE, 3, 3, 10, new THREE.Vector3(19, 1, 0))
  strip(new THREE.Color('#ffffff'), 1.5, 40, 3, new THREE.Vector3(0, -4, -19))
  const pmrem = new THREE.PMREMGenerator(renderer)
  const target = pmrem.fromScene(env, 0.035)
  pmrem.dispose()
  env.traverse((o) => {
    o.geometry?.dispose()
    o.material?.dispose()
  })
  return target
}

// ---- the car

// Clear coat only where the paint is: the bright, saturated parts of the colour texture (black plastics stay satin)
function paintMask(image) {
  const size = 512
  const mask = canvasTexture(
    size,
    size,
    (g) => {
      g.drawImage(image, 0, 0, size, size)
      const img = g.getImageData(0, 0, size, size)
      for (let i = 0; i < img.data.length; i += 4) {
        const r = img.data[i],
          gr = img.data[i + 1],
          b = img.data[i + 2]
        const max = Math.max(r, gr, b),
          min = Math.min(r, gr, b)
        const paint = max > 90 && (max - min) / max > 0.35 ? 255 : 30
        img.data[i] = img.data[i + 1] = img.data[i + 2] = paint
      }
      g.putImageData(img, 0, 0)
    },
    { srgb: false },
  )
  mask.flipY = false // glTF textures are not flipped
  return mask
}

async function loadCar() {
  const gltf = await new GLTFLoader().loadAsync(MODEL_URL)
  const model = gltf.scene

  const wheels = []
  let body = null
  model.traverse((node) => {
    if (!node.isMesh) return
    if (/wheel/i.test(node.name)) wheels.push(node)
    else if (/body/i.test(node.name)) body = node
    else if (/glass/i.test(node.name)) {
      node.material = new THREE.MeshPhysicalMaterial({
        color: '#05070c',
        roughness: 0.04,
        metalness: 0.3,
        transparent: true,
        opacity: 0.9,
        envMapIntensity: 1.6,
      })
    }
  })

  // glossy paint over the original colours (the model came with a fully rough finish)
  const paint = (old) =>
    new THREE.MeshPhysicalMaterial({
      map: old.map,
      roughness: 0.38,
      metalness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      clearcoatMap: old.map?.image ? paintMask(old.map.image) : null,
      envMapIntensity: 1.2,
    })
  const painted = new Map()
  model.traverse((node) => {
    if (!node.isMesh || /glass/i.test(node.name)) return
    if (!painted.has(node.material)) painted.set(node.material, paint(node.material))
    const old = node.material
    node.material = painted.get(old)
  })
  painted.forEach((_, old) => old.dispose())

  // each wheel turns about its own centre
  const wheelBox = new THREE.Box3()
  let groundY = Infinity
  const centre = new THREE.Vector3()
  for (const wheel of wheels) {
    wheel.geometry.computeBoundingBox()
    wheelBox.copy(wheel.geometry.boundingBox)
    const c = wheelBox.getCenter(new THREE.Vector3())
    wheel.geometry.translate(-c.x, -c.y, -c.z)
    wheel.position.add(c)
    centre.add(c)
    groundY = Math.min(groundY, wheelBox.min.y)
  }
  centre.divideScalar(wheels.length || 1)
  const wheelRadius = wheels.length ? (wheelBox.max.y - wheelBox.min.y) / 2 : 1

  // metres, standing on y = 0, centred between the wheels, facing +x
  const size = new THREE.Box3().setFromObject(body || model).getSize(new THREE.Vector3())
  const scale = CAR_LENGTH / Math.max(size.x, size.z)
  model.position.set(-centre.x, -groundY, -centre.z).multiplyScalar(scale)
  model.scale.setScalar(scale)
  const oriented = new THREE.Group()
  oriented.add(model)
  oriented.rotation.y = Math.PI / 2 // the model faces +z

  const bounds = new THREE.Box3().setFromObject(oriented)
  return { car: oriented, wheels, wheelRadius: wheelRadius * scale, bounds }
}

// ---- the scene

export async function createFlybyScene(
  canvas,
  { reducedMotion = false, small = false, onContextLost } = {},
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !small,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const disposables = [] // textures and render targets made here
  const own = (thing) => (disposables.push(thing), thing)

  const scene = new THREE.Scene()
  scene.background = NIGHT
  scene.fog = new THREE.Fog(NIGHT, 28, 150)
  const envTarget = own(nightEnvironment(renderer))
  scene.environment = envTarget.texture

  const camera = new THREE.PerspectiveCamera(38, 2, 0.1, 400)

  scene.add(new THREE.HemisphereLight('#3b4c80', '#05070d', 0.9))
  const moon = new THREE.DirectionalLight('#8fa8ff', 1.4)
  moon.position.set(-12, 14, -18)
  scene.add(moon)
  const fill = new THREE.DirectionalLight('#ffffff', 0.35)
  fill.position.set(10, 6, 14)
  scene.add(fill)
  // follows the street lamp nearest the car, so the paint lights up as it passes under each one
  const lampLight = new THREE.PointLight(WARM, 160, 26, 1.6)
  scene.add(lampLight)

  const glow = own(glowTexture())
  const fade = own(fadeTexture())
  const pool = own(poolTexture())
  const additive = (map, color, opacity) =>
    new THREE.MeshBasicMaterial({
      map,
      color,
      opacity,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    })
  const sprite = (color, size, opacity = 1) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        color,
        opacity,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    s.scale.setScalar(size)
    return s
  }

  // ---- road: see-through, so the upside down car below it reads as a reflection on wet tarmac
  const asphalt = own(asphaltTexture())
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 9),
    new THREE.MeshStandardMaterial({
      color: '#141b29',
      map: asphalt,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.7,
      envMapIntensity: 0.3,
    }),
  )
  road.rotation.x = -Math.PI / 2
  road.renderOrder = 1
  scene.add(road)
  const verge = new THREE.MeshStandardMaterial({ color: '#070a12', roughness: 0.9 })
  for (const [z, depth] of [
    [4.5 + 20, 40],
    [-4.5 - 40, 80],
  ]) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(400, depth), verge)
    plane.rotation.x = -Math.PI / 2
    plane.position.set(0, 0.002, z)
    scene.add(plane)
  }
  const basement = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 12),
    new THREE.MeshBasicMaterial({ color: '#020306' }),
  )
  basement.rotation.x = -Math.PI / 2
  basement.position.y = -2.5
  scene.add(basement)

  const lineMaterial = new THREE.MeshBasicMaterial({
    color: '#c9d2e6',
    transparent: true,
    opacity: 0.55,
  })
  for (const z of [4.1, -4.1]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(400, 0.12), lineMaterial)
    edge.rotation.x = -Math.PI / 2
    edge.position.set(0, 0.006, z)
    edge.renderOrder = 2
    scene.add(edge)
  }

  // things that stream past: { object, base, length, factor, centre }
  const scrollers = []
  const scroll = (object, base, length, factor = 1, centre = 6) =>
    scrollers.push({ object, base, length, factor, centre })

  const dash = new THREE.PlaneGeometry(3, 0.14)
  for (let i = 0; i < 16; i++) {
    const mesh = new THREE.Mesh(dash, lineMaterial)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(0, 0.006, 0)
    mesh.renderOrder = 2
    scene.add(mesh)
    scroll(mesh, i * 9, 16 * 9)
  }

  // street lamps along the far side, each with its pool of light and its wet reflection
  const LAMP_GAP = 26
  const LAMPS = 7
  const poleGeometry = new THREE.CylinderGeometry(0.07, 0.1, 7.2, 8)
  const armGeometry = new THREE.BoxGeometry(0.08, 0.08, 1.7)
  const headGeometry = new THREE.BoxGeometry(0.7, 0.12, 0.3)
  const poleMaterial = new THREE.MeshStandardMaterial({
    color: '#1b2233',
    roughness: 0.6,
    metalness: 0.6,
  })
  const headMaterial = new THREE.MeshBasicMaterial({ color: WARM.clone().multiplyScalar(5) })
  const lamps = []
  for (let i = 0; i < LAMPS; i++) {
    const lamp = new THREE.Group()
    const pole = new THREE.Mesh(poleGeometry, poleMaterial)
    pole.position.set(0, 3.6, -6.3)
    const arm = new THREE.Mesh(armGeometry, poleMaterial)
    arm.position.set(0, 7.15, -5.5)
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.set(0, 7.05, -4.75)
    const halo = sprite(WARM, 4.5, 0.9)
    halo.position.set(0, 6.95, -4.75)
    const lightPool = new THREE.Mesh(new THREE.PlaneGeometry(9, 12), additive(pool, WARM, 0.32))
    lightPool.rotation.x = -Math.PI / 2
    lightPool.position.set(0, 0.01, -2.4)
    lightPool.renderOrder = 3
    const reflection = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 9), additive(pool, WARM, 0.35))
    reflection.rotation.x = -Math.PI / 2
    reflection.position.set(0, 0.012, 1.6)
    reflection.renderOrder = 3
    lamp.add(pole, arm, head, halo, lightPool, reflection)
    scene.add(lamp)
    lamps.push(lamp)
    scroll(lamp, i * LAMP_GAP, LAMPS * LAMP_GAP, 1, 10)
  }

  // city skyline far behind, streaming by slowly
  const windows = own(windowsTexture())
  const buildingMaterial = new THREE.MeshBasicMaterial({ map: windows, color: '#9aa4c4' })
  const SKYLINE = 320
  const buildings = small ? 26 : 44
  for (let i = 0; i < buildings; i++) {
    const w = 6 + Math.random() * 12
    const h = 8 + Math.random() ** 1.6 * 46
    const d = 6 + Math.random() * 8
    const geometry = new THREE.BoxGeometry(w, h, d)
    const uv = geometry.attributes.uv
    for (let j = 0; j < uv.count; j++) uv.setXY(j, uv.getX(j) * (w / 7), uv.getY(j) * (h / 7))
    const building = new THREE.Mesh(geometry, buildingMaterial)
    building.position.set(0, h / 2 - 1, -48 - Math.random() * 40)
    scene.add(building)
    scroll(building, (i / buildings) * SKYLINE + Math.random() * 4, SKYLINE, 0.12, 20)
  }
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(700, 120),
    new THREE.MeshBasicMaterial({ map: own(skyTexture()), fog: false, depthWrite: false }),
  )
  sky.position.set(0, 38, -140)
  scene.add(sky)

  // traffic on the far carriageway and city lights, drawn as long-exposure streaks while we are moving
  const streakGeometry = new THREE.PlaneGeometry(1, 1)
  streakGeometry.translate(-0.5, 0, 0)
  const streaks = []
  const STREAK_SPAN = 180
  const palette = [WARM, WARM, new THREE.Color('#ffffff'), new THREE.Color('#ff4d4d'), PINK, BLUE]
  for (let i = 0; i < (small ? 24 : 46); i++) {
    const color = palette[i % palette.length].clone().multiplyScalar(2.2)
    const mesh = new THREE.Mesh(streakGeometry, additive(fade, color, 0))
    const far = Math.random()
    mesh.position.set(
      0,
      far < 0.6 ? 0.35 + Math.random() * 0.6 : 2 + Math.random() * 7,
      -12 - far * 22,
    )
    mesh.scale.y = 0.05 + Math.random() * 0.06
    mesh.userData.strength = 0.4 + Math.random() * 0.6
    mesh.userData.stretch = 0.25 + Math.random() * 0.4
    scene.add(mesh)
    streaks.push(mesh)
    scroll(mesh, Math.random() * STREAK_SPAN, STREAK_SPAN, 1.35, 0)
  }

  // ---- the car, its reflection and its lights
  const { car, wheels, wheelRadius, bounds } = await loadCar()
  const rig = new THREE.Group()
  const body = new THREE.Group()
  body.add(car)
  const mirror = car.clone()
  mirror.scale.y = -1
  const mirrorWheels = []
  mirror.traverse((node) => node.isMesh && /wheel/i.test(node.name) && mirrorWheels.push(node))
  rig.add(body, mirror)
  scene.add(rig)

  const front = bounds.max.x - 0.25
  const rear = bounds.min.x + 0.2
  const width = (bounds.max.z - bounds.min.z) / 2
  const headlights = []
  for (const side of [-1, 1]) {
    const head = sprite(new THREE.Color('#dfe9ff').multiplyScalar(1.6), 0.3)
    head.position.set(front, 0.55, side * (width - 0.35))
    const tail = sprite(new THREE.Color('#ff2a2a').multiplyScalar(3), 0.45)
    tail.position.set(rear, 0.78, side * (width - 0.3))
    body.add(head, tail)
    headlights.push(head)
    // the same lights seen in the wet road
    const headReflection = sprite(new THREE.Color('#dfe9ff'), 0.9, 0.3)
    headReflection.position.set(front, -0.55, side * (width - 0.35))
    headReflection.scale.set(0.5, 1.6, 1)
    const tailReflection = sprite(new THREE.Color('#ff2a2a'), 0.7, 0.4)
    tailReflection.position.set(rear, -0.78, side * (width - 0.3))
    tailReflection.scale.set(0.4, 1.3, 1)
    rig.add(headReflection, tailReflection)
  }
  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 5.5),
    additive(pool, new THREE.Color('#cfe0ff'), 0.28),
  )
  beam.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)
  beam.position.set(front + 7.5, 0.015, 0)
  beam.renderOrder = 3
  rig.add(beam)
  // tail light trails while the car is moving fast relative to the camera
  const trails = []
  for (const side of [-1, 1]) {
    const trail = new THREE.Mesh(
      streakGeometry,
      additive(fade, new THREE.Color('#ff2a2a').multiplyScalar(2.5), 0),
    )
    trail.position.set(rear, 0.78, side * (width - 0.3))
    trail.scale.y = 0.09
    rig.add(trail)
    trails.push(trail)
  }

  // ---- post processing: the glow on every light
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), small ? 0.7 : 0.85, 0.55, 0.78)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  // ---- camera poses
  const flyPose = {
    position: new THREE.Vector3(2.4, 0.55, 6.6),
    target: new THREE.Vector3(-4, 0.65, LANE_Z),
  }
  const orbitPose = (time) => {
    const angle = 0.55 + 0.4 * Math.sin(time * 0.21)
    const radius = 7.2 + 0.6 * Math.sin(time * 0.17)
    return {
      position: new THREE.Vector3(
        Math.sin(angle) * radius,
        1.25 + 0.25 * Math.sin(time * 0.13),
        LANE_Z + Math.cos(angle) * radius,
      ),
      // looking a little behind the car keeps it on the right, clear of the caption
      target: new THREE.Vector3(-1.6, 0.45, LANE_Z),
    }
  }

  // ---- state
  let width_ = 1
  let height_ = 1
  let time = reducedMotion ? T.settleEnd : 0 // seconds into the show
  let travel = 0 // how far the world has streamed past
  let carX = -200
  let lastCarX = carX
  let wheelAngle = 0
  let running = false
  let visible = true
  let frame = 0
  let last = 0
  let disposed = false

  function place(dt) {
    // where the car is and how fast the world streams by
    let worldSpeed = 0
    const cameraPose = { position: new THREE.Vector3(), target: new THREE.Vector3() }
    if (time < T.settleStart) {
      const f = clamp01((time - T.flyStart) / (T.flyEnd - T.flyStart))
      // fast, a slow-motion moment right in front of the camera, then fast again
      carX =
        time < T.flyStart
          ? -200
          : -78 + 150 * (f + (0.72 * Math.sin(2 * Math.PI * f)) / (2 * Math.PI))
      if (f >= 1) carX = 200
      cameraPose.position.copy(flyPose.position)
      cameraPose.target.copy(flyPose.target)
    } else {
      const g = clamp01((time - T.settleStart) / (T.settleEnd - T.settleStart))
      carX = -40 * (1 - easeOutCubic(g))
      worldSpeed = CRUISE * smooth(clamp01(g * 1.15))
      const orbit = orbitPose(Math.max(0, time - T.settleEnd))
      const k = easeInOutCubic(g)
      cameraPose.position.lerpVectors(flyPose.position, orbit.position, k)
      cameraPose.target.lerpVectors(flyPose.target, orbit.target, k)
    }
    if (reducedMotion) worldSpeed = 0

    const relSpeed = dt > 0 ? Math.abs(carX - lastCarX) / dt : 0
    lastCarX = carX
    travel += worldSpeed * dt

    // the car, a touch of suspension movement at speed, turning wheels
    rig.position.set(carX, 0, LANE_Z)
    const cruising =
      time > T.settleStart ? Math.sin(time * 8.3) * 0.006 + Math.sin(time * 2.1) * 0.004 : 0
    body.position.y = cruising
    mirror.position.y = -cruising
    const groundSpeed = Math.min(relSpeed, 120) + worldSpeed
    wheelAngle += (groundSpeed / wheelRadius) * dt
    for (const wheel of wheels) wheel.rotation.x = wheelAngle
    for (const wheel of mirrorWheels) wheel.rotation.x = wheelAngle

    const onScreenSpeed = Math.min(relSpeed, 140)
    for (const trail of trails) {
      trail.scale.x = Math.min(10, onScreenSpeed * 0.1)
      trail.material.opacity = clamp01(onScreenSpeed / 50) * 0.9
    }

    // scenery
    for (const s of scrollers)
      s.object.position.x = wrap(s.base - travel * s.factor, s.length, s.centre)
    const blur = worldSpeed / CRUISE
    for (const streak of streaks) {
      streak.scale.x = 0.2 + worldSpeed * streak.userData.stretch
      streak.material.opacity = blur * streak.userData.strength
    }
    // the lamp light follows the lamp nearest the car
    let nearest = lamps[0]
    for (const lamp of lamps)
      if (Math.abs(lamp.position.x - carX) < Math.abs(nearest.position.x - carX)) nearest = lamp
    lampLight.position.set(nearest.position.x, 6.6, -3.6)

    // headlights flare when they point at the camera
    const toCamera = cameraPose.position.clone().sub(rig.position).normalize()
    const facing = Math.max(0, toCamera.x)
    for (const head of headlights) head.scale.setScalar(0.3 + facing ** 3 * 0.5)

    // a shake as it roars past
    const pass = time < T.settleStart ? Math.exp(-((carX - flyPose.position.x) ** 2) / 40) : 0
    camera.position.copy(cameraPose.position)
    if (pass > 0.01) {
      camera.position.x += (Math.random() - 0.5) * 0.08 * pass
      camera.position.y += (Math.random() - 0.5) * 0.06 * pass
    }
    camera.lookAt(
      cameraPose.target.x + (time >= T.settleStart ? carX * 0.9 : 0),
      cameraPose.target.y,
      cameraPose.target.z,
    )
    camera.fov = 38 + 5 * pass
    camera.updateProjectionMatrix()
  }

  function render() {
    composer.render()
  }

  function tick(now) {
    if (!running) return
    frame = requestAnimationFrame(tick)
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0
    last = now
    time += dt
    place(dt)
    render()
  }

  function start() {
    if (running || disposed || reducedMotion || !visible) return
    running = true
    last = 0
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    running = false
    cancelAnimationFrame(frame)
  }

  function resize(w, h) {
    width_ = Math.max(1, Math.round(w))
    height_ = Math.max(1, Math.round(h))
    renderer.setSize(width_, height_, false)
    composer.setPixelRatio(renderer.getPixelRatio())
    composer.setSize(width_, height_)
    camera.aspect = width_ / height_
    // keep the car filling the frame on narrow screens
    camera.zoom = camera.aspect < 1.6 ? 0.72 + camera.aspect * 0.17 : 1
    camera.updateProjectionMatrix()
    if (!running) {
      place(0)
      render()
    }
  }

  function setVisible(isVisible) {
    visible = isVisible
    if (isVisible) start()
    else stop()
  }

  // start the fly-by again (e.g. after tapping the banner)
  function replay() {
    if (reducedMotion) return
    time = 0
    travel = 0
    start()
  }

  // freeze on a given moment of the show (for looking at it while working on it)
  function seek(seconds) {
    stop()
    time = seconds - 1 / 60
    place(0)
    time = seconds
    place(1 / 60)
    render()
  }

  const lost = (event) => {
    event.preventDefault()
    stop()
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', lost)

  function dispose() {
    if (disposed) return
    disposed = true
    stop()
    canvas.removeEventListener('webglcontextlost', lost)
    scene.traverse((object) => {
      object.geometry?.dispose()
      const materials = Array.isArray(object.material)
        ? object.material
        : object.material
          ? [object.material]
          : []
      for (const material of materials) {
        for (const value of Object.values(material)) if (value?.isTexture) value.dispose()
        material.dispose()
      }
    })
    disposables.forEach((thing) => thing.dispose())
    composer.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  place(0)
  return { start, stop, resize, setVisible, replay, seek, dispose }
}
