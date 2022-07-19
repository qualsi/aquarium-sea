import { Color, Scene } from '../lib/three'
import { BACKGROUND_COLOR } from './config'

const scene = new Scene()
scene.background = new Color(BACKGROUND_COLOR)

export default scene
