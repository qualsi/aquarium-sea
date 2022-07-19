import { clamp } from 'three/src/math/mathutils'

export default map = (value, min, max, targetMin, targetMax) => {
  const mapped =
    ((value - min) / (max - min)) * (targetMax - targetMin) + targetMin
  return targetMin < targetMax
    ? clamp(mapped, targetMin, targetMax)
    : clamp(mapped, targetMax, targetMin)
}
