import { clamp } from 'three/src/math/mathutils'
import { Vector2 } from '../lib/three'
import renderer from './Renderer'

let isPointerLocked = false
renderer.domElement.addEventListener(
  'click',
  renderer.domElement.requestPointerLock
)
document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement == renderer.domElement
  if (isPointerLocked) mouse.set(window.innerWidth / 2, window.innerHeight / 2)
})

const mouse = new Vector2()
const movement = new Vector2()
document.body.addEventListener('mousemove', (e) => {
  if (isPointerLocked) {
    mouse.set(
      clamp(mouse.x + e.movementX, 0, window.innerWidth),
      clamp(mouse.y + e.movementY, 0, window.innerHeight)
    )
  } else {
    mouse.set(e.clientX, e.clientY)
  }
  movement.set(e.movementX, e.movementY)
})

export default mouse
export { isPointerLocked, movement }
