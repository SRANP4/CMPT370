// @ts-check
'use strict'

/* eslint-disable */
import { vec3 } from '../lib/gl-matrix/index.js'
import { updateCameraEulerLookDir } from './cameraFunctions.js'
import { Cannonball } from './cannonball.js'
import {
  updateRigidbodySimulation,
  initRigidbodySimulation
} from './collisionFunctions.js'
import { EnemyShip } from './enemyShip.js'
import { GameObject } from './gameObject.js'
import {
  keysDown, keysPressed, mouseXDelta,
  mouseYDelta, setupInputEvents, updateInput
} from './inputHelper.js'
import { PlayerShip } from './playerShip.js'
import { updateDebugStats, updateSimulationStatusIndicator } from './uiSetup.js'
import { GameObjectPool } from './gameObjectPool.js'
/* eslint-enable */

let gameTime = 0

let flyCamEnabled = false
const playerCamEnabled = false
const mainCamEnabled = false
let simulationEnabled = false

// cannonball and ship names as they are in the scene.json file
// TODO we should not be manually managing these kinds of lists in code!!
// prettier-ignore
const spheres = [
  'sphere1', 'sphere2', 'sphere3', 'sphere4',
  'sphere5', 'sphere6', 'sphere7', 'sphere8',
  'sphere9', 'sphere10', 'sphere11', 'sphere12',
  'sphere13', 'sphere14', 'sphere15', 'sphere16',
  'sphere17'
]

const ships = ['mainShip', 'Ship1', 'Ship2', 'Ship3']

/** @type { Array<GameObject> } */
const gameObjects = []

/** @type {GameObjectPool<Cannonball>} */
export const cannonballPool = new GameObjectPool()

/**
 *
 * @param { import('./types.js').AppState } state Game state
 * @usage Use this function for initializing any in game values in our state or adding event listeners
 */
export function startGame (state) {
  setupInputEvents(state.canvas)
  initRigidbodySimulation()

  // create main ship object
  const gameObj = new PlayerShip(state, ships[0])
  gameObjects.push(gameObj)

  // create enemy ship objects
  for (let i = 1; i < ships.length; i++) {
    const gameObj = new EnemyShip(state, ships[i])
    gameObjects.push(gameObj)
  }

  // create cannonball objects
  for (let i = 0; i < spheres.length; i++) {
    const gameObj = new Cannonball(state, spheres[i])
    gameObjects.push(gameObj)
    cannonballPool.add(gameObj, state)
  }

  gameObjects.forEach(go => {
    if (go.activateOnStart) {
      go.activate(state)
    }
    go.onStart(state)
  })

  // state.startTime is set at the very beginning of the game's main() function
  const startupTime = (window.performance.now() - state.startTime) / 1000
  console.log('start up time: ' + startupTime.toFixed(3) + ' sec')
}

/**
 *
 * @param { import("./types").AppState } state Game state
 * @param { number } deltaTime time difference between the previous frame that was drawn and the current frame
 */
export function fixedUpdate (state, deltaTime) {
  updateInput()
  updateDebugSelectedObject(state)
  updateCam(state, deltaTime)
  updateSimulationEnabled()
  cannonballPool.checkForInactives(state)

  if (simulationEnabled) {
    gameTime += deltaTime
    gameObjects.forEach(go => {
      if (go.isActive()) {
        go.onEarlyUpdate(state, deltaTime)
      }
    })

    // handle physics here
    // Here we can add game logic, like getting player objects, and moving them, detecting collisions, you name it. Examples of functions can be found in sceneFunctions
    updateRigidbodySimulation(deltaTime)

    gameObjects.forEach(go => {
      go.onUpdate(state, deltaTime)
    })
  }
}

/**
 * @returns {number} time simulation has been running for in milliseconds
 */
export function getGameTime () {
  return gameTime
}

function updateSimulationEnabled () {
  if (keysPressed.get('p')) {
    simulationEnabled = !simulationEnabled
    if (simulationEnabled) {
      updateSimulationStatusIndicator('Simulation running', 'green')
    } else {
      updateSimulationStatusIndicator('Simulation paused', 'yellow')
    }
  }
}

/**
 *
 * @param {import('./types.js').AppState} state
 */
function updateDebugSelectedObject (state) {
  if (keysPressed.get('-')) {
    state.selectedObjIndex = (state.selectedObjIndex - 1) % state.objectCount
    if (state.selectedObjIndex < 0) {
      state.selectedObjIndex = state.objectCount - 1
    }
    // since we're throttle how often stats are updated, we want to force an update so that
    // the input stays responsive here
    updateDebugStats(state)
  }

  if (keysPressed.get('=')) {
    state.selectedObjIndex = (state.selectedObjIndex + 1) % state.objectCount
    // same reason as above
    updateDebugStats(state)
  }
}

