// @ts-check
'use strict'

import {
  adjustCameraPitch,
  adjustCameraYaw,
  updateCameraEulerLookDir
} from './cameraFunctions.js'
import {
  keysDown,
  keysPressed,
  mouseXDelta,
  mouseYDelta,
  setupEvents as setupInputEvents,
  updateInput
} from './inputHelper.js'

/*
  TODO add fly cam
  TODO add debug object markers
  TODO add debug grid
*/

// If you want to use globals here you can. Initialize them in startGame then update/change them in gameLoop
let flyCamEnabled = false

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

  setupInputEvents(state.canvas)
}

/**
 *
 * @param { import("./types").AppState } state Game state
 * @param { number } deltaTime time difference between the previous frame that was drawn and the current frame
 */
export function fixedUpdate (state, deltaTime) {
  updateInput()
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

    // adjustCameraYaw(state.camera, mouseXDelta / 200)
    // adjustCameraPitch(state.camera, -mouseYDelta / 200)
    state.camera.yaw += mouseXDelta / 200
    state.camera.pitch -= mouseYDelta / 200
    updateCameraEulerLookDir(state.camera)

    if (keysDown.get('a')) {
      // rotateCameraAroundYAxis(state.camera, -0.16)
      state.camera.position[0] += moveSpeed
      state.camera.center[0] += moveSpeed
    }

    if (keysDown.get('d')) {
      state.camera.position[0] -= moveSpeed
      state.camera.center[0] -= moveSpeed
    }

    if (keysDown.get('w')) {
      state.camera.position[2] += moveSpeed
      state.camera.center[2] += moveSpeed
    }

    if (keysDown.get('s')) {
      state.camera.position[2] -= moveSpeed
      state.camera.center[2] -= moveSpeed
    }

    if (keysDown.get(' ')) {
      state.camera.position[1] += moveSpeed
      state.camera.center[1] += moveSpeed
    }

    if (keysDown.get('Shift')) {
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
