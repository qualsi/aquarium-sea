import { clamp } from 'three/src/math/mathutils'
import { Object3D, Vector3 } from '../lib/three'
import camera from './Camera'
import character from './Character'
import keys from './keys'
import mouse, { isPointerLocked } from './mouse'
import steps from './steps'
import map from './utils/map'

const coronaSafetyDistance = 5
const mouseThreshold = 100
// const movementThreshold = 1
const maxYaw = 0.025
const maxPitch = 0.01
// const maxDiveAngle = Math.PI / 4

let maxSpeed = 0.1
let swimVelocity = 0.0
let swimSpeed = 0.0
let strafeVelocity = 0.0
let strafeSpeed = 0.0

const goal = new Object3D()
goal.position.z = -coronaSafetyDistance
goal.add(camera)

const dir = new Vector3()
const a = new Vector3()
const b = new Vector3()

steps.push(() => {
  swimSpeed = 0.0
  if (keys.w) swimSpeed = maxSpeed
  else if (keys.s) swimSpeed = -maxSpeed
  swimVelocity += (swimSpeed - swimVelocity) * 0.3
  character.translateZ(swimVelocity)

  // if (keys.a) strafeSpeed = maxSpeed
  // else if (keys.d) strafeSpeed = -maxSpeed
  // strafeVelocity += (strafeSpeed - strafeVelocity) * 0.3
  // character.translateX(strafeVelocity)

  if (isPointerLocked) {
    if (Math.abs(mouse.x - window.innerWidth / 2) > mouseThreshold) {
      character.rotateY(
        map(mouse.x, mouseThreshold, window.innerWidth, maxYaw, -maxYaw)
      )
    }
    // if (Math.abs(movement.y) > movementThreshold)
    //   character.rotateX(
    //     clamp(movement.y * 0.01, -maxDiveSpeed, maxDiveSpeed)
    //   )
    if (Math.abs(mouse.y - window.innerHeight / 2) > mouseThreshold) {
      character.rotateX(
        map(mouse.y, mouseThreshold, window.innerHeight, -maxPitch, maxPitch)
      )
      character.rotation.set(
        clamp(character.rotation.x, -Math.PI / 2, Math.PI / 2),
        character.rotation.y,
        character.rotation.z
      )
    }
  }

  a.lerp(character.position, 0.04)
  b.copy(goal.position)

  dir.copy(a).sub(b).normalize()
  const distance = a.distanceTo(b) - coronaSafetyDistance
  goal.position.addScaledVector(dir, distance)
  camera.lookAt(character.position)
})
