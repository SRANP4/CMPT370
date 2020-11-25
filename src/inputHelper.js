/** @type {Map<string, boolean>} */
const keysDownLast = new Map()
/** @type {Map<string, boolean>} */
export const keysDown = new Map()
/** @type {Map<string, boolean>} */
export const keysPressed = new Map()
/** @type {Map<string, boolean>} */
export const keysReleased = new Map()

/** @type {Map<number, boolean>} */
const mouseDownLast = new Map()
/** @type {Map<number, boolean>} */
export const mouseDown = new Map()
/** @type {Map<number, boolean>} */
export const mousePressed = new Map()
/** @type {Map<number, boolean>} */
export const mouseReleased = new Map()

export let hasMouseLock = false
export let mouseXDelta = 0
export let mouseYDelta = 0

export const LEFT_MOUSE_BTN = 0
export const MIDDLE_MOUE_BTN = 1
export const RIGHT_MOUSE_BTN = 2

let gatheredMouseXMovement = 0
let gatheredMouseYMovement = 0

/**
 *
 * @param {HTMLCanvasElement} canvas
 */
export function setupEvents (canvas) {
  // button / key press events

  window.addEventListener('keydown', event => {
    keysDown.set(event.key, true)
  })

  window.addEventListener('keyup', event => {
    keysDown.set(event.key, false)
  })

  window.addEventListener('mousedown', event => {
    mouseDown.set(event.button, true)
  })

  window.addEventListener('mouseup', event => {
    mouseDown.set(event.button, false)
  })

  // pointer lock events
  canvas.onclick = function () {
    canvas.requestPointerLock()
  }

  document.addEventListener('pointerlockchange', event => {
    if (
      document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas
    ) {
      console.log('The pointer lock status is now locked')
      document.addEventListener('mousemove', gatherMouseMovement, false)
      hasMouseLock = true
    } else {
      console.log('The pointer lock status is now unlocked')
      document.removeEventListener('mousemove', gatherMouseMovement, false)
      hasMouseLock = false
    }
  })
}

/**
 *
 * @param {MouseEvent} mouseEvent
 */
function gatherMouseMovement (mouseEvent) {
  gatheredMouseXMovement += mouseEvent.movementX
  gatheredMouseYMovement += mouseEvent.movementY
}

/**
 *
 */
export function updateInput () {
  keysDown.forEach((_, key) => {
    if (keysDown.get(key) && !keysDownLast.get(key)) {
      console.log(key)
      keysPressed.set(key, true)
    }

    if (keysDown.get(key) && keysDownLast.get(key)) {
      keysPressed.set(key, false)
    }

    if (!keysDown.get(key) && keysDownLast.get(key)) {
      keysReleased.set(key, true)
    }

    if (!keysDown.get(key) && !keysDownLast.get(key)) {
      keysReleased.set(key, false)
    }

    keysDownLast.set(key, keysDown.get(key))
  })

  mouseDown.forEach((_, key) => {
    if (mouseDown.get(key) && !mouseDownLast.get(key)) {
      console.log(key)
      mousePressed.set(key, true)
    }

    if (mouseDown.get(key) && mouseDownLast.get(key)) {
      mousePressed.set(key, false)
    }

    if (!mouseDown.get(key) && mouseDownLast.get(key)) {
      mouseReleased.set(key, true)
    }

    if (!mouseDown.get(key) && !mouseDownLast.get(key)) {
      mouseReleased.set(key, false)
    }

    mouseDownLast.set(key, mouseDown.get(key))
  })

  mouseXDelta = gatheredMouseXMovement
  mouseYDelta = gatheredMouseYMovement
  gatheredMouseXMovement = 0
  gatheredMouseYMovement = 0
}
