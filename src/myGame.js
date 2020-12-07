// @ts-check
'use strict'

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
  keysDown,
  keysPressed,
  mouseXDelta,
  mouseYDelta,
  setupInputEvents,
  updateInput
} from './inputHelper.js'
import { PlayerShip } from './playerShip.js'
import { containsObject, getObject } from './sceneFunctions.js'
import { updateSimulationStatusIndicator } from './uiSetup.js'

let flyCamEnabled = false
let playerCamEnabled = false
let mainCamEnabled = false
let simulationEnabled = false

/** @type { Array<GameObject> } */
const gameObjects = []

// cannonball and ship names as they are in the scene.json file
const spheres = ['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5', 'sphere6', 'sphere7', 'sphere8', 'sphere9', 'sphere10', 'sphere11','sphere12']
let movespheres =  ['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5', 'sphere6', 'sphere7', 'sphere8', 'sphere9', 'sphere10', 'sphere11','sphere12']
let moveSphere = null
const ships = ['mainShip','Ship1', 'Ship2', 'Ship3']
let myShip = null


/**
 *
 * @param { import("./types").AppState } state Game state
 * @usage Use this function for initializing any in game values in our state or adding event listeners
 */
export function startGame (state) {
  setupInputEvents(state.canvas)
  initRigidbodySimulation()

  //create main ship object
  const gameObj = new PlayerShip(state,ships[0])
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
  }

  gameObjects.forEach(go => {
    go.onStart(state)
  })

  // state.startTime is set at the very beginning of the game's main() function
  const startupTime = (window.performance.now() - state.startTime) / 1000
  console.log("start up time: " + startupTime.toFixed(3) + " sec")
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

  if (simulationEnabled) {
    gameObjects.forEach(go => {
      go.onEarlyUpdate(state, deltaTime)
    })

    // handle physics here
    // Here we can add game logic, like getting player objects, and moving them, detecting collisions, you name it. Examples of functions can be found in sceneFunctions
    if (playerCamEnabled){
      myShip = getObject(state, 'mainShip')
      myShip.rigidbody.velocity= vec3.create(0,0,0)
    }
    updateRigidbodySimulation(deltaTime)

    gameObjects.forEach(go => {
      go.onUpdate(state, deltaTime)
    })

    // misc stuff that doesn't fit in an object
    if (keysPressed.get('f')) {
      if (movespheres.length > 0) {
        if (containsObject(moveSphere, movespheres)) {
          movespheres = movespheres.filter(sphere => sphere !== moveSphere)
        }
        moveSphere = movespheres[Math.floor(Math.random() * movespheres.length)]

        const obj = getObject(state, moveSphere)
        if (obj !== null) {
          const rb = obj.rigidbody
          rb.velocity[1] = 5
          rb.velocity[2] = 20
          rb.gravityStrength = 10
        }
      }
    }
  }
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

  if (keysPressed.get('`')) {
    if (state.camera.name === 'flyCamera'){
      flyCamEnabled = !flyCamEnabled
      if (flyCamEnabled){
        playerCamEnabled = false
        mainCamEnabled = false
      }
      console.log('fly cam: ' + flyCamEnabled)
    } 
    else if (state.camera.name === 'playerCamera'){
      playerCamEnabled = !playerCamEnabled
      if (playerCamEnabled){
        flyCamEnabled = false
        mainCamEnabled = false
      }
      console.log('player cam: ' + playerCamEnabled)
    } else if (state.camera.name === 'mainCamera'){
      mainCamEnabled = !mainCamEnabled
      if (mainCamEnabled){
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

  else if (playerCamEnabled){
    const moveSpeed = 2

    // move relative to current look direction
    if (keysDown.get('a')) {
      const camPositionTranslate = vec3.create()
      vec3.scale(
        camPositionTranslate,
        state.camera.right,
        -moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.position, state.camera.position, camPositionTranslate)

      const camCenterTranslate = vec3.create()
      vec3.scale(
        camCenterTranslate,
        state.camera.right,
        -moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.center, state.camera.center, camCenterTranslate)
      myShip = getObject(state, 'mainShip')
      myShip.rigidbody.velocity[0]=1.39
      myShip.rigidbody.velocity[2]=1.39
      updateRigidbodySimulation(deltaTime)


    }

    if (keysDown.get('d')) {
      const camPositionTranslate = vec3.create()
      vec3.scale(
        camPositionTranslate,
        state.camera.right,
        moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.position, state.camera.position, camPositionTranslate)

      const camCenterTranslate = vec3.create()
      vec3.scale(
        camCenterTranslate,
        state.camera.right,
        moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.center, state.camera.center, camCenterTranslate)
      
      myShip = getObject(state, 'mainShip')
      myShip.rigidbody.velocity[0]=-1.39
      myShip.rigidbody.velocity[2]=-1.39
      updateRigidbodySimulation(deltaTime)
    }

    if (keysDown.get('w')) {
      const camPositionTranslate = vec3.create()
      vec3.scale(
        camPositionTranslate,
        state.camera.at,
        moveSpeed * secondsDeltaTime
      )
      vec3.add(state.camera.position, state.camera.position, camPositionTranslate)

      const camCenterTranslate = vec3.create()
      vec3.scale(camCenterTranslate, state.camera.at, moveSpeed * secondsDeltaTime)
      vec3.add(state.camera.center, state.camera.center, camCenterTranslate)
    }
  }

  else if (mainCamEnabled){

  }

}
