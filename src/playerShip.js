'use strict'

import {
  createRigidbody,
  getBoundingBoxFromModelVertices
} from './collisionFunctions.js'
import { GameObject } from './gameObject.js'
import { containsObject, getObject } from './sceneFunctions.js'

const ships = ['mainShip']
const health = {mainShip:15}

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
  }
}
