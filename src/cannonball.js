// @ts-check
'use strict'

/* eslint-disable */
import { Cube } from './objects/Cube.js'
import { Model } from './objects/Model.js'
import { Plane } from './objects/Plane.js'
import { vec3 } from '../lib/gl-matrix/index.js'
import { createRigidbody, createSphere, setRigidbodyPosition } from './collisionFunctions.js'
import { GameObject } from './gameObject.js'
import { gameObjects, getGameTime, moveSphere } from './myGame.js'
import { containsObject, getObject } from './sceneFunctions.js'
import { EnemyShip } from './enemyShip.js'
import { PlayerShip } from './playerShip.js'
/* eslint-enable */

// prettier-ignore
const spheres = ['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5', 'sphere6', 'sphere7',
  'sphere8', 'sphere9', 'sphere10', 'sphere11', 'sphere12', 'sphere13', 'sphere14', 'sphere15',
  'sphere16', 'sphere17']

const teams = {
  sphere1: 'mainShip',
  sphere2: 'mainShip',
  sphere3: 'mainShip',
  sphere4: 'Ship1',
  sphere5: 'Ship1',
  sphere6: 'Ship1',
  sphere7: 'Ship2',
  sphere8: 'Ship2',
  sphere9: 'Ship2',
  sphere10: 'Ship3',
  sphere11: 'Ship3',
  sphere12: 'Ship3',
  sphere13: 'mainShip',
  sphere14: 'mainShip',
  sphere15: 'mainShip',
  sphere16: 'mainShip',
  sphere17: 'mainShip'
}

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
      createSphere(vec3.create(), 0.125),
      this.onIntersection
    )
    sphereRb.gravityStrength = 0
    // we intend for cannonballs to be pooled, so we don't want them to be active at startup
    this.activateOnStart = false

    this.drawingObject = sphereObj
    this.rigidbody = sphereRb
    this.damage = 5
    this.sphereColliding = false
    // /** @type {GameObject} */
    // this.collidedSphere = null
    /** @type {GameObject} */
    this.collidedShip = undefined
    this.team = teams[name]
    this.health = 0
    this.speed = 2
    this.xDir = 0
    this.lastChangeTime = 0
    this.changeTime = 12 * 1000
  }

  /**
   * Activate this GameObject (first activation is called before onStart)
   * @param {import('./types.js').AppState} state
   */
  activate (state) {}

  /**
   * Deactivate this GameObject
   * @param {import('./types.js').AppState} state
   */
  deactivate (state) {
    setRigidbodyPosition(this.rigidbody, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
  }

  /**
   * called after all other objects are initialized
   * @param {import('./types.js').AppState} state
   */
  onStart (state) {
    for (let i = 0; i < gameObjects.length; i++) {
      if (gameObjects[i].name === this.team && !(this.team === 'mainShip')) {
        const playerShip = /** @type {PlayerShip} */ (gameObjects[i])
        this.xDir = playerShip.xDir
        this.lastChangeTime = getGameTime() - this.changeTime / 2
      }
    }
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
    for (let i = 0; i < gameObjects.length; i++) {
      if (gameObjects[i].name === this.team) {
        const ship = /** @type {PlayerShip | EnemyShip} */ (gameObjects[i])
        if (ship.health <= 0) {
          this.rigidbody.gravityStrength = 10
        }
      }
    }
    if (this.team !== 'mainShip' && this.name !== moveSphere) {
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
        // setRotationMatrixFromEuler(180, 0, 0, this.drawingObject.model.rotation)
      }
    }
    if (this.sphereColliding) {
      // change color of ship
      this.collidedShip.drawingObject.material.diffuse = [1.0, 0, 0]

      // change color of this sphere
      this.drawingObject.material.diffuse = [1.0, 0, 0]

      console.log(this.collidedShip.name)
      // reduce health of ship
      const enemyShip = /** @type {EnemyShip} */ (this.collidedShip)
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
  onIntersection (rb, otherRb) {
    // if both objects are spheres
    if (
      containsObject(otherRb.drawingObj.name, spheres) &&
      containsObject(rb.drawingObj.name, spheres)
    ) {
      this.sphereColliding = false
    } else {
      // we'll assume the other is a ship
      this.sphereColliding = true
      this.collidedShip = otherRb.gameObject
    }
  }
}
