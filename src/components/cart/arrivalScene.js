// The car's arrival on the cart page: drawn on a see-through canvas over the page itself, the car drives in from the
// left, brakes into a slide (tail out, nose down, tyre smoke), comes to rest at an angle, waits two seconds, then
// launches off the right-hand side. It plays once: `onLaunch` is called as it pulls away, `onDone` when the car has
// gone and the smoke has cleared.
//
// The camera is orthographic and only tilted, so a point on the road maps straight to a pixel across the canvas:
// the page can say where the car should stop in pixels.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { CAR_LENGTH, canvasTexture, loadCar } from './carModel'

// seconds
const ARRIVE = 1.45 // from off screen to standing still
const LAUNCH = ARRIVE + 2.4 // when it leaves: two seconds of standing after the slide has settled
const ACCELERATION = 34 // metres per second², leaving
const YAW_PEAK = -0.62 // the tail swings out this far (radians; negative turns the nose towards the viewer)
const YAW_REST = -0.46 // and the car comes to rest at this angle, showing its front three quarters
const TILT = 0.3 // how far the camera looks down on the road (radians)

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (x) => x * x * (3 - 2 * x)
const easeOutQuart = (x) => 1 - (1 - x) ** 4
const phase = (t, from, to) => clamp01((t - from) / (to - from))

const softTexture = () =>
  canvasTexture(64, 64, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2)
    r.addColorStop(0, 'rgba(255,255,255,1)')
    r.addColorStop(0.5, 'rgba(255,255,255,0.45)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, w)
  })

