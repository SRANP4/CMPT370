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
   * Called each update
   * @param {import('./types.js').AppState} state
   * @param {number} deltaTime
   */
  onUpdate (state, deltaTime) {}
}
