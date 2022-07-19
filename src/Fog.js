import { FogExp2 } from '../lib/three'
import { BACKGROUND_COLOR } from './config'
import scene from './Scene'

// ShaderChunk.fog_fragment = `
// #ifdef USE_FOG
//     vec3 fogOrigin = cameraPosition;
//     vec3 fogDirection = normalize(globalPosition - fogOrigin);
//     float fogDepth = distance(globalPosition, fogOrigin);

//     float heightFactor = 0.05;
//     float fogFactor = heightFactor * exp(-fogOrigin.y * fogDensity) * (
//         1.0 - exp(-fogDepth * fogDirection.y * fogDensity)) / fogDirection.y;
//     fogFactor = saturate(fogFactor);

//     gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
// #endif`

// ShaderChunk.fog_pars_fragment = `
// #ifdef USE_FOG
//     uniform float fogTime;
//     uniform vec3 fogColor;
//     varying vec3 globalPosition;
//     #ifdef FOG_EXP2
//         uniform float fogDensity;
//     #else
//         uniform float fogNear;
//         uniform float fogFar;
//     #endif
// #endif`

// ShaderChunk.fog_vertex = `
// #ifdef USE_FOG
//     #ifndef worldPosition
//         worldPosition = modelMatrix * vec4(position, 1.0); // From local position to global position
//     #endif
//     globalPosition = worldPosition.xyz;
// #endif`

// ShaderChunk.fog_pars_vertex = `
// #ifdef USE_FOG
//     #ifndef worldPosition
//         varying vec4 worldPosition;
//     #endif
//     varying vec3 globalPosition;
// #endif`

scene.fog = new FogExp2(BACKGROUND_COLOR, 0.008)
