// @ts-check
'use strict'

// behold my god awful component management
//

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
/** @type { Array<number> } */
export const entityBitfields = []
let nextEntityId = 0

/** @type {ComponentSets} */
export const componentSets = {
  // bitfields are assigned in order they are added here
  // bitfield 0b00000001
  transforms: undefined,
  // bitfield 0b00000010
  cameras: undefined,
  // bitfield 0b00000100
  lights: undefined,
  // bitfield 0b00001000
  meshDatas: undefined,
  // bitfield 0b00010000
  aabbColliders: undefined,
  // bitfield 0b00100000
  sphereColliders: undefined,
  // bitfield 0b01000000
  rigidbodies: undefined,
  // bitfield 0b10000000
  healths: undefined
}

// https://emergent.systems/blog/bit-fields/
// the bitfield filter is going to be a bit of a pita,
// but it'll let us filter based on components on an entity
// basically you can write 0b00011 (a transform and a camera)
// we can have up to 32 components with this setup

/** @type { Map<number, Array<number>> } */
export const bitfieldFilters = new Map()
export function registerFilter (bitfieldFilter) {
  // init the array for the filter
  bitfieldFilters[bitfieldFilter] = []

  // check for any existing entities, add them to the filter
  for (let index = 0; index < entityBitfields.length; index++) {
    const element = entityBitfields[index]
    if ((element & bitfieldFilter) === bitfieldFilter) {
      bitfieldFilters[bitfieldFilter].push(index)
    }
  }
}

// currently can only add entities, so don't need to worry about
// accounting for available ids that have been recovered
export function createEntity () {
  const entityId = entities.push(nextEntityId)
  entityBitfields.push(0b0)

  nextEntityId++

  return entityId
}

export function initializeComponentSets () {
  let bitfield = 0b1

  for (const [key] of Object.entries(componentSets)) {
    /** @type {ComponentSet<?>} */
    const componentSet = {
      components: [],
      entityMap: new Map(),
      // mostly storing the bitfield for sanity checking
      // but also it makes more sense to determine the bitfields at runtime
      bitfield: bitfield
    }
    componentSets[key] = componentSet

    // shift the bit left for next field
    bitfield = bitfield << 1
  }
}

/**
 * @template {Component} T
 * @param {ComponentSet<T>} componentSet
 * @param {T} component
 * @param {number} entityId
 */
export function addComponent (componentSet, component, entityId) {
  const index = componentSet.components.push(component)
  component.entityId = entityId
  componentSet.entityMap[entityId] = index
  entityBitfields[entityId] = entityBitfields[entityId] | componentSet.bitfield

  // see if the component is a part of any filters, if it is, add it to that filter
  for (const [key, value] of bitfieldFilters.entries()) {
    const isInFilter = (key & componentSet.bitfield) === componentSet.bitfield
    if (!isInFilter) {
      continue
    }

    // this is slow but w/e
    if (value.find(id => id === entityId) !== undefined) {
      bitfieldFilters.get(key).push(entityId)
    }
  }
}
