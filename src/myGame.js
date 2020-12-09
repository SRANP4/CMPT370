// @ts-check
'use strict'

/* eslint-disable */
import { vec3 } from '../lib/gl-matrix/index.js'
import {
  updateCameraEulerLookDir,
  rotateCameraAroundYAxis
} from './cameraFunctions.js'
import { Cannonball } from './cannonball.js'
import {
  updateRigidbodySimulation,
  initRigidbodySimulation
} from './collisionFunctions.js'
import { EnemyShip } from './enemyShip.js'
import { GameObject } from './gameObject.js'
// prettier-ignore
import {
  hasMouseLock,
  keysDown, keysPressed, mouseXDelta,
  mouseYDelta, setupInputEvents, updateInput
} from './inputHelper.js'
import { PlayerShip } from './playerShip.js'
import { containsObject, getObject } from './sceneFunctions.js'
import { updateSimulationStatusIndicator } from './uiSetup.js'
import { setRotationMatrixFromEuler } from './commonFunctions.js'
import { toRadian } from '../lib/gl-matrix/common.js'
import { random } from '../lib/gl-matrix/vec3.js'
import { GameObjectPool } from './gameObjectPool.js'
/* eslint-enable */

let flyCamEnabled = false
let playerCamEnabled = false
let mainCamEnabled = false
let simulationEnabled = false

// TODO kill this export
/** @type { Array<GameObject> } */
export const gameObjects = []

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
// prettier-ignore
const mySpheres = [
  'sphere1', 'sphere2', 'sphere3', 'sphere13',
  'sphere14', 'sphere15', 'sphere16', 'sphere17'
]
const mySphere = null
// prettier-ignore
const movespheres = [
  'sphere4', 'sphere5', 'sphere6', 'sphere7',
  'sphere8', 'sphere9', 'sphere10', 'sphere11',
  'sphere12'
]

// TODO kill this dependency of cannonball on myGame (shouldn't be exporting this value)
export const moveSphere = null
const ships = ['mainShip', 'Ship1', 'Ship2', 'Ship3']
let myShip = null
let gameTime = 0
let sphere = null

