// @ts-check
'use strict'

import { Cube } from './objects/Cube.js'
import { Model } from './objects/Model.js'
import { Plane } from './objects/Plane.js'
import { vec3 } from '../lib/gl-matrix/index.js'
import { createRigidbody, createSphere } from './collisionFunctions.js'
import { GameObject } from './gameObject.js'
import { containsObject, getObject } from './sceneFunctions.js'
import { EnemyShip } from './enemyShip.js'

const spheres = [
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

export class Cannonball extends GameObject {
  /**
   *
   * @param {import('./types.js').AppState} state
   * @param {string} name
   */
  constructor (state, name) {
    super(name)

    const sphereObj = getObject(state, name)
    const sphereRb = createRigidbody(
      sphereObj,
      this,
      createSphere(vec3.create(), 0.25),
      this.onIntersection
    )
    sphereRb.gravityStrength = 0

    this.drawingObject = sphereObj
    this.rigidbody = sphereRb
    this.damage = 5
    this.sphereColliding = false
    /** @type {GameObject} */
    this.collidedSphere = null
    /** @type {GameObject} */
    this.collidedShip = null
  }

  /**
   * called after all other objects are initialized
   * @param {import('./types.js').AppState} state
   */
  onStart (state) {}

  /**
   * Called each update
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onUpdate (state, deltaTime) {
    if (this.sphereColliding) {
      // change color of ship
      this.collidedShip.drawingObject.material.diffuse = [1.0, 0, 0]

      // change color of sphere
      this.collidedSphere.drawingObject.material.diffuse = [1.0, 0, 0]

      // reduce health of ship
      ;/** @type {EnemyShip} */ (this.collidedShip).health -= 1
    } else {
      if (this.collidedShip != null) {
        this.collidedShip.drawingObject.material.diffuse = [0, 0, 1.0]
      }
    }
  }

  /**
   * Called each update this object's rigidbody intersects with an object
   * @param {import('./types.js').Rigidbody} rb
   * @param {import('./types.js').Rigidbody} otherRb
   */
  onIntersection (rb, otherRb) {
    if (
      containsObject(otherRb.drawingObj.name, spheres) &&
      containsObject(rb.drawingObj.name, spheres)
    ) {
      this.sphereColliding = false
      rb.gravityStrength = 9.81
      otherRb.gravityStrength = 9.81
    } else {
      this.sphereColliding = true
      if (
        this.collidedSphere !== null &&
        this.collidedShip !== null &&
        !(this.collidedSphere.name === rb.drawingObj.name) &&
        !(this.collidedShip.name === otherRb.drawingObj.name)
      ) {
        this.collidedSphere = rb.gameObject
        this.collidedShip = otherRb.gameObject
      }
    }
  }
}
