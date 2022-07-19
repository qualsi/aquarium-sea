import { Vector3 } from '../lib/three'
import { PointerLockControls } from '../lib/three/examples/jsm/controls/PointerLockControls.js'
import camera from './Camera'
import { CONTROLS_DAMPING, CONTROLS_SPEED } from './config'
import skybox from './Skybox'
import steps from './steps'

// TODO: look into switching to PointerLockControls
const controls = new PointerLockControls(camera, document.body)
controls.pointerSpeed = 0.9

const velocity = new Vector3()
const direction = new Vector3()
let moveForward = false
let moveBackward = false
let moveLeft = false
let moveRight = false
let moveUp = false
let moveDown = false
const onKeyDown = (e) => {
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true
      break
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true
      break
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true
      break
    case 'ArrowRight':
    case 'KeyD':
      moveRight = true
      break
    case 'Space':
      moveUp = true
      break
    case 'ShiftLeft':
      moveDown = true
      break
  }
}

const onKeyUp = (e) => {
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false
      break
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false
      break
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false
      break
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false
      break
    case 'Space':
      moveUp = false
      break
    case 'ShiftLeft':
      moveDown = false
      break
  }
}

document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp)

steps.push((delta) => {
  skybox.position.set(camera.position.x, skybox.position.y, camera.position.z)
  if (controls.isLocked) {
    velocity.x -= velocity.x * CONTROLS_DAMPING * delta
    velocity.z -= velocity.z * CONTROLS_DAMPING * delta
    velocity.y -= velocity.y * CONTROLS_DAMPING * delta

    direction.x = Number(moveRight) - Number(moveLeft)
    direction.z = Number(moveForward) - Number(moveBackward)
    direction.y = Number(moveUp) - Number(moveDown)
    direction.normalize()

    if (moveForward || moveBackward)
      velocity.z -= direction.z * CONTROLS_SPEED * delta
    if (moveLeft || moveRight)
      velocity.x -= direction.x * CONTROLS_SPEED * delta
    if (moveUp || moveDown) velocity.y -= direction.y * CONTROLS_SPEED * delta

    controls.moveRight(-velocity.x * delta)
    controls.moveForward(-velocity.z * delta)
    // controls.moveUp(-velocity.y * delta)
    controls.getObject().position.y -= velocity.y * delta
  }
})

document.body.addEventListener('click', () => {
  if (!controls.isLocked) controls.lock()
})

const blocker = document.getElementById('blocker')
const instructions = document.getElementById('instructions')
controls.addEventListener('lock', function () {
  instructions.style.display = 'none'
  blocker.style.display = 'none'
})
controls.addEventListener('unlock', function () {
  blocker.style.display = 'block'
  instructions.style.display = ''
})

export default controls
