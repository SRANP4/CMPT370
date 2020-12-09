import { GameObject } from './gameObject'
import { AppState } from './types'

export class GameObjectPool<T extends GameObject> {
  private readonly pool: T[]
  private activeA: T[]
  private activeB: T[]
  constructor () {
    this.pool = new Array<T>()

    // we flip between these arrays, see checkForInactives
    this.activeA = new Array<T>()
    this.activeB = new Array<T>()
  }

  /**
   * Adds an object to the pool
   */
  add (gameObject: T, state: AppState): void {
    gameObject.deactivate(state)
    this.pool.push(gameObject)
  }

  /**
   * Gets an inactive object from the pool if there is one, activates it, and returns it
   */
  get (state: AppState): T {
    if (this.pool.length > 0) {
      const go = this.pool.pop()
      go.activate(state)
      this.activeA.push(go)
      return go
    } else {
      return null
    }
  }

  checkForInactives (state: AppState): void {
    for (let i = 0; i < this.activeA.length; i++) {
      const go = this.activeA.pop()

      // write active object references to array B
      if (go.isActive()) {
        this.activeB.push(go)
      } else {
        this.pool.push(go)
      }
    }

    // flip the arrays
    const a = this.activeA
    this.activeA = this.activeB
    this.activeB = a
  }
}
