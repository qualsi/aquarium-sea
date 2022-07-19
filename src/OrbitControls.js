import { OrbitControls } from '../lib/three/examples/jsm/controls/OrbitControls.js'
import camera from './Camera'
import renderer from './Renderer'

const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 0
controls.maxDistance = 100

export default controls
