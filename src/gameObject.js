// @ts-check
'use strict'

import { Cube } from './objects/Cube.js'
import { Model } from './objects/Model.js'
import { Plane } from './objects/Plane.js'

/**
 * @abstract
 */
export class GameObject {
  /**
   *
   * @param {string} name
   */
  constructor (name) {
    this.name = name
    /** @type {Model | Cube | Plane} */
    this.drawingObject = null
    /** @type {import('./types.js').Rigidbody} */
    this.rigidbody = null
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
   * Called each update (AFTER physics runs)
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onUpdate (state, deltaTime) {}

  /**
   * Called each update this object's rigidbody intersects with an object
   * @param {import('./types.js').Rigidbody} rb
   * @param {import('./types.js').Rigidbody} otherRb
   */
  onIntersection (rb, otherRb) {}
}
