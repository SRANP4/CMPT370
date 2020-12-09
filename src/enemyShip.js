// @ts-check
'use strict'

import { vec3 } from '../lib/gl-matrix/index.js'
/* eslint-disable */
import {
  createRigidbody,
  getBoundingBoxFromModelVertices
} from './collisionFunctions.js'
import { getRandomInt, setRotationMatrixFromEuler } from './commonFunctions.js'
import { GameObject } from './gameObject.js'
import { keysPressed } from './inputHelper.js'
import { cannonballPool, getGameTime } from './myGame.js'
import { containsObject, getObject, getTime } from './sceneFunctions.js'
/* eslint-enable */

const ships = ['mainShip', 'Ship1', 'Ship2', 'Ship3']

export class EnemyShip extends GameObject {
  /**
   *
   * @param {import('./types.js').AppState} state
   * @param {string} name
   */
  constructor (state, name) {
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
    this.changeTime = 12 * 1000
  }

  /**
   * Activate this GameObject (first activation is called before onStart)
   * @param {import('./types.js').AppState} state
   */
  activate (state) {
    super.activate(state)
  }

  /**
   * Deactivate this GameObject
   * @param {import('./types.js').AppState} state
   */
  deactivate (state) {
    super.deactivate(state)
  }

  /**
   * called after all other objects are initialized
   * @param {import('./types.js').AppState} state
   */
  onStart (state) {
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
  onEarlyUpdate (state, deltaTime) {}

  /**
   * Called each update
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onUpdate (state, deltaTime) {
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
    if (this.xDir === 1) {
      // flee east, you coward
      // right, negative x
      // the default direction the ship faces

      this.rigidbody.velocity[0] = -this.speed
      // setRotationMatrixFromEuler(0, 0, 0, this.drawingObject.model.rotation)
    } else {
      // head west, young man
      // left, positive x
      // need to rotate the ship 180 for this direction

      this.rigidbody.velocity[0] = this.speed
      setRotationMatrixFromEuler(180, 0, 0, this.drawingObject.model.rotation)
    }

    // TODO shoot sometimes
    if (keysPressed.get('j')) {
      const ball = cannonballPool.get(state)
      if (ball !== null) {
      // we take an offset from the model's center then multiply it by the model matrix
      // this will take position and rotation into consideration for us
        const launchPos = vec3.fromValues(-4, -0.5, 0)
        vec3.transformMat4(launchPos, launchPos, this.drawingObject.model.modelMatrix)

        // get a forward point from the center of the ship (-x is forward for us) in world coords
        const forwardPoint = vec3.fromValues(-1, 0, 0)
        vec3.transformMat4(forwardPoint, forwardPoint, this.drawingObject.model.modelMatrix)

        // take forward point, calc direction, add some up to it, normalize, this is our
        // firing vector now
        const direction = vec3.create()
        vec3.sub(direction, forwardPoint, this.rigidbody.pos)
        // add some up
        vec3.add(direction, direction, vec3.fromValues(0, 1, 0))
        vec3.normalize(direction, direction)

        ball.fire(
          launchPos,
          direction,
          10,
          this.name)
      }
    }
  }

  /**
   * Called each update this object's rigidbody intersects with an object
   * @param {import('./types.js').Rigidbody} rb
   * @param {import('./types.js').Rigidbody} otherRb
   */
  onIntersection (rb, otherRb) {
    // If two ships collide
    if (containsObject(otherRb.drawingObj.name, ships)) {
      const otherShip = /** @type {EnemyShip} */ (otherRb.gameObject)
      this.health = 0
      otherShip.health = 0
      rb.gravityStrength = 9.81
      otherRb.gravityStrength = 9.81
      rb.drawingObj.material.diffuse = [1.0, 0, 0]
      otherRb.drawingObj.material.diffuse = [1.0, 0, 0]
    }
  }
}
