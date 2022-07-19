import {
  AxesHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from '../lib/three'
import { GUI } from '../lib/three/examples/jsm/libs/lil-gui.module.min.js'
import Stats from '../lib/three/examples/jsm/libs/stats.module.js'
import camera from './Camera'
import { DEBUG } from './config'
// import controls from './FirstPersonControls'
import { ambientLight } from './lighting'
import scene from './Scene'
import steps from './steps'

if (DEBUG) {
  const stats = new Stats()
  const panel = stats.addPanel(new Stats.Panel('Y', '#0ff', '#002'))
  document.body.appendChild(stats.dom)
  steps.push(() => {
    panel.update(camera.position.y, 0)
    stats.update()
  })

  const axesContainer = document.createElement('div')
  axesContainer.id = 'axes'
  document.body.appendChild(axesContainer)
  const axesRenderer = new WebGLRenderer({ alpha: true })
  axesRenderer.setSize(axesContainer.clientWidth, axesContainer.clientHeight)
  axesContainer.appendChild(axesRenderer.domElement)
  const axesScene = new Scene()
  const axesCamera = new PerspectiveCamera(
    50,
    axesContainer.clientWidth / axesContainer.clientHeight,
    1,
    1000
  )
  axesCamera.up = camera.up
  axesScene.add(
    new AxesHelper(
      Math.min(axesContainer.clientWidth, axesContainer.clientHeight)
    )
  )
  steps.push(() => {
    axesCamera.position.copy(camera.position)
    // TODO: update to match camera
    // camera2.position.sub( controls.target ); // added by @libe

    axesCamera.position.setLength(300)
    axesCamera.lookAt(axesScene.position)
    axesRenderer.render(axesScene, axesCamera)
  })

  ambientLight.intensity = 0.5

  scene.fog.density = 0

  const gui = new GUI()
  // gui
  //   .add(controls, 'movementSpeed', 0, controls.movementSpeed * 2)
  //   .name('Speed')
  // gui.add(controls, 'lookSpeed', 0, controls.lookSpeed * 2).name('Look Speed')
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder
    .add(camera, 'fov', 1, 180)
    .name('FOV')
    .onFinishChange(() => camera.updateProjectionMatrix())
  cameraFolder.add(ambientLight, 'intensity', 0, 1).name('Ambience')
  cameraFolder.add(scene.fog, 'density', 0, 0.01).name('Fog')
}
