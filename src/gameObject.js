// @ts-check
'use strict'

/* eslint-disable */
import { Cube } from './objects/Cube.js'
import { Model } from './objects/Model.js'
import { Plane } from './objects/Plane.js'
/* eslint-enable */

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
    this._active = false // no way to declare private properties :(
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
  deactivate (state) {}

  /**
   * Get bool for GameObject active state
   * @returns {boolean}
   */
  isActive () {
    return this._active
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
