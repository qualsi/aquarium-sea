import { FirstPersonControls } from '../lib/three/examples/jsm/controls/FirstPersonControls.js'
import camera from './Camera'
import skybox from './Skybox'
import steps from './steps'

// TODO: look into switching to PointerLockControls
const controls = new FirstPersonControls(camera, document)
controls.movementSpeed = 100
controls.lookSpeed = 0.1
// controls.viewHalfX = window.innerWidth / 2
// controls.viewHalfY = window.innerHeight / 2

// TODO: calculate camera vector and update correspoding water flow

steps.push((delta) => {
  controls.update(delta)
  skybox.position.set(camera.position.x, skybox.position.y, camera.position.z)
  // water.position.set(camera.position.x, water.position.y, camera.position.z)
})

export default controls
