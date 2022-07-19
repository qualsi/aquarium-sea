import { PMREMGenerator, Vector3 } from '../lib/three'
import { Sky } from '../lib/three/examples/jsm/objects/Sky.js'
import renderer from './Renderer'
import scene from './Scene'

const sky = new Sky()
sky.scale.setScalar(10000)

const pmremGenerator = new PMREMGenerator(renderer)
const sun = new Vector3()

// Defining the x, y and z value for our 3D Vector
const theta = Math.PI * (0.49 - 0.5)
const phi = 2 * Math.PI * (0.205 - 0.5)
sun.x = Math.cos(phi)
sun.y = Math.sin(phi) * Math.sin(theta)
sun.z = Math.sin(phi) * Math.cos(theta)

sky.material.uniforms['sunPosition'].value.copy(sun)
scene.environment = pmremGenerator.fromScene(sky).texture

export default sky
