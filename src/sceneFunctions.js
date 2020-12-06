// @ts-check
'use strict'

import { Cube } from "./objects/Cube.js"
import { Model } from "./objects/Model.js"
import { Plane } from "./objects/Plane.js"

/**
 *
 * @param {import("./types").AppState} state
 * @param {string} name
 * @returns {Model | Cube | Plane}
 */
export function getObject (state, name) {
  let objectToFind = null

  for (let i = 0; i < state.objects.length; i++) {
    if (state.objects[i].name === name) {
      objectToFind = state.objects[i]
      break
    }
  }

  return objectToFind
}

/**
 * @template T
 * @param {T} obj
 * @param {Array<T>} list
 * @returns {boolean}
 */
export function containsObject (obj, list) {
  let i
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true
    }
  }

  return false
}

export function scaleBoundingBox (boundingBox, scaleVec) {
  const newBox = {
    xMin: boundingBox.xMin,
    yMin: boundingBox.yMin,
    zMin: boundingBox.zMin
  }

  if (boundingBox.xMax === 0 && scaleVec[0] > 1) {
    newBox.xMax = boundingBox.xMax + scaleVec[0]
  } else {
    newBox.xMax = boundingBox.xMax * scaleVec[0]
  }

  if (boundingBox.yMax === 0 && scaleVec[1] > 1) {
    newBox.yMax = boundingBox.yMax + scaleVec[1]
  } else {
    newBox.yMax = boundingBox.yMax * scaleVec[1]
  }

  if (boundingBox.zMax === 0 && scaleVec[2] > 1) {
    newBox.zMax = boundingBox.zMax + scaleVec[2]
  } else {
    newBox.zMax = boundingBox.zMax * scaleVec[2]
  }
  return newBox
}
