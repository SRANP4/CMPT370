// @ts-check
'use strict'

import { rotationMatrixToEulerAngles } from './commonFunctions.js'
import { keysPressed } from './inputHelper.js'

/**
 *
 * @param {import("./types").ProgramInfo} programInfo
 */
export function shaderValuesErrorCheck (programInfo) {
  const missing = []
  // do attrib check
  Object.keys(programInfo.attribLocations).map(attrib => {
    if (programInfo.attribLocations[attrib] === -1) {
      missing.push(attrib)
    }
    return null
  })
  // do uniform check
  Object.keys(programInfo.uniformLocations).map(attrib => {
    if (!programInfo.uniformLocations[attrib]) {
      missing.push(attrib)
    }

    return null
  })

  if (missing.length > 0) {
    printError(
      'Shader Location Error',
      'One or more of the uniform and attribute variables in the shaders could not be located or is not being used : ' +
        missing
    )
  }
}

/**
 * A custom error function. The tag with id `webglError` must be present
 * @param  {string} tag Main description
 * @param  {string} errorStr Detailed description
 */
export function printError (tag, errorStr) {
  // Create a HTML tag to display to the user
  const errorTag = document.createElement('div')
  errorTag.classList.add('alert', 'alert-danger')
  errorTag.innerHTML = '<strong>' + tag + '</strong><p>' + errorStr + '</p>'

  // Insert the tag into the HTML document
  document.getElementById('webglError').appendChild(errorTag)

  // Print to the console as well
  console.error(tag + ': ' + errorStr)
}

/**
 *
 * @param {import('./types.js').AppState} state
 */
export function initDebugStats (state) {
  state.tickTimeTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#tick_time'
  ))
  state.tickTimeTextElement.innerText = 'TICK TIME'

  state.renderTimeTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#render_time'
  ))
  state.renderTimeTextElement.innerText = 'RENDER TIME'

  state.tickDeltaTimeTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#tick_delta_time'
  ))
  state.tickDeltaTimeTextElement.innerText = 'TICK DELTA TIME'

  state.updateTimeTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#update_delta_time'
  ))
  state.updateTimeTextElement.innerText = 'UPDATE TIME'

  state.camPosTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#camera_position'
  ))
  state.camPosTextElement.innerText = 'CAM POS'

  state.objInfoTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#object_info'
  ))
  state.objInfoTextElement.innerText = 'OBJ INFO'
}

/**
 *
 * @param {import('./types.js').AppState} state
 */
export function updateDebugStats (state) {
  const pos = state.camera.position
  const pitch = state.camera.pitch
  const yaw = state.camera.yaw

  // prettier-ignore
  state.camPosTextElement.innerText =
    'X: ' + pos[0].toFixed(2) +
    ' Y: ' + pos[1].toFixed(2) +
    ' Z: ' + pos[2].toFixed(2) +
    '\nPitch: ' + pitch.toFixed(2) +
    ' Yaw: ' + yaw.toFixed(2) +
    '\nNear clip: ' + state.camera.nearClip.toString() +
    '\nFar clip: ' + state.camera.farClip.toString()

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

  const eulerAngles = rotationMatrixToEulerAngles(obj.model.rotation)

  // prettier-ignore
  state.objInfoTextElement.innerText =
    'Object index: ' + state.selectedObjIndex.toString() +
    '\nName: ' + obj.name +
    '\nType: ' + obj.type +
    '\nLoaded: ' + obj.loaded +
    '\n----------Transform info----------' +
    '\nPosition: ' + obj.model.position.toString() +
    '\nRotation: Yaw: ' + eulerAngles[1].toFixed(2) +
    ' Pitch: ' + eulerAngles[0].toFixed(2) +
    ' Roll: ' + eulerAngles[2].toFixed(2) +
    '\nScale: ' + obj.model.scale.toString() +
    '\n----------Material info----------' +
    '\nDiffuse texture: ' + obj.model.diffuseTexture +
    '\nNormal texture: ' + obj.model.normalTexture +
    '\nAmbientVal: ' + obj.material.ambient.toString() +
    '\nDiffuseVal: ' + obj.material.diffuse.toString() +
    '\nSpecularVal: ' + obj.material.specular.toString() +
    '\nnVal: ' + obj.material.n.toString() +
    '\nalphaVal: ' + obj.material.alpha.toString() +
    '\n----------Model info----------' +
    '\nVertex count: ' + obj.model.vertices.length.toString() +
    '\nTriangle count: ' + obj.model.triangles.length.toString() +
    '\nUV count: ' + obj.model.uvs.length.toString() +
    '\nNormal count: ' + obj.model.normals.length.toString() +
    '\nBitangent count: ' + obj.model.bitangents.length.toString()
}
