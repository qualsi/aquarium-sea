import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  Vector3,
} from '../lib/three'
import { ImprovedNoise } from '../lib/three/examples/jsm/math/ImprovedNoise.js'
import { MAP_DEPTH, MAP_SIZE, MAX_TERRAIN_HEIGHT } from './config'

const factor = 5
const theoreticalSize = MAP_SIZE / factor

const data = generateHeight(theoreticalSize, theoreticalSize)

const geometry = new PlaneGeometry(
  MAP_SIZE,
  MAP_SIZE,
  theoreticalSize - 1,
  theoreticalSize - 1
)
geometry.rotateX(-Math.PI / 2)

const vertices = geometry.attributes.position.array

for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
  vertices[j + 1] = data[i] - MAP_DEPTH
}

const texture = new CanvasTexture(
  generateTexture(data, theoreticalSize, theoreticalSize)
)
texture.wrapS = ClampToEdgeWrapping
texture.wrapT = ClampToEdgeWrapping

const mesh = new Mesh(geometry, new MeshLambertMaterial({ map: texture }))
mesh.geometry.computeVertexNormals()
// mesh.castShadow = true
mesh.receiveShadow = true

let random = Math.random

function generateHeight(width, height) {
  let seed = Math.random() * 100
  random = function () {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const size = width * height,
    data = new Uint8Array(size)
  const perlin = new ImprovedNoise(),
    z = random() * 100

  let quality = 1

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width,
        y = ~~(i / width)
      data[i] += Math.abs(
        perlin.noise(x / quality, y / quality, z) *
          quality *
          (MAX_TERRAIN_HEIGHT / 100)
      )
    }

    quality *= 5
  }

  return data
}

function generateTexture(data, width, height) {
  const vector3 = new Vector3(0, 0, 0)

  const sun = new Vector3(1, 1, 1)
  sun.normalize()

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  let ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  let image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let imageData = image.data

  let shade
  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2]
    vector3.y = 2
    vector3.z = data[j - width * 2] - data[j + width * 2]
    vector3.normalize()

    shade = vector3.dot(sun)

    imageData[i] = (48 + shade * 96) * (0.5 + data[j] * 0.005)
    imageData[i + 1] = (16 + shade * 48) * (0.5 + data[j] * 0.005)
    imageData[i + 2] = shade * 48 * (0.5 + data[j] * 0.005)
  }

  ctx.putImageData(image, 0, 0)

  const canvasScaled = document.createElement('canvas')
  canvasScaled.width = width * factor
  canvasScaled.height = height * factor

  ctx = canvasScaled.getContext('2d')
  ctx.scale(factor, factor)
  ctx.filter = 'blur(2px)'
  ctx.drawImage(canvas, 0, 0)

  image = ctx.getImageData(0, 0, canvasScaled.width, canvasScaled.height)
  imageData = image.data
  for (let i = 0, l = imageData.length; i < l; i += 4) {
    const v = ~~(random() * 5)
    imageData[i] += v
    imageData[i + 1] += v
    imageData[i + 2] += v
  }
  ctx.putImageData(image, 0, 0)

  return canvasScaled
}

export default mesh
