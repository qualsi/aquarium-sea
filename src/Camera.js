import { PerspectiveCamera } from '../lib/three'
import { MAP_DEPTH, MAP_PADDING, MAP_SIZE, MAX_TERRAIN_HEIGHT } from './config'
import scene from './Scene'
import steps from './steps'

const fov = 30
const aspect = window.innerWidth / window.innerHeight
const near = 1e-1
const far = MAP_DEPTH * 2

const camera = new PerspectiveCamera(fov, aspect, near, far)
camera.position.set(0, -MAP_PADDING, 0)
camera.lookAt(scene.position)

// if (DEBUG) {
//   const helper = new CameraHelper(camera)
//   scene.add(helper)
// }

steps.push(() => {
  if (camera.position.y > -MAP_PADDING * 2)
    camera.position.setY(-MAP_PADDING * 2)
  if (camera.position.y < -MAP_DEPTH + MAX_TERRAIN_HEIGHT + MAP_PADDING)
    camera.position.setY(-MAP_DEPTH + MAX_TERRAIN_HEIGHT + MAP_PADDING)
  if (camera.position.x > MAP_SIZE / 2 - MAP_PADDING)
    camera.position.setX(MAP_SIZE / 2 - MAP_PADDING)
  if (camera.position.x < -MAP_SIZE / 2 + MAP_PADDING)
    camera.position.setX(-MAP_SIZE / 2 + MAP_PADDING)
  if (camera.position.z > MAP_SIZE / 2 - MAP_PADDING)
    camera.position.setZ(MAP_SIZE / 2 - MAP_PADDING)
  if (camera.position.z < -MAP_SIZE / 2 + MAP_PADDING)
    camera.position.setZ(-MAP_SIZE / 2 + MAP_PADDING)
})

export default camera
