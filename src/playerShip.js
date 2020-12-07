'use strict'

import {
  createRigidbody,
  getBoundingBoxFromModelVertices
} from './collisionFunctions.js'
import { GameObject } from './gameObject.js'
import { containsObject, getObject } from './sceneFunctions.js'

const ships = ['Ship1', 'Ship2', 'Ship3']
const health = { Ship1: 15, Ship2: 15, Ship3: 15 }

export class playerShip extends GameObject {
  /**
   *
   * @param {import('./types.js').AppState} state
   * @param {string} name
   */
  constructor(state, name) {
    super(name)

    const shipObj = getObject(state, name)
    const shipRb = createRigidbody(
      shipObj,
      this,
      getBoundingBoxFromModelVertices(shipObj),
      this.onIntersection
    )
    shipRb.gravityStrength = 0

    this.drawingObject = shipObj
    this.rigidbody = shipRb
    this.health = 5
  }

  /**
   * called after all other objects are initialized
   * @param {import('./types.js').AppState} state
   */
  onStart(state) { }

  /**
   * Called each update (BEFORE physics runs)
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onEarlyUpdate(state, deltaTime) { }

  /**
   * Called each update
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onUpdate(state, deltaTime) {
    if (this.health <= 0) {
      this.rigidbody.gravityStrength = 9.81
    }
  }

  /**
   * Called each update this object's rigidbody intersects with an object
   * @param {import('./types.js').Rigidbody} rb
   * @param {import('./types.js').Rigidbody} otherRb
   */
  onIntersection(rb, otherRb) {
    // If two ships collide
    if (containsObject(otherRb.drawingObj.name, ships)) {
      const otherShip = /** @type {EnemyShip} */(otherRb.gameObject)
      this.health = 0
      otherShip.health = 0
      rb.gravityStrength = 9.81
      otherRb.gravityStrength = 9.81
      rb.drawingObj.material.diffuse = [1.0, 0, 0]
      otherRb.drawingObj.material.diffuse = [1.0, 0, 0]
    }
  }
}
