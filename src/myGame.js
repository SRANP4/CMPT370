// @ts-check
'use strict'

import { vec3 } from '../lib/gl-matrix/index.js'
import { updateCameraEulerLookDir } from './cameraFunctions.js'
import {
  createRigidbody,
  createSphere,
  updateRigidbodies,
  getBoundingBoxFromModelVertices
} from './collisionFunctions.js'
import {
  keysDown,
  keysPressed,
  mouseXDelta,
  mouseYDelta,
  setupInputEvents,
  updateInput
} from './inputHelper.js'
import { getObject } from './sceneFunctions.js'
import { updateSimulationStatusIndicator } from './uiSetup.js'

/*
  TODO add debug object markers
  TODO add debug grid
*/

// If you want to use globals here you can. Initialize them in startGame then update/change them in gameLoop
let flyCamEnabled = false
let simulationEnabled = false
const rigidbodies = []
let sphereColliding = false
let shipObj = null
let sphereObj = null
let health = { Ship1: 15, Ship2: 15, Ship3: 15 }
let collidedShip = null
let collidedSphere = null
let spheres = [
  'sphere1',
  'sphere2',
  'sphere3',
  'sphere4',
  'sphere5',
  'sphere6',
  'sphere7',
  'sphere8',
  'sphere9'
]
let movespheres = [
  'sphere1',
  'sphere2',
  'sphere3',
  'sphere4',
  'sphere5',
  'sphere6',
  'sphere7',
  'sphere8',
  'sphere9'
]
let moveSphere = null
let ships = ['Ship1', 'Ship2', 'Ship3']

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

  for (let i = 0; i < ships.length; i++) {
    shipObj = getObject(state, ships[i])
    const shipRb = createRigidbody(
      shipObj,
      getBoundingBoxFromModelVertices(shipObj),
      /**
       *
       * @param {import('./types.js').Rigidbody} rb
       * @param {import('./types.js').Rigidbody} otherRb
       */
      function (rb, otherRb) {
        // If two ships collide
        if (
          containsObject(rb.drawingObj.name, ships) &&
          containsObject(otherRb.drawingObj.name, ships)
        ) {
          health[rb.drawingObj.name] = 0
          health[otherRb.drawingObj.name] = 0
          rb.gravityStrength = 9.81
          otherRb.gravityStrength = 9.81
          rb.drawingObj.material.diffuse = [1.0, 0, 0]
          otherRb.drawingObj.material.diffuse = [1.0, 0, 0]
        }
        // collidedShip = shipObj
      }
    )
    shipRb.gravityStrength = 0
    rigidbodies.push(shipRb)
  }

  for (let i = 0; i < spheres.length; i++) {
    sphereObj = getObject(state, spheres[i])
    const sphereRb = createRigidbody(
      sphereObj,
      createSphere(vec3.create(), 0.25),
      /**
       *
       * @param {import('./types.js').Rigidbody} rb
       * @param {import('./types.js').Rigidbody} otherRb
       */
      function (rb, otherRb) {
        if (
          containsObject(otherRb.drawingObj.name, spheres) &&
          containsObject(rb.drawingObj.name, spheres)
        ) {
          sphereColliding = false
          rb.gravityStrength = 9.81
          otherRb.gravityStrength = 9.81
          movespheres = movespheres.filter(
            sphere => sphere !== rb.drawingObj.name
          )
          movespheres = movespheres.filter(
            sphere => sphere !== otherRb.drawingObj.name
          )
        } else {
          sphereColliding = true
          if (
            !(collidedSphere === rb.drawingObj.name) &&
            !(collidedShip === otherRb.drawingObj.name)
          ) {
            collidedSphere = rb.drawingObj
            collidedShip = otherRb.drawingObj
            movespheres = movespheres.filter(sphere => sphere !== moveSphere)
          }
        }
      }
    )

    sphereRb.gravityStrength = 0
    rigidbodies.push(sphereRb)
  }
}

/**
 *
 * @param { import("./types").AppState } state Game state
 * @param { number } deltaTime time difference between the previous frame that was drawn and the current frame
 */
export function fixedUpdate (state, deltaTime) {
  updateInput()

  if (keysPressed.get('-')) {
    state.selectedObjIndex = (state.selectedObjIndex - 1) % state.objectCount
    if (state.selectedObjIndex < 0) {
      state.selectedObjIndex = state.objectCount - 1
    }
  }

  if (keysPressed.get('=')) {
    state.selectedObjIndex = (state.selectedObjIndex + 1) % state.objectCount
  }

  updateFlyCam(state)

  if (keysPressed.get('p')) {
    simulationEnabled = !simulationEnabled
    if (simulationEnabled) {
      updateSimulationStatusIndicator('Simulation running')
    } else {
      updateSimulationStatusIndicator('Simulation paused')
    }
  }

  if (simulationEnabled) {
    // handle physics here
    // Here we can add game logic, like getting player objects, and moving them, detecting collisions, you name it. Examples of functions can be found in sceneFunctions
    sphereColliding = false

    updateRigidbodies(rigidbodies, deltaTime)

    if (keysPressed.get('f')) {
      if (movespheres.length > 0) {
        if (containsObject(moveSphere, movespheres)) {
          movespheres = movespheres.filter(sphere => sphere !== moveSphere)
        }
        moveSphere =
          movespheres[Math.floor(Math.random() * (movespheres.length - 0) + 0)]
        for (let i = 0; i < rigidbodies.length; i++) {
          if (rigidbodies[i].drawingObj.name === moveSphere) {
            rigidbodies[i].velocity[1] = 5
            rigidbodies[i].velocity[2] = 20
            rigidbodies[i].gravityStrength = 10
          }
        }
      }
    }

    if (sphereColliding) {
      // change color of ship
      collidedShip.material.diffuse = [1.0, 0, 0]

      // change color of sphere
      collidedSphere.material.diffuse = [1.0, 0, 0]

      // reduce health of ship
      health[collidedShip.name] -= 1

      for (let i = 0; i < rigidbodies.length; i++) {
        if (rigidbodies[i].drawingObj.name === collidedShip.name) {
          if (health[collidedShip.name] <= 0) {
            rigidbodies[i].gravityStrength = 9.81
          }
        }
      }
    } else {
      if (collidedShip != null) {
        collidedShip.material.diffuse = [0, 0, 1.0]
      }
    }
  }
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

function containsObject (obj, list) {
  let i
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true
    }
  }

  return false
}
