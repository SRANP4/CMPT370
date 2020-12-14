// @ts-check
'use strict'

/* eslint-disable */
import {
  createRigidbody,
  getBoundingBoxFromModelVertices
} from './collisionFunctions.js'
import { GameObject } from './gameObject.js'
import { keysDown, keysPressed } from './inputHelper.js'
import { cannonballPool } from './myGame.js'
import { getObject } from './sceneFunctions.js'
import { vec3 } from '../lib/gl-matrix/index.js'
import { setCameraLookAt } from './cameraFunctions.js'
import { modelMatrixCalc } from './main.js'
/* eslint-enable */

export class PlayerShip extends GameObject {
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

    this.health = 15
    this.speed = 2
    this.xDir = 0
    this.lastChangeTime = 0
    this.changeTime = 12 * 1000
    this.topDownCam = false
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
  onStart (state) {}

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
    // update camera (must run BEFORE velocity changes that are for the NEXT frame)
    // modelMatrix position information is from the last frame, so we need to compensate for
    // the new position be applying any velocity changes

    const camPos = vec3.create()
    const camCenter = vec3.create()
    // this is shouldn't be handled like this, but gotta finish for the deadline :(
    // gotta force the modelMatrix to calc so that we can use it to get the correct transform
    // if we don't calc it here (after the physics has updated positions, but before render
    // has done the calculation) our camera is off and we end up with some jittery frames
    const modelMatrix = modelMatrixCalc(this.drawingObject, state)

    if (keysPressed.get('t')) {
      this.topDownCam = !this.topDownCam
    }
    if (this.topDownCam) {
      // bird's eye view over ship
      vec3.add(camPos, camPos, vec3.fromValues(0, 60, 0))
      vec3.add(camCenter, camCenter, vec3.fromValues(0, 59, 0))
    } else {
      // first person camera
      vec3.add(camPos, camPos, vec3.fromValues(-3.68, -0.35, 0))
      vec3.add(camCenter, camCenter, vec3.fromValues(-4.68, -0.35, 0))
    }
    setCameraLookAt(
      state.camera,
      camPos,
      camCenter,
      modelMatrix
    )

    // sink the ship if health is 0 (or less)
    if (this.health <= 0) {
      this.rigidbody.gravityStrength = 9.81
      setTimeout(function(){document.location.reload(true)}, 1000)
    }

    // handle firing the cannon
    if (keysPressed.get('f')) {
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

    // reset for when key is up
    this.rigidbody.velocity[0] = 0
    this.rigidbody.velocity[2] = 0

    // move on fixed axis
    if (keysDown.get('a')) {
      this.rigidbody.velocity[2] += this.speed
    }

    if (keysDown.get('d')) {
      this.rigidbody.velocity[2] += -this.speed
    }

    if (keysDown.get('w')) {
      this.rigidbody.velocity[0] += -this.speed
    }

    if (keysDown.get('s')) {
      this.rigidbody.velocity[0] += this.speed
    }
  }

  /**
   * Called each update this object's rigidbody intersects with an object
   * @param {import('./types.js').Rigidbody} rb
   * @param {import('./types.js').Rigidbody} otherRb
   */
  onIntersection (rb, otherRb) {}
}
