import { Group, PointLight } from '../lib/three'
import camera from './Camera'
import steps from './steps'

const light = new PointLight(0xffffff, 1, 100)
light.castShadow = true
light.position.set(0, 0, 0)

// if (DEBUG) {
//   const lightHelper = new PointLightHelper(light, 10)
//   scene.add(lightHelper)
// }

const group = new Group()
group.add(light)

steps.push(() => {
  group.position.copy(camera.position)
})

export default group
