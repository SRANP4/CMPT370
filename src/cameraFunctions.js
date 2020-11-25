// @ts-check
'use strict'

// // Camera helper funcs // //

import { vec3 } from '../lib/gl-matrix/index.js'

/**
 *
 * @param {import('./types').Camera} cam
 * @param {number} radians
 */
export function rotateCameraAroundYAxis (cam, radians) {
  // rotate camera around Y
  const centerTranslate = vec3.create()
  vec3.scale(centerTranslate, cam.right, radians)
  vec3.add(cam.center, cam.center, centerTranslate)
  updateCameraAtVec(cam)
  updateCameraRightVec(cam)
}

/**
 *
 * @param {import('./types').Camera} cam
 * @param {number} radians
 */
export function rotateCameraAroundXAxis (cam, radians) {
  // rotate camera around X
  const centerTranslate = vec3.create()
  vec3.scale(centerTranslate, cam.up, radians)
  vec3.add(cam.center, cam.center, centerTranslate)
  updateCameraAtVec(cam)
  updateCameraUpVec(cam)
}

/**
 *
 * @param {import("./types").Camera} cam
 */
function updateCameraAtVec (cam) {
  const at = vec3.fromValues(cam.center[0], cam.center[1], cam.center[2])
  vec3.sub(at, at, cam.position)
  vec3.normalize(at, at)
  cam.at = at
}

/**
 *
 * @param {import("./types").Camera} cam
 */
function updateCameraRightVec (cam) {
  const right = vec3.fromValues(cam.at[0], cam.at[1], cam.at[2])
  vec3.cross(right, right, cam.up)
  cam.right = right
}

/**
 *
 * @param {import("./types").Camera} cam
 */
function updateCameraUpVec (cam) {
  const up = vec3.fromValues(cam.right[0], cam.right[1], cam.right[2])
  vec3.cross(up, up, cam.at)
  cam.up = up
}

/**
 *
 * @param {import('./types').StateFileCamera} statefileCamera
 * @returns {import('./types').Camera}
 */
export function initCameraFromStatefile (statefileCamera) {
  const cam = {
    at: vec3.create(),
    up: new Float32Array(statefileCamera.up),
    position: new Float32Array(statefileCamera.position),
    center: new Float32Array(statefileCamera.front),
    right: vec3.create()
  }

  updateCameraAtVec(cam)
  updateCameraRightVec(cam)

  return cam
}
