// @ts-check
'use strict'

import { vec3 } from '../lib/gl-matrix/index.js'
import { updateCameraEulerLookDir } from './cameraFunctions.js'
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
  updateDebugStats(state)
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
    if (state.camera.pitch > pitchLookLimit) state.camera.pitch = pitchLookLimit
    if (state.camera.pitch < -pitchLookLimit)
      state.camera.pitch = -pitchLookLimit
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
 * @param {import('./types.js').AppState} state
 */
function updateDebugStats (state) {
  const pos = state.camera.position
  const pitch = state.camera.pitch
  const yaw = state.camera.yaw

  state.camPosTextElement.innerText =
    'X: ' +
    pos[0].toFixed(2).toString() +
    ' Y: ' +
    pos[1].toFixed(2).toString() +
    ' Z: ' +
    pos[2].toFixed(2).toString() +
    '\nPitch: ' +
    pitch.toFixed(2).toString() +
    ' Yaw: ' +
    yaw.toFixed(2).toString()

  if (keysPressed.get('-')) {
    state.selectedObjIndex = (state.selectedObjIndex - 1) % state.objectCount
    if (state.selectedObjIndex < 0) {
      state.selectedObjIndex = state.objectCount - 1
    }
  }

  if (keysPressed.get('=')) {
    state.selectedObjIndex = (state.selectedObjIndex + 1) % state.objectCount
  }

  const obj = state.objects[state.selectedObjIndex]
  state.objInfoTextElement.innerText =
    'Object index: ' + state.selectedObjIndex.toString() +
    '\nName: ' + obj.name +
    '\nType: ' + obj.type +
    '\nLoaded: ' + obj.loaded +
    '\nPosition: ' + obj.model.position.toString() +
    '\nRotation: ' + obj.model.rotation.toString() +
    '\nScale: ' + obj.model.scale.toString() +
    '\nDiffuse texture: ' + obj.model.diffuseTexture +
    '\nNormal texture: ' + obj.model.normalTexture +
    '\nAmbientVal: ' + obj.material.ambient.toString() +
    '\nDiffuseVal: ' + obj.material.diffuse.toString() +
    '\nSpecularVal: ' + obj.material.specular.toString() +
    '\nnVal: ' + obj.material.n.toString() +
    '\nalphaVal: ' + obj.material.alpha.toString()
}

/**
 *
 * @param {import("./types").AppState} state
 */
export function update (state) {}
