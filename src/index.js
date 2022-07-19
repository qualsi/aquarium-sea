import renderer from './Renderer'
import scene from './Scene'
import steps from './steps'

import camera from './Camera'
import character from './Character'
import clock from './Clock'
import './fish'
import './Fog'
import { ambientLight } from './lighting'
import './PointerLockControls'
import skybox from './Skybox'
import terrian from './Terrain'
import water, { walls } from './Water'

import './debug'
import controls from './PointerLockControls'

document.body.appendChild(renderer.domElement)

scene.add(camera)
scene.add(ambientLight)
scene.add(skybox)
scene.add(water)
scene.add(...walls)
scene.add(terrian)
scene.add(character)
scene.add(controls.getObject())
;(function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  steps.forEach((step) => step(delta))
})()
