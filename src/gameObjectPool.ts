import { GameObject } from './gameObject'

class GameObjectPool<T extends GameObject> {
  pool: T[]
  active: T[]
  constructor (size: number) {
    this.pool = new Array<T>(size)
    this.active = new Array<T>()
  }
  // TODO get returns an inactive gameobject
  // TODO onUpdate checks active gameobjects lists that have gone inactive
  // GameObjects themselves handle activation either directly via activate() call or
  // indirectly eg via a fire() call
}
