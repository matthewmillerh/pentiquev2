// The car model shared by the cart's car scenes: loads the Aventador, gives it glossy paint and spinning wheels, and
// sizes it in metres (standing on y = 0, centred between its wheels, facing +x).
//
// Model: "CAR" by Ignition Labs [CC-BY] via Poly Pizza (textures resized), credited on the cart page.
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const MODEL_URL = '/models/car.glb'
export const CAR_LENGTH = 4.8 // metres, an Aventador

export function canvasTexture(width, height, draw, { srgb = true } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d'), width, height)
  const texture = new THREE.CanvasTexture(canvas)
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace
  return texture
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

export async function loadCar() {
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
