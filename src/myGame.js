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

  document.addEventListener('keydown', event => {
    keysDown.set(event.key, true)
  })

  document.addEventListener('keyup', event => {
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

  if (keysPressed['`']) {
    flyCamEnabled = !flyCamEnabled
    console.log('fly cam: ' + flyCamEnabled)
  }

  if (flyCamEnabled) {
    if (keysDown.get('a')) {
      rotateCameraAroundYAxis(state.camera, -0.16)
      // state.camera.position[0] += 0.05
    }

    if (keysDown.get('d')) {
      rotateCameraAroundYAxis(state.camera, 0.16)
      // state.camera.position[0] -= 0.05
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
      keysPressed[key] = true
    }

    if (keysDown.get(key) && keysDownLast.get(key)) {
      keysPressed[key] = false
    }

    keysDownLast.set(key, keysDown.get(key))
  })
}
