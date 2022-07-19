import { WebGLRenderer } from '../lib/three'
import camera from './Camera'
import scene from './Scene'
import steps from './steps'

const renderer = new WebGLRenderer({
  /* antialias: false */
})
renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

steps.push(() => renderer.render(scene, camera))

export default renderer
