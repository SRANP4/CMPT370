// @ts-check
'use strict'

/* eslint-disable */
import { vec3 } from '../lib/gl-matrix/index.js'
import { GameObject } from './gameObject.js'
import { Cube } from './objects/Cube.js'
import { Model } from './objects/Model.js'
import { Plane } from './objects/Plane.js'
/* eslint-enable */

export const COLLIDER_TYPE_SPHERE = 0
export const COLLIDER_TYPE_BOX = 1
const GRAVITY_STRENGTH = 9.81
const GRAVITY_DIRECTION = vec3.fromValues(0, -1, 0)
const VELOCITY_CAP = vec3.fromValues(30, 30, 30)

/** @type { Array<import('./types.js').Rigidbody> }  */
const rigidbodies = []

export function initRigidbodySimulation () {
  // just a placeholder for now
}

/**
 *
 * @param {number} deltaTime
 */
export function updateRigidbodySimulation (deltaTime) {
  const deltaTimeSeconds = deltaTime / 1000

  // TODO add callbacks for intersection enter and exit
  for (let index = 0; index < rigidbodies.length; index++) {
    const rb = rigidbodies[index]

    // update velocity (drag & gravity)
    const gravity = vec3.create()
    vec3.scale(
      gravity,
      rb.gravityDirection,
      rb.gravityStrength * deltaTimeSeconds
    )
    vec3.add(rb.velocity, rb.velocity, gravity)

    const drag = vec3.fromValues(rb.drag[0], rb.drag[1], rb.drag[2])
    vec3.scale(drag, drag, deltaTimeSeconds)
    vec3.sub(rb.velocity, rb.velocity, drag)

    // limit to terminal velocity
    rb.velocity[0] = Math.min(rb.velocity[0], VELOCITY_CAP[0])
    rb.velocity[1] = Math.min(rb.velocity[1], VELOCITY_CAP[1])
    rb.velocity[2] = Math.min(rb.velocity[2], VELOCITY_CAP[2])

    // update the rigidbody's position
    const deltaTimeScaledVelocity = vec3.fromValues(rb.velocity[0], rb.velocity[1], rb.velocity[2])
    vec3.scale(deltaTimeScaledVelocity, deltaTimeScaledVelocity, deltaTimeSeconds)
    vec3.add(rb.pos, rb.pos, deltaTimeScaledVelocity)

    // update drawingObjects with new position
    rb.drawingObj.model.position = rb.pos

    // update collider positions
    if (rb.collider.colliderType === COLLIDER_TYPE_SPHERE) {
      const sphere = /** @type {import('./types.js').Sphere} */ (rb.collider)
      sphere.pos = rb.pos
    } else {
      translateBoundingBox(
        /** @type {import('./types.js').BoundingBox} */ (rb.collider),
        deltaTimeScaledVelocity
      )
    }
  }

  // check collisions //////////////////
  for (let index = 0; index < rigidbodies.length; index++) {
    const rb = rigidbodies[index]

    for (
      let comparingIndex = index + 1;
      comparingIndex < rigidbodies.length;
      comparingIndex++
    ) {
      const otherRb = rigidbodies[comparingIndex]

      // check and fire callback

      let intersection = false
      if (
        rb.collider.colliderType === COLLIDER_TYPE_SPHERE &&
        otherRb.collider.colliderType === COLLIDER_TYPE_SPHERE
      ) {
        intersection = sphereIntersect(
          /** @type {import('./types.js').Sphere} */ (rb.collider),
          /** @type {import('./types.js').Sphere} */ (otherRb.collider)
        )
      } else if (
        rb.collider.colliderType === COLLIDER_TYPE_BOX &&
        otherRb.collider.colliderType === COLLIDER_TYPE_BOX
      ) {
        intersection = boxIntersect(
          /** @type {import('./types.js').BoundingBox} */ (rb.collider),
          /** @type {import('./types.js').BoundingBox} */ (otherRb.collider)
        )
      } else if (
        rb.collider.colliderType === COLLIDER_TYPE_BOX &&
        otherRb.collider.colliderType === COLLIDER_TYPE_SPHERE
      ) {
        intersection = sphereBoxIntersect(
          /** @type {import('./types.js').Sphere} */ (otherRb.collider),
          /** @type {import('./types.js').BoundingBox} */ (rb.collider)
        )
      } else if (
        rb.collider.colliderType === COLLIDER_TYPE_SPHERE &&
        otherRb.collider.colliderType === COLLIDER_TYPE_BOX
      ) {
        intersection = sphereBoxIntersect(
          /** @type {import('./types.js').Sphere} */ (rb.collider),
          /** @type {import('./types.js').BoundingBox} */ (otherRb.collider)
        )
      }

      if (intersection) {
        // call back provides (this, other)
        // need to do one for both callbacks
        rb.gameObject.onIntersection(rb, otherRb)
        otherRb.gameObject.onIntersection(otherRb, rb)
      }
    }
  }
}

/**
 *
 * @param {Model | Cube | Plane} drawingObject
 * @param {GameObject} gameObject
 * @param {import('./types').Sphere | import('./types').BoundingBox} collider
 * @param {CallableFunction} collisionCallback is passed (rb, otherRb)
 * @return {import('./types').Rigidbody}
 */
