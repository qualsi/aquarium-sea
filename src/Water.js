import waterNormalTexture1 from '../assets/Water_1_M_Normal'
import waterNormalTexture2 from '../assets/Water_2_M_Normal'
import {
  Color,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader,
  Vector2,
  Vector4,
} from '../lib/three'
import { Water } from '../lib/three/examples/jsm/objects/Water2.js'
import { BACKGROUND_COLOR, MAP_DEPTH, MAP_PADDING, MAP_SIZE } from './config'
import bufferFromBase64 from './utils/bufferFromBase64'

const waterNormalTexture1Data = new Uint8Array(
  bufferFromBase64(waterNormalTexture1)
)
const waterNormalTexture2Data = new Uint8Array(
  bufferFromBase64(waterNormalTexture2)
)

const loader = new TextureLoader()
// const normalMap0 = loader.load('https://www.khanacademy.org/computer-programming/new-program/4682819012444160/5006482446270464.png'),
//   normalMap1 = loader.load('https://www.khanacademy.org/computer-programming/new-program/4682819012444160/5059740913156096.png')
// const normalMap0 = loader.load('./assets/textures/Water_1_M_Normal.jpg'),
//   normalMap1 = loader.load('./assets/textures/Water_2_M_Normal.jpg')
const normalMap0 = new DataTexture(waterNormalTexture1Data, 512, 512),
  normalMap1 = new DataTexture(waterNormalTexture2Data, 512, 512)
normalMap0.needsUpdate = true
normalMap1.needsUpdate = true

const shader = {
  uniforms: {
    color: {
      type: 'c',
      value: null,
    },
    reflectivity: {
      type: 'f',
      value: 0,
    },
    tReflectionMap: {
      type: 't',
      value: null,
    },
    tRefractionMap: {
      type: 't',
      value: null,
    },
    tNormalMap0: {
      type: 't',
      value: null,
    },
    tNormalMap1: {
      type: 't',
      value: null,
    },
    textureMatrix: {
      type: 'm4',
      value: null,
    },
    config: {
      type: 'v4',
      value: new Vector4(),
    },
  },
  vertexShader: /* glsl */ `

		#include <common>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>

		uniform mat4 textureMatrix;

		varying vec4 vCoord;
		varying vec2 vUv;
		varying vec3 vToEye;

		void main() {

			vUv = uv;
			vCoord = textureMatrix * vec4( position, 1.0 );

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vToEye = cameraPosition - worldPosition.xyz;

			vec4 mvPosition =  viewMatrix * worldPosition; // used in fog_vertex
			gl_Position = projectionMatrix * mvPosition;

			#include <logdepthbuf_vertex>
			#include <fog_vertex>

		}`,
  fragmentShader: /* glsl */ `

		#include <common>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>

		uniform sampler2D tReflectionMap;
		uniform sampler2D tRefractionMap;
		uniform sampler2D tNormalMap0;
		uniform sampler2D tNormalMap1;

		#ifdef USE_FLOWMAP
			uniform sampler2D tFlowMap;
		#else
			uniform vec2 flowDirection;
		#endif

		uniform vec3 color;
		uniform float reflectivity;
		uniform vec4 config;

		varying vec4 vCoord;
		varying vec2 vUv;
		varying vec3 vToEye;

		void main() {

			#include <logdepthbuf_fragment>

			float flowMapOffset0 = config.x;
			float flowMapOffset1 = config.y;
			float halfCycle = config.z;
			float scale = config.w;

			vec3 toEye = normalize( vToEye );

			// determine flow direction
			vec2 flow;
			#ifdef USE_FLOWMAP
				flow = texture2D( tFlowMap, vUv ).rg * 2.0 - 1.0;
			#else
				flow = flowDirection;
			#endif
			flow.x *= - 1.0;

			// sample normal maps (distort uvs with flowdata)
			vec4 normalColor0 = texture2D( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );
			vec4 normalColor1 = texture2D( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );

			// linear interpolate to get the final normal color
			float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;
			vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );

			// calculate normal vector
			vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );

			// calculate the fresnel term to blend reflection and refraction maps
			float theta = max( dot( toEye, normal ), 0.0 );
			float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( theta ), 5.0 );

			// calculate final uv coords
			vec3 coord = vCoord.xyz / vCoord.w;
			vec2 uv = coord.xy + coord.z * normal.xz * 0.05;

			vec4 reflectColor = texture2D( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );
			vec4 refractColor = texture2D( tRefractionMap, uv );

			// multiply water color with the mix of both textures
			gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );

			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>

		}`,
}

const plane = new PlaneGeometry(MAP_SIZE, MAP_SIZE)

water = new Water(plane, {
  color: new Color(0xccccff),
  scale: 10,
  flowDirection: new Vector2(1, 1),
  normalMap0,
  normalMap1,
  textureWidth: 1024,
  textureHeight: 1024,
  shader,
})
water.position.y = -MAP_PADDING
water.rotation.x = Math.PI * 0.5

const walls = []
const wallPlane = new PlaneGeometry(MAP_SIZE, MAP_DEPTH)
const wallMaterial = new MeshBasicMaterial({ color: BACKGROUND_COLOR })
for (let i = 0; i < 4; i++) {
  const wall = new Mesh(wallPlane, wallMaterial)
  wall.position.x = i < 2 ? (MAP_SIZE / 2) * (i % 2 ? 1 : -1) : 0
  wall.position.y = -MAP_DEPTH / 2
  wall.position.z = i < 2 ? 0 : (MAP_SIZE / 2) * (i % 2 ? 1 : -1)
  wall.rotation.y = i < 2 ? (Math.PI / 2) * (i % 2 ? -1 : 1) : (i % 2) * Math.PI
  walls.push(wall)
}

export default water
export { walls }
