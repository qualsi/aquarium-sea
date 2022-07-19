import dolphin_glb from '../assets/dolphin_glb'
import fish_glb from '../assets/fish_glb'
import shark_glb from '../assets/shark_glb'
import { GLTFLoader } from '../lib/three/examples/jsm/loaders/GLTFLoader'
import { BoidManager } from './boidManagers'
import { MAP_DEPTH, MAP_PADDING, MAX_TERRAIN_HEIGHT } from './config'
import scene from './Scene'
import steps from './steps'
import bufferFromBase64 from './utils/bufferFromBase64'

const fishBuffer = bufferFromBase64(fish_glb)
const dolphinBuffer = bufferFromBase64(dolphin_glb)
const sharkBuffer = bufferFromBase64(shark_glb)

const loader = new GLTFLoader()
loader.parse(fishBuffer, null, (gltf) => {
  const boidManager = new BoidManager(
    scene,
    100,
    null,
    null,
    water.position.y - MAP_DEPTH * 0.4,
    null,
    gltf.scene,
    gltf.animations[0],
    0.1,
    0.2,
    Math.PI / 4
  )
  boidManager.boids.forEach((boid) => {
    scene.add(boid.mesh)
  })
  steps.push((delta) => {
    boidManager.update(delta)
  })
})

loader.parse(dolphinBuffer, null, (gltf) => {
  const boidManager = new BoidManager(
    scene,
    25,
    null,
    null,
    -MAP_DEPTH + MAX_TERRAIN_HEIGHT + MAP_PADDING + MAP_DEPTH * 0.2,
    -MAP_DEPTH + MAX_TERRAIN_HEIGHT + MAP_PADDING + MAP_DEPTH * 0.5,
    gltf.scene,
    gltf.animations[0],
    1,
    2
    // Math.PI / 4
  )
  boidManager.boids.forEach((boid) => {
    scene.add(boid.mesh)
  })
  steps.push((delta) => {
    boidManager.update(delta)
  })
})

loader.parse(sharkBuffer, null, (gltf) => {
  gltf.scene.scale.setScalar(0.025)
  const boidManager = new BoidManager(
    scene,
    5,
    null,
    null,
    -MAP_DEPTH + MAX_TERRAIN_HEIGHT + MAP_PADDING,
    -MAP_DEPTH + MAX_TERRAIN_HEIGHT + MAP_PADDING + MAP_DEPTH * 0.2,
    gltf.scene,
    gltf.animations[0],
    0.5,
    1
    // Math.PI / 4
  )
  boidManager.boids.forEach((boid) => {
    scene.add(boid.mesh)
  })
  steps.push((delta) => {
    boidManager.update(delta)
  })
})

// const geometry = new SphereGeometry(10)
// const mesh = new Mesh(geometry, new MeshLambertMaterial({ color: 0xffffff }))
