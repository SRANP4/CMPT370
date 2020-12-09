// @ts-check
'use strict'

// // Camera helper funcs // //

/* eslint-disable */
import { mat4, vec3 } from '../lib/gl-matrix/index.js'
import { toRadians } from './commonFunctions.js'
/* eslint-enable */

const DEFAULT_NEAR_CLIP = 0.1
const DEFAULT_FAR_CLIP = 1000000.0

/**
 *
 * @param {import('./types.js').Camera} cam
 * @param {vec3} position
 * @param {vec3} center
 * @param {mat4=} modelMatrix
 */
export function setCameraLookAt (cam, position, center, modelMatrix) {
  if (modelMatrix !== undefined && modelMatrix !== null) {
    vec3.transformMat4(position, position, modelMatrix)
    vec3.transformMat4(center, center, modelMatrix)
  }

  cam.position = position
  cam.center = center

  // update at vector
  vec3.sub(cam.at, center, position)
  vec3.normalize(cam.at, cam.at)

  // update up vector
  vec3.cross(cam.up, cam.right, cam.at)

  // update right vector
  vec3.cross(cam.right, cam.at, cam.up)
  vec3.normalize(cam.right, cam.right)
}

/**
 * "true" rotation, but probably not what you want
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
 * "true" rotation, but probably not what you want
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
 * Adjust the pitch and yaw on camera object, then call this
 * Good for mouse look
 * Based on: https://learnopengl.com/Getting-started/Camera
 * @param {import('./types.js').Camera} cam
 */
export function updateCameraEulerLookDir (cam) {
  cam.at[0] = Math.cos(cam.yaw) * Math.cos(cam.pitch)
  cam.at[1] = Math.sin(cam.pitch)
  cam.at[2] = Math.sin(cam.yaw) * Math.cos(cam.pitch)
  vec3.normalize(cam.at, cam.at)

  cam.center = vec3.add(cam.center, cam.position, cam.at)
  updateCameraRightVec(cam)
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
  vec3.normalize(cam.at, cam.at)
}

/**
 *
 * @param {import("./types").Camera} cam
 */
function updateCameraRightVec (cam) {
  const right = vec3.fromValues(cam.at[0], cam.at[1], cam.at[2])
  vec3.cross(right, right, cam.up)
  cam.right = right
  vec3.normalize(cam.right, cam.right)
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
  /** @type { import('./types.js').Camera } */
  const cam = {
    // @ts-ignore
    name: statefileCamera.name,
    at: vec3.create(),
    up: new Float32Array(statefileCamera.up),
    position: new Float32Array(statefileCamera.position),
    center: new Float32Array(statefileCamera.front),
    right: vec3.create(),
    pitch: toRadians(statefileCamera.pitch),
    yaw: toRadians(statefileCamera.yaw),
    nearClip: DEFAULT_NEAR_CLIP,
    farClip: DEFAULT_FAR_CLIP
  }

  updateCameraEulerLookDir(cam)

  return cam
}
