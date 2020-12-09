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
export function setupInputEvents (canvas) {
  // this just prevents right click from opening up the context menu :)
  document.addEventListener(
    'contextmenu',
    e => {
      e.preventDefault()
    },
    false
  )

  // button / key press events

  window.addEventListener('keydown', event => {
    // we need to put it in lower case as depending on if you're holding shift or not
    // the key string will be different, which causes problems as we don't always
    // get a keyup event for capital W only lower case W if the user releases shift before W
    // for example
    keysDown.set(event.key.toLowerCase(), true)
  })

  window.addEventListener('keyup', event => {
    keysDown.set(event.key.toLowerCase(), false)
  })

  window.addEventListener('mousedown', event => {
    mouseDown.set(event.button, true)
  })

  window.addEventListener('mouseup', event => {
    mouseDown.set(event.button, false)
  })

  // pointer lock events
  canvas.onclick = function () {
    if (!hasMouseLock) canvas.requestPointerLock()
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

      // browser seems to leave a large jump if you hit esc
      // possibly because it repositions the cursor first and this gets sent
      // as a final movement event
      // however this creates a jarring movement in game and it's undesirable so
      // we clear it out here
      gatheredMouseXMovement = 0
      gatheredMouseYMovement = 0
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
  // BUG pressed keys are sometimes never released causing a spamming issue
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