export function createRigidbody (drawingObject, gameObject, collider, collisionCallback) {
  const rb = {
    pos: drawingObject.model.position,
    drawingObj: drawingObject,
    gameObject: gameObject,
    collider: collider,
    collisionCallback: collisionCallback,
    velocity: vec3.create(),
    drag: vec3.create(),
    gravityDirection: vec3.fromValues(
      GRAVITY_DIRECTION[0],
      GRAVITY_DIRECTION[1],
      GRAVITY_DIRECTION[2]
    ),
    gravityStrength: GRAVITY_STRENGTH
  }
  drawingObject.rigidbody = rb
  rigidbodies.push(rb)
  return rb
}

/**
 *
 * @param {vec3} pos
 * @param {number} radius
 * @return {import("./types").Sphere}
 */
export function createSphere (pos, radius) {
  return {
    colliderType: COLLIDER_TYPE_SPHERE,
    pos: pos,
    radius: radius
  }
}

/**
 *
 * @param {import("./types").Sphere} sphere
 * @param {vec3} posDelta
 */
export function translateSphere (sphere, posDelta) {
  vec3.add(sphere.pos, sphere.pos, posDelta)
}

/**
 *
 * @param {import('./types').Sphere} a
 * @param {import('./types').Sphere} b
 */
export function sphereIntersect (a, b) {
  const distance = Math.sqrt(
    (a.pos[0] - b.pos[0]) * (a.pos[0] - b.pos[0]) +
      (a.pos[1] - b.pos[1]) * (a.pos[1] - b.pos[1]) +
      (a.pos[2] - b.pos[2]) * (a.pos[2] - b.pos[2])
  )
  return distance < a.radius + b.radius
}

/**
 *
 * @param {import('./types').Sphere} sphere
 * @param {import('./types').BoundingBox} box
 */
export function sphereBoxIntersect (sphere, box) {
  // get box closest point to sphere center by clamping
  const x = Math.max(box.xMin, Math.min(sphere.pos[0], box.xMax))
  const y = Math.max(box.yMin, Math.min(sphere.pos[1], box.yMax))
  const z = Math.max(box.zMin, Math.min(sphere.pos[2], box.zMax))

  // this is the same as isPointInsideSphere
  const distance = Math.sqrt(
    (x - sphere.pos[0]) * (x - sphere.pos[0]) +
      (y - sphere.pos[1]) * (y - sphere.pos[1]) +
      (z - sphere.pos[2]) * (z - sphere.pos[2])
  )

  return distance < sphere.radius
}

/**
 *
 * @param {import("./types").BoundingBox} a
 * @param {import("./types").BoundingBox} b
 * @returns {boolean}
 */
export function boxIntersect (a, b) {
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
 * @param {vec3} pos
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 * @return {import("./types").BoundingBox}
 */
export function createBoundingBox (pos, width, height, depth) {
  /** @type{import("./types").BoundingBox} */
  const box = {
    colliderType: COLLIDER_TYPE_BOX,
    xMax: pos[0] + width / 2,
    xMin: pos[0] - width / 2,
    yMax: pos[1] + height / 2,
    yMin: pos[1] - height / 2,
    zMax: pos[2] + depth / 2,
    zMin: pos[2] - depth / 2
  }

  return box
}

/**
 *
 * @param {import("./types").BoundingBox} box
 * @param {vec3} pos
 */
export function translateBoundingBox (box, pos) {
  box.xMin += pos[0]
  box.xMax += pos[0]
  box.yMin += pos[1]
  box.yMax += pos[1]
  box.zMin += pos[2]
  box.zMax += pos[2]
}

/**
 *
 * @param {Cube | Plane | Model} drawingObj array of arrays, vertices numbers
 * @returns {import("./types").BoundingBox}
 */
export function getBoundingBoxFromModelVertices (drawingObj) {
  const vertices = drawingObj.model.vertices
  const xoffset = drawingObj.model.position[0]
  const yoffset = drawingObj.model.position[1]
  const zoffset = drawingObj.model.position[2]

  let xMin = xoffset
  let xMax = xoffset
  let yMin = yoffset
  let yMax = yoffset
  let zMin = zoffset
  let zMax = zoffset

  for (let i = 0; i < vertices.length / 3; i += 3) {
    if (vertices[i] + xoffset > xMax) {
      xMax = vertices[i] + xoffset
    }
    if (vertices[i] + xoffset < xMin) {
      xMin = vertices[i] + xoffset
    }
    if (vertices[i + 1] + yoffset > yMax) {
      yMax = vertices[i + 1] + yoffset
    }
    if (vertices[i + 1] + yoffset < yMin) {
      yMin = vertices[i + 1] + yoffset
    }
    if (vertices[i + 2] + zoffset > zMax) {
      zMax = vertices[i + 2] + zoffset
    }
    if (vertices[i + 2] + zoffset < zMin) {
      zMin = vertices[i + 2] + zoffset
    }
  }
  // console.log( { xMin, yMin, zMin, xMax, yMax, zMax });
  return {
    colliderType: COLLIDER_TYPE_BOX,
    xMin: xMin,
    yMin: yMin,
    zMin: zMin,
    xMax: xMax,
    yMax: yMax,
    zMax: zMax
  }
}
