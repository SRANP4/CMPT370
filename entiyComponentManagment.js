/*
 component lists
   entity map for each component list
   (only add and update atm, no remove)
   types: for each combination of components, a 'type' is created
           systems filter by types
           updated when component is added to an entity
           a map of string set (each string is a component name) and entity ids

    use cases:
    system wants to loop over all components of type
      get from component list
    system wants to loop over entities with certain components
      use entity 'types'? or something else/??????
    script wants to update many different components related to an entity
      look up by map id

    for now each component will have an entity id
*/

/** @type { Array<number> } */
export const entities = []
let nextEntityId = 0

/** @type {ComponentSets} */
export const componentSets = {
  transforms: {},
  // cameras: {},
  // lights: {},
  // meshDatas: {},
  // aabbColliders: {},
  // sphereColliders: {},
  // rigidbodies: {},
  healths: {}
  // sounds: {}
}

export function initializeEntities () {}

export function createEntity () {
  const entityId = entities.push(nextEntityId)
  nextEntityId++

  return entityId
}

export function initializeComponentSets () {

}

// function addComponentType (name) {}
/**
 * @template T
 * @param {ComponentSet<T>} componentSet
 * @param {T} component
 * @param {number} entity
 */
export function addComponent (componentSet, component, entity) {}
