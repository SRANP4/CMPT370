// @ts-check
'use strict'

import { vec3 } from '../lib/gl-matrix/index.js'
import { updateCameraEulerLookDir } from './cameraFunctions.js'
import {
  createRigidbody,
  createSphere,
  updateRigidbodies
} from './collisionFunctions.js'
import { rotationMatrixToEulerAngles } from './commonFunctions.js'
import {
  keysDown,
  keysPressed,
  mouseXDelta,
  mouseYDelta,
  setupEvents as setupInputEvents,
  updateInput
} from './inputHelper.js'
import { getObject } from './sceneFunctions.js'

/*
  TODO add debug object markers
  TODO add debug grid
*/

// If you want to use globals here you can. Initialize them in startGame then update/change them in gameLoop
let flyCamEnabled = false
const rigidbodies = []

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

  // create the colliders for objects
  const shipRb = createRigidbody(
    getObject(state, 'Ship'),
    createSphere(vec3.create(), 3),
    /**
     *
     * @param {import('./types.js').Rigidbody} rb
     * @param {import('./types.js').Rigidbody} otherRb
     */
    function (rb, otherRb) {}
  )
  shipRb.gravityStrength = 0

  rigidbodies.push(shipRb)

  const sphereRb = createRigidbody(
    getObject(state, 'sphere'),
    createSphere(vec3.create(), 1),
    /**
     *
     * @param {import('./types.js').Rigidbody} rb
     * @param {import('./types.js').Rigidbody} otherRb
     */
    function (rb, otherRb) {
      otherRb.drawingObj.material.diffuse = [1.0, 0, 0]
    }
  )
  sphereRb.gravityStrength = 0
  sphereRb.velocity[2] = 2

  rigidbodies.push(sphereRb)
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

  updateRigidbodies(rigidbodies, deltaTime)
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
    const pitchLookLimit = 1.57 // pi / 2, but a bit less

    // mouse look
    state.camera.yaw += mouseXDelta / 200
    state.camera.pitch -= mouseYDelta / 200
    if (state.camera.pitch > pitchLookLimit) {
      state.camera.pitch = pitchLookLimit
    }
    if (state.camera.pitch < -pitchLookLimit) {
      state.camera.pitch = -pitchLookLimit
    }
    state.camera.yaw = state.camera.yaw % (Math.PI * 2)

    updateCameraEulerLookDir(state.camera)

    // move relative to current look direction
    if (keysDown.get('a')) {
      const positionTranslate = vec3.create()
      vec3.scale(positionTranslate, state.camera.right, -moveSpeed)
      vec3.add(state.camera.position, state.camera.position, positionTranslate)

      const centerTranslate = vec3.create()
      vec3.scale(centerTranslate, state.camera.right, -moveSpeed)
      vec3.add(state.camera.center, state.camera.center, centerTranslate)
    }

    if (keysDown.get('d')) {
      const positionTranslate = vec3.create()
      vec3.scale(positionTranslate, state.camera.right, moveSpeed)
      vec3.add(state.camera.position, state.camera.position, positionTranslate)

      const centerTranslate = vec3.create()
      vec3.scale(centerTranslate, state.camera.right, moveSpeed)
      vec3.add(state.camera.center, state.camera.center, centerTranslate)
    }

    if (keysDown.get('w')) {
      const positionTranslate = vec3.create()
      vec3.scale(positionTranslate, state.camera.at, moveSpeed)
      vec3.add(state.camera.position, state.camera.position, positionTranslate)

      const centerTranslate = vec3.create()
      vec3.scale(centerTranslate, state.camera.at, moveSpeed)
      vec3.add(state.camera.center, state.camera.center, centerTranslate)
    }

    if (keysDown.get('s')) {
      const positionTranslate = vec3.create()
      vec3.scale(positionTranslate, state.camera.at, -moveSpeed)
      vec3.add(state.camera.position, state.camera.position, positionTranslate)

      const centerTranslate = vec3.create()
      vec3.scale(centerTranslate, state.camera.at, -moveSpeed)
      vec3.add(state.camera.center, state.camera.center, centerTranslate)
    }

    if (keysDown.get(' ')) {
      state.camera.position[1] += moveSpeed
      state.camera.center[1] += moveSpeed
    }

    if (keysDown.get('shift')) {
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
