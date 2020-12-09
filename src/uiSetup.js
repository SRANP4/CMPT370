// @ts-check
'use strict'

/* eslint-disable */
import { COLLIDER_TYPE_SPHERE } from './collisionFunctions.js'
import { rotationMatrixToEulerAngles, toDegrees } from './commonFunctions.js'
import { keysPressed } from './inputHelper.js'
/* eslint-enable */

/**
 *
 * @param {import("./types").ProgramInfo} programInfo
 */
export function shaderValuesErrorCheck (programInfo) {
  /** @type {string[]} */
  const missing = []

  // do attrib check
  Object.keys(programInfo.attribLocations).forEach(attrib => {
    if (programInfo.attribLocations[attrib] === -1) {
      missing.push(attrib)
    }
  })
  // do uniform check
  Object.keys(programInfo.uniformLocations).forEach(attrib => {
    if (!programInfo.uniformLocations[attrib]) {
      missing.push(attrib)
    }
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
  const webglErrorDiv = document.getElementById('webglError')
  if (webglErrorDiv !== null) { webglErrorDiv.appendChild(errorTag) }

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

  state.camPosTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#camera_position'
  ))
  state.camPosTextElement.innerText = 'CAM POS'

  state.objInfoTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#object_info'
  ))
  state.objInfoTextElement.innerText = 'OBJ INFO'
}

export function updateSimulationStatusIndicator (message) {
  const simulationStatusTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#simulation_status'
  ))
  simulationStatusTextElement.innerText = message
}

/**
 *
 * @param {import('./types.js').AppState} state
 */
export function uiOnLoaded (state) {
  /** @type {HTMLElement} */
  const loadingContainer = document.querySelector(
    '#loading_indicator_container'
  )
  loadingContainer.style.backgroundColor = 'green'

  /** @type {HTMLElement} */
  const statusText = document.querySelector('#status')
  statusText.innerText = 'Press P to start/pause the simulation'
}

/**
 *
 * @param {import('./types.js').AppState} state
 */
export function updateDebugStats (state) {
  // TODO add basic GameObject info (isActive, activateOnStart, has rigidbody, has drawingObject)
  // TODO all this string concatenation is expensive, reduce to fixed labels and set number and string values
  const pos = state.camera.position
  const pitch = state.camera.pitch
  const yaw = state.camera.yaw

  

  // prettier-ignore
  state.camPosTextElement.innerText =
    'X: ' + pos[0].toFixed(2) +
    ' Y: ' + pos[1].toFixed(2) +
    ' Z: ' + pos[2].toFixed(2) +
    '\nPitch: ' + toDegrees(pitch).toFixed(2) +
    ' Yaw: ' + toDegrees(yaw).toFixed(2) +
    '\nNear clip: ' + state.camera.nearClip.toString() +
    '\nFar clip: ' + state.camera.farClip.toString()

  const obj = state.objects[state.selectedObjIndex]

  const eulerAngles = rotationMatrixToEulerAngles(obj.model.rotation)

  let rigidbodyInfo = ''

  if (obj.rigidbody != null) {
    const rb = obj.rigidbody

    let colliderInfo = ''
    if (rb.collider.colliderType === COLLIDER_TYPE_SPHERE) {
      const col = /** @type {import('./types.js').Sphere} */ (rb.collider)
      // prettier-ignore
      colliderInfo =
        '\n--------Sphere collider info--------' +
        '\nPos: ' + col.pos.toString() +
        '\nRadius: ' + col.radius.toString()
    } else {
      const col = /** @type {import('./types.js').BoundingBox} */ (rb.collider)
      // prettier-ignore
      colliderInfo =
        '\n--------Bounding box collider info--------' +
        '\nxMin: ' + col.xMin.toString() +
        '\nxMax: ' + col.xMax.toString() +
        '\nyMin: ' + col.yMin.toString() +
        '\nyMax: ' + col.yMax.toString() +
        '\nzMin: ' + col.zMin.toString() +
        '\nzMax: ' + col.zMax.toString()
    }

    // prettier-ignore
    rigidbodyInfo =
    '\n----------Rigidbody info----------' +
    '\nPos: ' + rb.pos.toString() +
    '\nVelocity: ' + rb.velocity.toString() +
    '\nDrag: ' + rb.drag.toString() +
    '\nGravity direction: ' + rb.gravityDirection.toString() +
    '\nGravity strength: ' + rb.gravityStrength.toString() +
     colliderInfo
  }

  // prettier-ignore
  state.objInfoTextElement.innerText =
    '\nObject index: ' + state.selectedObjIndex.toString() +
    '\nName: ' + obj.name +
    '\nType: ' + obj.type +
    '\nLoaded: ' + obj.loaded +
    '\n----------Transform info----------' +
    '\nPosition: ' + obj.model.position.toString() +
    '\nRotation: Yaw: ' + toDegrees(eulerAngles[1]).toFixed(2) +
    ' Pitch: ' + toDegrees(eulerAngles[0]).toFixed(2) +
    ' Roll: ' + toDegrees(eulerAngles[2]).toFixed(2) +
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
    '\nBitangent count: ' + obj.model.bitangents.length.toString() +
    rigidbodyInfo
}
