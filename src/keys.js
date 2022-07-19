const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}

const onkeydown = []
const onkeyup = []

document.body.addEventListener('keydown', (e) => {
  if (keys[e.code] != undefined) keys[e.code] = true
  onkeydown.forEach((fn) => fn(e))
})
document.body.addEventListener('keyup', (e) => {
  if (keys[e.code] != undefined) keys[e.code] = false
  onkeyup.forEach((fn) => fn(e))
})

export default keys
export { onkeydown, onkeyup }
