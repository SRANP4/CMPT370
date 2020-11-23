// @ts-check
'use strict'

/**
 *
 * @param {AppState} state
 * @param {string} name
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
 *
 * @param {BoundingBox} a
 * @param {BoundingBox} b
 * @returns {boolean}
 */
export function intersect (a, b) {
  return (
    a.xMin <= b.xMax &&
    a.xMax >= b.xMin &&
    a.yMin <= b.yMax &&
    a.yMax >= b.yMin &&
    a.zMin <= b.zMax &&
    a.zMax >= b.zMin
  )
}

/**
 *
 * @param {number[][]} vertices array of arrays, vertices numbers
 * @returns {BoundingBox}
 */
export function getBoundingBox (vertices) {
  let xMin = 0
  let xMax = 0
  let yMin = 0
  let yMax = 0
  let zMin = 0
  let zMax = 0

  for (let i = 0; i < vertices.length / 3; i += 3) {
    if (vertices[i][0] > xMax) {
      xMax = vertices[i][0]
    }
    if (vertices[i][0] < xMin) {
      xMin = vertices[i][0]
    }
    if (vertices[i + 1][1] > yMax) {
      yMax = vertices[i + 1][1]
    }
    if (vertices[i + 1][1] < yMin) {
      yMin = vertices[i + 1][1]
    }
    if (vertices[i + 2][2] > zMax) {
      zMax = vertices[i + 2][2]
    }
    if (vertices[i + 2][2] < zMin) {
      zMin = vertices[i + 2][2]
    }
  }
  // console.log( { xMin, yMin, zMin, xMax, yMax, zMax });
  return { xMin, yMin, zMin, xMax, yMax, zMax }
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

export function translateBoundingBox (boundingBox, translateVector) {
  const newBox = {}

  newBox.xMin = boundingBox.xMin + translateVector[0]
  newBox.xMax = boundingBox.xMax + translateVector[0]
  newBox.yMin = boundingBox.yMin + translateVector[1]
  newBox.yMax = boundingBox.yMax + translateVector[1]
  newBox.zMin = boundingBox.zMin + translateVector[2]
  newBox.zMax = boundingBox.zMax + translateVector[2]

  return newBox
}