export async function createArrivalScene(canvas, { onLaunch, onDone } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envTarget = pmrem.fromScene(room, 0.04)
  room.traverse((o) => {
    o.geometry?.dispose()
    o.material?.dispose()
  })
  pmrem.dispose()
  scene.environment = envTarget.texture
  scene.environmentIntensity = 0.55
  scene.add(new THREE.HemisphereLight('#ffffff', '#8a86a0', 0.45))
  const sun = new THREE.DirectionalLight('#ffffff', 1.4)
  sun.position.set(-4, 10, 7)
  scene.add(sun)

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  camera.position.set(0, Math.sin(TILT) * 30, Math.cos(TILT) * 30)
  camera.lookAt(0, 0, 0)

  // ---- the car: rig (where it is, which way it points) > body (nose dip, lean) > model
  const { car, wheels, wheelRadius } = await loadCar()
  const rig = new THREE.Group()
  const body = new THREE.Group()
  body.add(car)
  rig.add(body)
  scene.add(rig)

  // where the rear tyres touch the road, for the smoke
  car.updateMatrixWorld(true)
  const wheelSpots = wheels.map((wheel) => wheel.getWorldPosition(new THREE.Vector3()))
  const rearX = Math.min(...wheelSpots.map((p) => p.x))
  const rearTyres = wheelSpots
    .filter((p) => p.x < rearX + 0.3)
    .map((p) => new THREE.Vector3(p.x, 0.12, p.z))

  // a soft shadow keeps it on the page
  const soft = softTexture()
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(CAR_LENGTH * 1.15, 2.6),
    new THREE.MeshBasicMaterial({
      map: soft,
      color: '#1e1b2e',
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.01
  rig.add(shadow)

  // ---- tyre smoke
  const puffs = []
  for (let i = 0; i < 90; i++) {
    const puff = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: soft,
        color: '#9a9eab',
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    )
    puff.visible = false
    puff.userData = { age: 0, life: 1, velocity: new THREE.Vector3(), size: 1 }
    scene.add(puff)
    puffs.push(puff)
  }
  let nextPuff = 0
  let smokeDebt = 0
  const spot = new THREE.Vector3()
  function emitSmoke(rate, dt, drift) {
    smokeDebt += rate * dt
    while (smokeDebt >= 1) {
      smokeDebt -= 1
      for (const tyre of rearTyres) {
        const puff = puffs[nextPuff++ % puffs.length]
        spot.copy(tyre).applyMatrix4(rig.matrixWorld)
        puff.position.copy(spot)
        const d = puff.userData
        d.age = 0
        d.life = 0.9 + Math.random() * 0.8
        d.size = 0.6 + Math.random() * 0.5
        // tyre smoke rolls out along the road rather than rising
        d.velocity.set(
          drift + (Math.random() - 0.5) * 1.4,
          0.15 + Math.random() * 0.3,
          (Math.random() - 0.2) * 1.4,
        )
        puff.visible = true
      }
    }
  }
  function updateSmoke(dt) {
    let alive = 0
    for (const puff of puffs) {
      if (!puff.visible) continue
      const d = puff.userData
      d.age += dt
      const k = d.age / d.life
      if (k >= 1) {
        puff.visible = false
        continue
      }
      alive++
      d.velocity.multiplyScalar(1 - 1.8 * dt)
      puff.position.addScaledVector(d.velocity, dt)
      puff.scale.setScalar(d.size * (1 + k * 2))
      puff.material.opacity = 0.55 * Math.min(1, k * 8) * (1 - k) ** 1.4
    }
    return alive
  }

  // ---- layout: pixels across the canvas <-> metres along the road
  let width = 1
  let height = 1
  let metresPerPixel = 1
  let stopX = 0 // metres
  let stopPixel = null // where the page wants the car to stop, in pixels from the left of the canvas

  // carPixels: how long the car should be on screen
  // ground: pixels from the bottom of the canvas to the road
  function resize(w, h, carPixels = 180, ground = 80) {
    width = Math.max(1, Math.round(w))
    height = Math.max(1, Math.round(h))
    renderer.setSize(width, height, false)
    metresPerPixel = CAR_LENGTH / carPixels
    // the road is `ground` pixels above the bottom of the canvas: a car turned towards the viewer reaches below it
    const road = height - ground
    camera.left = (-width / 2) * metresPerPixel
    camera.right = (width / 2) * metresPerPixel
    camera.top = road * metresPerPixel
    camera.bottom = -ground * metresPerPixel
    camera.updateProjectionMatrix()
    stopX = ((stopPixel ?? width / 2) - width / 2) * metresPerPixel
  }

  function setStop(pixel) {
    stopPixel = pixel
    stopX = (pixel - width / 2) * metresPerPixel
  }

  // ---- the show
  let time = 0
  let wheelAngle = 0
  let lastX = null
  let frame = 0
  let running = false
  let finished = false
  let disposed = false

  function place(dt) {
    const halfWidth = (width / 2) * metresPerPixel
    const startX = -halfWidth - CAR_LENGTH * 0.8
    let x, yaw, z, pitch, lean, lift

    if (time < ARRIVE) {
      // arriving fast, braking hard, the tail stepping out over the last half
      const u = time / ARRIVE
      x = startX + (stopX - startX) * easeOutQuart(u)
      const slide = smooth(phase(u, 0.42, 1))
      yaw = YAW_PEAK * slide
      z = 0.45 * slide
      pitch = -0.05 * smooth(phase(u, 0.3, 0.75))
      lean = 0.035 * Math.sin(Math.PI * phase(u, 0.42, 1))
      lift = 0
    } else if (time < LAUNCH) {
      // standing: the body rocks back on its springs, the tail settles, the engine idles
      const s = time - ARRIVE
      x = stopX
      yaw = YAW_REST + (YAW_PEAK - YAW_REST) * Math.exp(-5 * s) * Math.cos(7 * s)
      z = 0.45
      pitch = -0.05 * Math.exp(-6 * s) * Math.cos(12 * s)
      lean = 0
      lift = 0.0015 * Math.sin(time * 70)
    } else {
      // gone: a squat as the power goes down, straightening up while it pulls away
      const s = time - LAUNCH
      x = stopX + 0.5 * ACCELERATION * s * s
      const straighten = smooth(phase(s, 0, 0.55))
      yaw = YAW_REST * (1 - straighten) + 0.05 * Math.sin(Math.PI * phase(s, 0.1, 0.5))
      z = 0.45 * (1 - straighten)
      pitch = 0.05 * smooth(phase(s, 0, 0.12)) * Math.exp(-3 * s)
      lean = 0
      lift = 0
    }

    const speed = lastX === null || dt === 0 ? 0 : (x - lastX) / dt
    lastX = x
    rig.position.set(x, 0, z)
    rig.rotation.y = yaw
    body.rotation.set(lean, 0, pitch)
    body.position.y = lift
    rig.updateMatrixWorld(true)

    // wheels: rolling with the car, spinning up when it launches, locked while it slides
    const sliding = time > ARRIVE * 0.42 && time < ARRIVE
    const spinning = time > LAUNCH && time < LAUNCH + 0.5
    const roll = sliding ? speed * 0.25 : spinning ? speed + 40 : speed
    wheelAngle += (roll / wheelRadius) * dt
    for (const wheel of wheels) wheel.rotation.x = wheelAngle

    if (sliding) emitSmoke(26, dt, -speed * 0.06)
    if (spinning) emitSmoke(40, dt, -3)
    const smoke = updateSmoke(dt)

    // done once the car is off the page and the smoke has gone
    const gone = time > LAUNCH && x - CAR_LENGTH > halfWidth
    rig.visible = !gone
    return gone && smoke === 0
  }

  function tick(now) {
    if (!running) return
    frame = requestAnimationFrame(tick)
    const dt = tick.last ? Math.min((now - tick.last) / 1000, 1 / 20) : 0
    tick.last = now
    const before = time
    time += dt
    if (before < LAUNCH && time >= LAUNCH) onLaunch?.()
    const done = place(dt)
    renderer.render(scene, camera)
    if (done && !finished) {
      finished = true
      stop()
      onDone?.()
    }
  }

  function start() {
    if (running || disposed || finished) return
    running = true
    tick.last = 0
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    running = false
    cancelAnimationFrame(frame)
  }

  function dispose() {
    if (disposed) return
    disposed = true
    stop()
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
    soft.dispose()
    envTarget.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  // freeze on a given moment (for looking at it while working on it)
  function seek(seconds) {
    stop()
    time = seconds - 1 / 60
    lastX = null
    place(0)
    time = seconds
    place(1 / 60)
    renderer.render(scene, camera)
  }

  return { start, stop, resize, setStop, seek, dispose }
}