/**
 *
 * @param {import('./types.js').AppState} state
 * @param {number} deltaTime deltaTime in ms
 */

function updateCam (state, deltaTime) {
  const secondsDeltaTime = deltaTime / 1000
  // TODO multi-cam system
  // TODO 2 of 3 cameras are based on player's position / look direction
  // TODO camera switch back to last camera when fly cam is disabled or game is resumed
  // TODO add handling for multiple camera targets (fly cam, player fps, player top down)
  // can use myShip (player ship reference)
  // no mouse look on either the player cam or the top down cam
  // TODO each camera angle has a target pos and at that gets, we just update the camera to these targets
  // so updateFlyCam will become its own function that updates fly cam target numbers
  // player camera and top down camera also this (could probably handle this in player ship)
  // then updateCam will just set camera to currently active camera target
  // TODO inside player class, update target camera position for player (consider offset and rotation)

  if (keysPressed.get('`')) {
    flyCamEnabled = !flyCamEnabled

    if (flyCamEnabled) {
      // pause the simulation
      simulationEnabled = false
      updateSimulationStatusIndicator('Simulation paused', 'yellow')
      console.log('fly cam: ' + flyCamEnabled)
    }

    if (state.camera.name === 'flyCamera') {

    }
    // else if (state.camera.name === 'playerCamera') {
    //   playerCamEnabled = !playerCamEnabled
    //   if (playerCamEnabled) {
    //     flyCamEnabled = false
    //     mainCamEnabled = false
    //   }
    //   console.log('player cam: ' + playerCamEnabled)
    // } else if (state.camera.name === 'mainCamera') {
    //   mainCamEnabled = !mainCamEnabled
    //   if (mainCamEnabled) {
    //     flyCamEnabled = false
    //     playerCamEnabled = false
    //   }
    //   console.log('main cam: ' + mainCamEnabled)
    // }
  }

  if (flyCamEnabled) {
    if (simulationEnabled) {
      // disable fly cam if simulation is un-paused
      flyCamEnabled = false
      return
    }

    const moveSpeed = 7
    const pitchLookLimit = 1.57 // pi / 2, but a bit less

    // mouse look
    state.camera.yaw += mouseXDelta / 200
    state.camera.pitch -= mouseYDelta / 200
    if (state.camera.pitch > pitchLookLimit) {
      state.camera.pitch = pitchLookLimit
    }
    if (state.camera.pitch < -pitchLookLimit) {
      state.camera.pitch = -pitchLookLimit
    }
    state.camera.yaw = state.camera.yaw % (Math.PI * 2)

    updateCameraEulerLookDir(state.camera)

    // move relative to current look direction
    if (keysDown.get('a')) {
      const positionTranslate = vec3.create()
      vec3.scale(
        positionTranslate,
        state.camera.right,
        -moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.position, state.camera.position, positionTranslate)

      const centerTranslate = vec3.create()
      vec3.scale(
        centerTranslate,
        state.camera.right,
        -moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.center, state.camera.center, centerTranslate)
    }

    if (keysDown.get('d')) {
      const positionTranslate = vec3.create()
      vec3.scale(
        positionTranslate,
        state.camera.right,
        moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.position, state.camera.position, positionTranslate)

      const centerTranslate = vec3.create()
      vec3.scale(
        centerTranslate,
        state.camera.right,
        moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.center, state.camera.center, centerTranslate)
    }

    if (keysDown.get('w')) {
      const positionTranslate = vec3.create()
      vec3.scale(
        positionTranslate,
        state.camera.at,
        moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.position, state.camera.position, positionTranslate)

      const centerTranslate = vec3.create()
      vec3.scale(centerTranslate, state.camera.at, moveSpeed * secondsDeltaTime)
      vec3.add(state.camera.center, state.camera.center, centerTranslate)
    }

    if (keysDown.get('s')) {
      const positionTranslate = vec3.create()
      vec3.scale(
        positionTranslate,
        state.camera.at,
        -moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.position, state.camera.position, positionTranslate)

      const centerTranslate = vec3.create()
      vec3.scale(
        centerTranslate,
        state.camera.at,
        -moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.center, state.camera.center, centerTranslate)
    }

    if (keysDown.get(' ')) {
      state.camera.position[1] += moveSpeed * secondsDeltaTime
      state.camera.center[1] += moveSpeed * secondsDeltaTime
    }

    if (keysDown.get('shift')) {
      state.camera.position[1] -= moveSpeed * secondsDeltaTime
      state.camera.center[1] -= moveSpeed * secondsDeltaTime
    }
  }
}