/** @type {GameObjectPool<Cannonball>} */
const cannonballPool = new GameObjectPool()

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
    // if (playerCamEnabled || mainCamEnabled) {
    //   myShip = getObject(state, 'mainShip')
    //   myShip.rigidbody.velocity[0] = 0
    //   myShip.rigidbody.velocity[1] = 0
    //   myShip.rigidbody.velocity[2] = 0

    //   for (let i = 0; i < mySpheres.length; i++) {
    //     if (mySpheres[i] !== mySphere) {
    //       sphere = getObject(state, mySpheres[i])
    //       sphere.rigidbody.velocity[0] = 0
    //       sphere.rigidbody.velocity[1] = 0
    //       sphere.rigidbody.velocity[2] = 0
    //     }
    //   }
    // }
    updateRigidbodySimulation(deltaTime)

    gameObjects.forEach(go => {
      go.onUpdate(state, deltaTime)
    })

    // misc stuff that doesn't fit in an object
    if (keysPressed.get('f')) {
      // TODO cannonballs are fired from enemyShip and playerShip classes (each calling a function on the cannonball class)
      // TODO pass shoot direction from ship to cannonball fire function so that it shoots in the correct direction
      // TODO pass a velocity to shoot with to the fire function

      // player shoots a sphere
      // if (mySpheres.length > 0) {
      //   if (containsObject(mySphere, mySpheres)) {
      //     mySpheres = mySpheres.filter(sphere => sphere !== mySphere)
      //   }
      //   mySphere = mySpheres[Math.floor(Math.random() * mySpheres.length)]

      //   const obj1 = getObject(state, mySphere)
      //   if (obj1 !== null) {
      //     const rb = obj1.rigidbody
      //     rb.velocity[0] = -20
      //     rb.velocity[1] = 5
      //     rb.velocity[2] = 0
      //     rb.gravityStrength = 10
      //   }
      // }

      const ball = cannonballPool.get(state)
      if (ball !== null) {
        ball.fire(vec3.fromValues(0, 10, 0),
          vec3.fromValues(-1, 3, 0),
          10)
      }

      // enemies shoot a sphere
      // if (movespheres.length > 0) {
      //   if (containsObject(moveSphere, movespheres)) {
      //     movespheres = movespheres.filter(sphere => sphere !== moveSphere)
      //   }
      //   moveSphere = movespheres[Math.floor(Math.random() * movespheres.length)]

      //   const obj2 = getObject(state, moveSphere)
      //   if (obj2 !== null) {
      //     const rb = obj2.rigidbody
      //     rb.velocity[0] = 20
      //     rb.velocity[1] = 5
      //     rb.velocity[2] = 0
      //     rb.gravityStrength = 10
      //   }
      // }
    }
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
      updateSimulationStatusIndicator('Simulation running')
    } else {
      updateSimulationStatusIndicator('Simulation paused')
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
  }

  if (keysPressed.get('=')) {
    state.selectedObjIndex = (state.selectedObjIndex + 1) % state.objectCount
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
  // TODO pause game when switching to fly cam, switch out of fly cam if game is resumed
  // TODO camera switch back to last camera when fly cam is disabled or game is resumed
  // TODO add handling for multiple camera targets (fly cam, player fps, player top down)
  // can use myShip (player ship reference)
  // no mouse look on either the player cam or the top down cam
  // TODO each camera angle has a target pos and at that gets, we just update the camera to these targets
  // so updateFlyCam will become its own function that updates fly cam target numbers
  // player camera and top down camera also this (could probably handle this in player ship)
  // then updateCam will just set camera to currently active camera target

  if (keysPressed.get('`')) {
    if (state.camera.name === 'flyCamera') {
      flyCamEnabled = !flyCamEnabled
      if (flyCamEnabled) {
        playerCamEnabled = false
        mainCamEnabled = false
      }
      console.log('fly cam: ' + flyCamEnabled)
    } else if (state.camera.name === 'playerCamera') {
      playerCamEnabled = !playerCamEnabled
      if (playerCamEnabled) {
        flyCamEnabled = false
        mainCamEnabled = false
      }
      console.log('player cam: ' + playerCamEnabled)
    } else if (state.camera.name === 'mainCamera') {
      mainCamEnabled = !mainCamEnabled
      if (mainCamEnabled) {
        flyCamEnabled = false
        playerCamEnabled = false
      }
      console.log('main cam: ' + mainCamEnabled)
    }
  }

  if (flyCamEnabled) {
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

  // TODO sphere launch position (player position + offset vec3) or (offset * rotation matrix + player position)
  // TODO managing sphere pool better (ie actually manage it as a pool of inactive spheres and active)
  // TODO add onActivate and onDeactivate functions to gameobject, wire it up properly to everything
  // TODO inactive spheres are set to an infinity position so they're not visible (when inactive)
  // TODO reset spheres when they drop below the world
  // TODO in order to move objects, physics will need to be able to directly reposition objects
  // TODO add a fire function to cannonball (sphere) so that we're not manipulating the rigidbody in the global update loop

  // TODO moving player (FROM THE PLAYER SHIP CLASS!!!!)
  // TODO inside player class, update target camera position for player (consider offset and rotation)
  // TODO inside player class, update sphere launch position and direction (consider offset and rotation)
  // probably only needs to be done before firing

  if (playerCamEnabled || mainCamEnabled) {
    const moveSpeed = 4
    myShip = getObject(state, 'mainShip')

    // move relative to current look direction
    if (keysDown.get('a')) {
      state.camera.position[2] += moveSpeed * secondsDeltaTime
      state.camera.center[2] += moveSpeed * secondsDeltaTime

      myShip.rigidbody.velocity[0] = 0
      myShip.rigidbody.velocity[2] = moveSpeed
    }

    if (keysDown.get('d')) {
      state.camera.position[2] -= moveSpeed * secondsDeltaTime
      state.camera.center[2] -= moveSpeed * secondsDeltaTime

      myShip.rigidbody.velocity[0] = 0
      myShip.rigidbody.velocity[2] = -moveSpeed
    }

    if (keysDown.get('w')) {
      state.camera.position[0] -= moveSpeed * secondsDeltaTime
      state.camera.center[0] -= moveSpeed * secondsDeltaTime

      myShip.rigidbody.velocity[0] = -moveSpeed
      myShip.rigidbody.velocity[2] = 0
    }

    if (keysDown.get('s')) {
      state.camera.position[0] += moveSpeed * secondsDeltaTime
      state.camera.center[0] += moveSpeed * secondsDeltaTime

      myShip.rigidbody.velocity[0] = moveSpeed
      myShip.rigidbody.velocity[2] = 0
    }
  }
}
