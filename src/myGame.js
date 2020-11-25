// @ts-check
'use strict'

import { vec3 } from '../lib/gl-matrix/index.js'
import { rotateCameraAroundYAxis } from './cameraFunctions.js'

/*
  TODO add fly cam
  TODO add debug object markers
  TODO add debug grid
*/

// If you want to use globals here you can. Initialize them in startGame then update/change them in gameLoop
let flyCamEnabled = false
/** @type {Map<string, boolean>} */
const keysDownLast = new Map()
/** @type {Map<string, boolean>} */
const keysDown = new Map()
/** @type {Map<string, boolean>} */
const keysPressed = new Map()
/** @type {Map<string, boolean>} */
const keysReleased = new Map()

/**
 *
 * @param { import("./types").AppState } state Game state
 * @usage Use this function for initializing any in game values in our state or adding event listeners
 */
export function startGame (state) {
  // this just prevents right click from opening up the context menu :)
  document.addEventListener(
    'contextmenu',
    e => {
      e.preventDefault()
    },
    false
  )

  window.addEventListener('keydown', event => {
    keysDown.set(event.key, true)
  })

  window.addEventListener('keyup', event => {
    keysDown.set(event.key, false)
  })

  // add mouse listeners here
}

/**
 *
 * @param { import("./types").AppState } state Game state
 * @param { number } deltaTime time difference between the previous frame that was drawn and the current frame
 */
export function fixedUpdate (state, deltaTime) {
  updatePressedKeys()
  // handle physics here
  // Here we can add game logic, like getting player objects, and moving them, detecting collisions, you name it. Examples of functions can be found in sceneFunctions

  updateFlyCam(state)
}

/**
 *
 * @param {import('./types.js').AppState} state
 */
function updateFlyCam (state) {
  if (keysPressed.get('`')) {
    flyCamEnabled = !flyCamEnabled
    console.log('fly cam: ' + flyCamEnabled)
  }

  if (flyCamEnabled) {
    const moveSpeed = 0.05

    if (keysDown.get('a')) {
      // rotateCameraAroundYAxis(state.camera, -0.16)
      state.camera.position[0] += moveSpeed
      state.camera.center[0] += moveSpeed
    }

    if (keysDown.get('d')) {
      // rotateCameraAroundYAxis(state.camera, 0.16)
      state.camera.position[0] -= moveSpeed
      state.camera.center[0] -= moveSpeed
    }

    if (keysDown.get('w')) {
      // rotateCameraAroundYAxis(state.camera, -0.16)
      state.camera.position[2] += moveSpeed
      state.camera.center[2] += moveSpeed
    }

    if (keysDown.get('s')) {
      // rotateCameraAroundYAxis(state.camera, 0.16)
      state.camera.position[2] -= moveSpeed
      state.camera.center[2] -= moveSpeed
    }

    if (keysDown.get(' ')) {
      // rotateCameraAroundYAxis(state.camera, -0.16)
      state.camera.position[1] += moveSpeed
      state.camera.center[1] += moveSpeed
    }

    if (keysDown.get('Shift')) {
      // rotateCameraAroundYAxis(state.camera, 0.16)
      state.camera.position[1] -= moveSpeed
      state.camera.center[1] -= moveSpeed
    }
  }
}

/**
 *
 * @param {import("./types").AppState} state
 */
export function update (state) {}

/**
 *
 */
function updatePressedKeys () {
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
}
