// @ts-check
'use strict'

import {
  createRigidbody,
  getBoundingBoxFromModelVertices
} from './collisionFunctions.js'
import { getRandomInt, setRotationMatrixFromEuler } from './commonFunctions.js'
import { GameObject } from './gameObject.js'
import { getGameTime } from './myGame.js'
import { containsObject, getObject, getTime } from './sceneFunctions.js'

const ships = ['Ship1', 'Ship2', 'Ship3']
const health = { Ship1: 15, Ship2: 15, Ship3: 15 }

export class EnemyShip extends GameObject {
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
    this.speed = 2
    this.xDir = 0
    this.lastChangeTime = 0
    this.changeTime = (12 * 1000)
  }

  /**
   * called after all other objects are initialized
   * @param {import('./types.js').AppState} state
   */
  onStart(state) {
    // pick a left/right direction randomly (no rotation cuz I don't wanna deal with updating
    // the bounding box)
    // pick 0 or 1, then mafths it to be -1 or 1
    this.xDir = getRandomInt(0, 1) * 2 - 1

    // offsetting this further back by half the changeTime so that the ship's
    // starting position is center on its move line
    this.lastChangeTime = getGameTime() - this.changeTime / 2
  }

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
    // sink the ship if it has no health
    if (this.health <= 0) {
      this.rigidbody.gravityStrength = 9.81
    }

    // move x seconds then reverse direction
    // update timeout for reversal
    if (getGameTime() - this.lastChangeTime >= this.changeTime) {
      this.xDir *= -1
      this.lastChangeTime = getGameTime()
    }

    // update rotation and velocity based on desired direction
    if (this.xDir == 1) {
      // flee east, you coward
      // right, negative x
      // the default direction the ship faces

      this.rigidbody.velocity[0] = -this.speed
      setRotationMatrixFromEuler(0, 0, 0, this.drawingObject.model.rotation)

    } else {
      // head west, young man
      // left, positive x
      // need to rotate the ship 180 for this direction

      this.rigidbody.velocity[0] = this.speed
      setRotationMatrixFromEuler(180, 0, 0, this.drawingObject.model.rotation)
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
