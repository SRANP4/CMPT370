// @ts-check
'use strict'

/* eslint-disable */
import { vec3 } from '../lib/gl-matrix/index.js'
import { createRigidbody, createSphere, setRigidbodyPosition } from './collisionFunctions.js'
import { GameObject } from './gameObject.js'
import { containsObject, getObject } from './sceneFunctions.js'
import { EnemyShip } from './enemyShip.js'
import { PlayerShip } from './playerShip.js'
/* eslint-enable */

// prettier-ignore
const spheres = ['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5', 'sphere6', 'sphere7',
  'sphere8', 'sphere9', 'sphere10', 'sphere11', 'sphere12', 'sphere13', 'sphere14', 'sphere15',
  'sphere16', 'sphere17']

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
      createSphere(vec3.create(), 0.5),
      this.onIntersection
    )
    // sphereRb.gravityStrength = 0

    // we intend for cannonballs to be pooled, so we don't want them to be active at startup
    this.activateOnStart = false

    this.drawingObject = sphereObj
    this.rigidbody = sphereRb
    this.damage = 5
    this.sphereColliding = false
    // /** @type {GameObject} */
    // this.collidedSphere = null
    /** @type {EnemyShip | PlayerShip} */
    this.collidedShip = undefined
    this.shooterName = ''
    this.lastChangeTime = 0
    this.changeTime = 12 * 1000
  }

  /**
   * Activate this GameObject (first activation is called before onStart)
   * @param {import('./types.js').AppState} state
   */
  activate (state) {
    super.activate(state)
    // reset our velocity
    this.rigidbody.velocity = vec3.fromValues(0, 0, 0)
    // reset the ball so its not red
    this.drawingObject.material.diffuse = [0.5, 0.5, 0.5]
  }

  /**
   * Deactivate this GameObject
   * @param {import('./types.js').AppState} state
   */
  deactivate (state) {
    super.deactivate(state)
    setRigidbodyPosition(this.rigidbody, vec3.fromValues(Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY))
  }

  /**
   * called after all other objects are initialized
   * @param {import('./types.js').AppState} state
   */
  onStart (state) {
  }

  /**
   * Called each update (BEFORE physics runs)
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onEarlyUpdate (state, deltaTime) {
    this.sphereColliding = false
  }

  /**
   * Called each update (AFTER physics runs)
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onUpdate (state, deltaTime) {
    // when the cannonball drops too far, deactivate it
    if (this.rigidbody.pos[1] < -3) {
      this.deactivate(state)
      return
    }

    if (this.sphereColliding) {
      // change color of ship to red to indicate impact
      this.collidedShip.drawingObject.material.diffuse = [0.0, 0, 1.0]

      // change color of this sphere
      this.drawingObject.material.diffuse = [1.0, 0, 0]

      // reduce health of ship
      this.collidedShip.health -= 1
    } else {
      if (this.collidedShip != null) {
        // will be set to the last ship intersecting with, so will become blue again
        this.collidedShip.drawingObject.material.diffuse = [1.0, 0, 1.0]
      }
    }
  }

  /**
   *
   * @param {vec3} startPos
   * @param {vec3} direction
   * @param {number} velocity
   * @param {string} shooterName name of the gameobject that shot the cannonball
   */
  fire (startPos, direction, velocity, shooterName) {
    // TODO set team this ball was fired by
    setRigidbodyPosition(this.rigidbody, startPos)
    vec3.normalize(direction, direction)
    vec3.scale(direction, direction, velocity)
    this.rigidbody.velocity[0] = direction[0]
    this.rigidbody.velocity[1] = direction[1]
    this.rigidbody.velocity[2] = direction[2]

    // this is how we stop the cannonball from damaging the ship that shot it
    this.shooterName = shooterName
  }

  /**
   * Called each update this object's rigidbody intersects with an object
   * @param {import('./types.js').Rigidbody} rb
   * @param {import('./types.js').Rigidbody} otherRb
   */
  onIntersection (rb, otherRb) {
    // if both objects are spheres
    if (
      containsObject(otherRb.drawingObj.name, spheres) &&
      containsObject(rb.drawingObj.name, spheres)
    ) {
      this.sphereColliding = false
    } else {
      // we'll assume the other is a ship
      const ship = /** @type {EnemyShip | PlayerShip} */ (otherRb.gameObject)
      // if the ship isn't the ship that shot this ball...
      if (ship.name !== this.shooterName) {
        this.sphereColliding = true
        this.collidedShip = ship
      }
    }
  }
}
