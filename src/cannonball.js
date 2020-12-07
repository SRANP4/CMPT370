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

const spheres = ['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5', 'sphere6', 'sphere7', 'sphere8', 'sphere9', 'sphere10', 'sphere11','sphere12', 'sphere13', 'sphere14', 'sphere15', 'sphere16', 'sphere17', 'sphere18', 'sphere19','sphere20','sphere21', 'sphere22', 'sphere23', 'sphere24']

export class Cannonball extends GameObject {
  /**
   *
   * @param {import('./types.js').AppState} state
   * @param {string} name
   */
  constructor(state, name) {
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
    // /** @type {GameObject} */
    // this.collidedSphere = null
    /** @type {GameObject} */
    this.collidedShip = null
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
  onEarlyUpdate(state, deltaTime) {
    this.sphereColliding = false
  }

  /**
   * Called each update (AFTER physics runs)
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onUpdate(state, deltaTime) {
    if (this.sphereColliding) {
      // change color of ship
      this.collidedShip.drawingObject.material.diffuse = [1.0, 0, 0]

      // change color of this sphere
      this.drawingObject.material.diffuse = [1.0, 0, 0];

      console.log(this.collidedShip.name)
      // reduce health of ship
      const enemyShip = /** @type {EnemyShip} */(this.collidedShip)
      enemyShip.health -= 1
    } else {
      if (this.collidedShip != null) {
        // will be set to the last ship intersecting with, so will become red
        this.collidedShip.drawingObject.material.diffuse = [0, 0, 1.0]
      }
    }
  }

  /**
   * Called each update this object's rigidbody intersects with an object
   * @param {import('./types.js').Rigidbody} rb
   * @param {import('./types.js').Rigidbody} otherRb
   */
  onIntersection(rb, otherRb) {
    // if both objects are spheres
    if (containsObject(otherRb.drawingObj.name, spheres)) {
      this.sphereColliding = false
    } else if (rb.drawingObj.parent === otherRb.drawingObj.name) {
      this.sphereColliding = false
    } else {
      // we'll assume the other is a ship
      this.sphereColliding = true
      console.log(rb.drawingObj.name)
      this.collidedShip = otherRb.gameObject
    }
  }
}
