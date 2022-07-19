import { AmbientLight, HemisphereLight } from '../lib/three'

const ambientLight = new AmbientLight(0x87ceeb, 0.01)
const hemisphereLight = new HemisphereLight(0xffffff, 0x000000, 1)

// if (DEBUG) {
//   const helper = new HemisphereLightHelper(hemisphereLight, 5)
//   scene.add(helper)
// }

export { ambientLight, hemisphereLight }
