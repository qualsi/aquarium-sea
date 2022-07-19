import yonder_bk from '../assets/yonder_bk.js'
import yonder_ft from '../assets/yonder_ft.js'
import yonder_lf from '../assets/yonder_lf.js'
import yonder_rt from '../assets/yonder_rt.js'
import yonder_up from '../assets/yonder_up.js'
import {
  BackSide,
  BoxGeometry,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
} from '../lib/three'
import { MAP_SIZE } from './config'
import bufferFromBase64 from './utils/bufferFromBase64.js'

const material = []
const sides = ['ft', 'bk', 'up', 'dn', 'rt', 'lf']
const textures = [
  yonder_ft,
  yonder_bk,
  yonder_up,
  null,
  yonder_rt,
  yonder_lf,
].map((base64) => {
  if (!base64) return null
  const data = new Uint8Array(bufferFromBase64(base64))
  const texture = new DataTexture(data, 512, 512)
  texture.flipY = true
  texture.needsUpdate = true
  return texture
})
sides.forEach((side, i) =>
  material.push(
    side == 'dn'
      ? new MeshBasicMaterial({
          depthWrite: false,
          transparent: true,
          opacity: 0,
          fog: false,
        })
      : new MeshBasicMaterial({
          map: textures[i],
          // map: new TextureLoader().load(`./assets/yonder/yonder_${side}.jpg`),
          fog: false,
        })
  )
)
material.forEach((mat) => (mat.side = BackSide))

const geometry = new BoxGeometry(MAP_SIZE, MAP_SIZE, MAP_SIZE)
const skybox = new Mesh(geometry, material)

// const loader = new CubeTextureLoader()
// loader.load(
//   [
//     './assets/yonder/yonder_ft.jpg',
//     './assets/yonder/yonder_bk.jpg',
//     './assets/yonder/yonder_up.jpg',
//     './assets/yonder/yonder_dn.jpg',
//     './assets/yonder/yonder_rt.jpg',
//     './assets/yonder/yonder_lf.jpg',
//   ],
//   (texture) => {
//     scene.background = texture
//   }
// )

export default skybox
