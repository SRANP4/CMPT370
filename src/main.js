// @ts-check
'use strict'

import { mat4, vec3 } from '../lib/gl-matrix/index.js'
import { parseOBJFileToJSON, parseSceneFile } from './commonFunctions.js'
import { gameLoop, startGame } from './myGame.js'
import { Cube } from './objects/Cube.js'
import { CustomObject } from './objects/CustomObject.js'
import { Model } from './objects/Model.js'
import { Plane } from './objects/Plane.js'
import { getObject } from './sceneFunctions.js'
import { printError } from './uiSetup.js'

let state = {}

const TICK_RATE_MS = 16

const OLD_appState = {
  debugValue: 0,
  debugTextElement: undefined
}

// previousTicks is a circular array
// initial second of data will be bunk due to a lot of 0s in the array
const tickTimeStats = {
  totalTicks: 120, // this is configurable (120 is 2 seconds worth of ticks)
  previousTicks: undefined, // this is initialized in initializeTickTimeStats as Float32Array
  previousTicksIndex: 0,
  averageTickRate: 0
}

// This function loads on window load, uses async functions to load the scene then try to render it
window.onload = async () => {
  try {
    await parseSceneFile('./statefiles/scene.json', state)
    main()
  } catch (err) {
    console.error(err)
    window.alert(err)
  }
}

/**
 *
 * @param {any} mesh contains vertex, normal, uv information for the mesh to be made
 * @param {any} object the game object that will use the mesh information
 * @purpose - Helper function called as a callback function when the mesh is done loading for the object
 */
function createMesh (mesh, object) {
  const testModel = new Model(state.gl, object, mesh)
  testModel.vertShader = state.vertShaderSample
  testModel.fragShader = state.fragShaderSample
  testModel.setup()
  addObjectToScene(state, testModel)
}

/**
 * Main function that gets called when the DOM loads
 */
function main () {
  // document.body.appendChild( stats.dom );

  /** @type { HTMLCanvasElement } */
  const canvas = document.querySelector('#glCanvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Initialize the WebGL2 context
  const gl = canvas.getContext('webgl2')

  // Only continue if WebGL2 is available and working
  if (gl === null) {
    printError(
      'WebGL 2 not supported by your browser',
      'Check to see you are using a <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API#WebGL_2_2" class="alert-link">modern browser</a>.'
    )
    return
  }

  /**
   * Sample vertex and fragment shader here that simply applies MVP matrix
   * and diffuse colour of each object
   */
  const vertShaderSample = `#version 300 es
        in vec3 aPosition;
        in vec3 aNormal;

        uniform mat4 uProjectionMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 normalMatrix;
        out vec3 oFragPosition;
        out vec3 oCameraPosition;
        out vec3 oNormal;

        void main() {
            // Position of the fragment in world space
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);

            oFragPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
            oNormal = normalize((uModelMatrix * vec4(aNormal, 1.0)).xyz);
        }
        `

  const fragShaderSample = `#version 300 es
        #define MAX_LIGHTS 20
        precision highp float;

        uniform vec3 diffuseVal;
        uniform vec3 ambientVal;
        uniform vec3 specularVal;

        out vec4 fragColor;
        void main() {
            fragColor = vec4(diffuseVal, 1.0);
        }
        `

  /**
   * Initialize state with new values (some of these you can replace/change)
   */
  state = {
    ...state, // this just takes what was already in state and applies it here again
    gl,
    vertShaderSample,
    fragShaderSample,
    canvas: canvas,
    objectCount: 0,
    lightIndices: [],
    keyboard: {},
    mouse: { sensitivity: 0.2 },
    gameStarted: false,
    samplerExists: 0,
    samplerNormExists: 0,
    constVal: 1
  }

  state.numLights = state.pointLights.length

  // iterate through the level's objects and add them
  state.loadObjects.map(object => {
    if (object.type === 'mesh') {
      parseOBJFileToJSON(object.model, createMesh, object)
    } else if (object.type === 'cube') {
      const tempCube = new Cube(gl, object)
      tempCube.vertShader = vertShaderSample
      tempCube.fragShader = fragShaderSample
      tempCube.setup()
      addObjectToScene(state, tempCube)
    } else if (object.type === 'plane') {
      const tempPlane = new Plane(gl, object)
      tempPlane.vertShader = vertShaderSample
      tempPlane.fragShader = fragShaderSample
      tempPlane.setup()
      addObjectToScene(state, tempPlane)
    } else if (object.type.includes('Custom')) {
      const tempObject = new CustomObject(gl, object)
      tempObject.vertShader = vertShaderSample
      tempObject.fragShader = fragShaderSample
      tempObject.setup()
      addObjectToScene(state, tempObject)
    }
    return null
  })

  OLD_appState.debugTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#debug_text'
  ))
  OLD_appState.debugTextElement.innerText = OLD_appState.debugValue.toString()

  if (!state.gameStarted) {
    startGame(state)
    state.gameStarted = true
    const loadingPage = document.getElementById('loadingPage')
    loadingPage.remove()
  }

  initializeTickTimeStats()
  runSimulationLoop(0)

  startRendering(gl, state) // now that scene is setup, start rendering it
}

function initializeTickTimeStats () {
  tickTimeStats.previousTicks = new Float32Array(tickTimeStats.totalTicks)
}

function runSimulationLoop (lastTickTime) {
  const start = window.performance.now()
  updateTickRateStats(lastTickTime)

  // don't hog cpu if the page isn't visible (effectively pauses the game when it
  // backgrounds)
  // NOTE: For debugging it might be useful to use hasFocus instead,
  // as the game will pause when you click into the F12 debug panel
  if (document.visibilityState === 'visible') {
    simulate(lastTickTime)
  }

  // always pass back to the browser, even if this means a janky tick rate,
  // its more important to let the browser function properly
  // ideally this will callback immediately if we're *redline* (taking up
  // 16 ms or more per tick)
  const elapsed = window.performance.now() - start
  window.setTimeout(
    runSimulationLoop,
    Math.max(0, TICK_RATE_MS - elapsed),
    elapsed
  )
}

function updateTickRateStats (lastTickTime) {
  tickTimeStats.previousTicks[tickTimeStats.previousTicksIndex] = lastTickTime
  tickTimeStats.previousTicksIndex =
    (tickTimeStats.previousTicksIndex + 1) % tickTimeStats.totalTicks

  let sum = 0
  tickTimeStats.previousTicks.forEach(element => {
    sum += element
  })

  tickTimeStats.averageTickRate = sum / tickTimeStats.totalTicks
}

function simulate (lastTickTime) {
  OLD_appState.debugValue += 1
  OLD_appState.debugTextElement.innerText =
    'Average tick time: ' +
    tickTimeStats.averageTickRate.toFixed(6).toString() +
    'ms'

  gameLoop(OLD_appState, lastTickTime) // constantly call our game loop
}

/**
 *
 * @param {any} state object containing scene values
 * @param {any} object the object to be added to the scene
 * @purpose - Helper function for adding a new object to the scene and refreshing the GUI
 */
function addObjectToScene (state, object) {
  // object.name = object.name
  state.objects.push(object)
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {any} state object containing scene values
 * @purpose - Calls the drawscene per frame
 */
function startRendering (gl, state) {
  // A variable for keeping track of time between frames
  let then = 0.0

  // This function is called when we want to render a frame to the canvas
  function render (now) {
    now *= 0.001 // convert to seconds
    const deltaTime = now - then
    then = now

    state.deltaTime = deltaTime

    // wait until the scene is completely loaded to render it
    if (state.numberOfObjectsToLoad <= state.objects.length) {
      // Draw our scene
      drawScene(gl, deltaTime, state)
    }

    // Request another frame when this one is done
    window.requestAnimationFrame(render)
  }
  // Draw the scene
  window.requestAnimationFrame(render)
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {number} deltaTime
 * @param {any} state contains the state for the scene
 * @purpose Iterate through game objects and render the objects as well as update uniforms
 */
function drawScene (gl, deltaTime, state) {
  gl.clearColor(
    state.settings.backgroundColor[0],
    state.settings.backgroundColor[1],
    state.settings.backgroundColor[2],
    1.0
  ) // Here we are drawing the background color that is saved in our state
  gl.enable(gl.DEPTH_TEST) // Enable depth testing
  gl.depthFunc(gl.LEQUAL) // Near things obscure far things
  gl.disable(gl.CULL_FACE) // Cull the backface of our objects to be more efficient
  // gl.cullFace(gl.BACK);
  // gl.frontFace(gl.CCW);
  gl.clearDepth(1.0) // Clear everything
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const lightPositionArray = []
  const lightColourArray = []
  const lightStrengthArray = []

  // initialize the light arrays here
  state.pointLights.forEach(light => {
    for (let j = 0; j < 3; j++) {
      lightPositionArray.push(light.position[j])
      lightColourArray.push(light.colour[j])
    }
    lightStrengthArray.push(light.strength)
  })

  // iterate over each object and render them
  state.objects.map(object => {
    if (object.loaded) {
      gl.useProgram(object.programInfo.program)
      {
        // Projection Matrix ....
        const projectionMatrix = mat4.create()
        const fovy = (60.0 * Math.PI) / 180.0 // Vertical field of view in radians
        const aspect = state.canvas.clientWidth / state.canvas.clientHeight // Aspect ratio of the canvas
        const near = 0.1 // Near clipping plane
        const far = 1000000.0 // Far clipping plane

        mat4.perspective(projectionMatrix, fovy, aspect, near, far)
        gl.uniformMatrix4fv(
          object.programInfo.uniformLocations.projection,
          false,
          projectionMatrix
        )
        state.projectionMatrix = projectionMatrix

        // View Matrix & Camera ....
        const viewMatrix = mat4.create()
        const camFront = vec3.fromValues(0, 0, 0)
        vec3.add(camFront, state.camera.position, state.camera.front)
        mat4.lookAt(
          viewMatrix,
          state.camera.position,
          camFront,
          state.camera.up
        )
        gl.uniformMatrix4fv(
          object.programInfo.uniformLocations.view,
          false,
          viewMatrix
        )
        gl.uniform3fv(
          object.programInfo.uniformLocations.cameraPosition,
          state.camera.position
        )
        state.viewMatrix = viewMatrix

        // Model Matrix ....
        const modelMatrix = mat4.create()
        const negCentroid = vec3.fromValues(0.0, 0.0, 0.0)
        vec3.negate(negCentroid, object.centroid)
        mat4.translate(modelMatrix, modelMatrix, object.model.position)
        mat4.translate(modelMatrix, modelMatrix, object.centroid)
        mat4.mul(modelMatrix, modelMatrix, object.model.rotation)
        mat4.scale(modelMatrix, modelMatrix, object.model.scale)
        mat4.translate(modelMatrix, modelMatrix, negCentroid)

        if (object.parent) {
          const parent = getObject(state, object.parent)
          if (parent.model && parent.model.modelMatrix) {
            mat4.multiply(modelMatrix, parent.model.modelMatrix, modelMatrix)
          }
        }

        object.model.modelMatrix = modelMatrix
        gl.uniformMatrix4fv(
          object.programInfo.uniformLocations.model,
          false,
          modelMatrix
        )

        // Normal Matrix ....
        const normalMatrix = mat4.create()
        mat4.invert(normalMatrix, modelMatrix)
        mat4.transpose(normalMatrix, normalMatrix)
        gl.uniformMatrix4fv(
          object.programInfo.uniformLocations.normalMatrix,
          false,
          normalMatrix
        )

        // Object material
        gl.uniform3fv(
          object.programInfo.uniformLocations.diffuseVal,
          object.material.diffuse
        )
        gl.uniform3fv(
          object.programInfo.uniformLocations.ambientVal,
          object.material.ambient
        )
        gl.uniform3fv(
          object.programInfo.uniformLocations.specularVal,
          object.material.specular
        )
        gl.uniform1f(
          object.programInfo.uniformLocations.nVal,
          object.material.n
        )

        gl.uniform1i(
          object.programInfo.uniformLocations.numLights,
          state.numLights
        )
        if (
          lightColourArray.length > 0 &&
          lightPositionArray.length > 0 &&
          lightStrengthArray.length > 0
        ) {
          // this currently only sends the first light to the shader, how might we do multiple? :)
          gl.uniform3fv(
            object.programInfo.uniformLocations.lightPositions,
            lightPositionArray
          )
          gl.uniform3fv(
            object.programInfo.uniformLocations.lightColours,
            lightColourArray
          )
          gl.uniform1fv(
            object.programInfo.uniformLocations.lightStrengths,
            lightStrengthArray
          )
        }

        {
          // Bind the buffer we want to draw
          gl.bindVertexArray(object.buffers.vao)

          // check for diffuse texture and apply it
          if (object.model.texture != null) {
            state.samplerExists = 1
            gl.activeTexture(gl.TEXTURE0)
            gl.uniform1i(
              object.programInfo.uniformLocations.samplerExists,
              state.samplerExists
            )
            gl.uniform1i(object.programInfo.uniformLocations.sampler, 0)
            gl.bindTexture(gl.TEXTURE_2D, object.model.texture)
          } else {
            gl.activeTexture(gl.TEXTURE0)
            state.samplerExists = 0
            gl.uniform1i(
              object.programInfo.uniformLocations.samplerExists,
              state.samplerExists
            )
          }

          // check for normal texture and apply it
          if (object.model.textureNorm != null) {
            state.samplerNormExists = 1
            gl.activeTexture(gl.TEXTURE1)
            gl.uniform1i(
              object.programInfo.uniformLocations.normalSamplerExists,
              state.samplerNormExists
            )
            gl.uniform1i(object.programInfo.uniformLocations.normalSampler, 1)
            gl.bindTexture(gl.TEXTURE_2D, object.model.textureNorm)
          } else {
            gl.activeTexture(gl.TEXTURE1)
            state.samplerNormExists = 0
            gl.uniform1i(
              object.programInfo.uniformLocations.normalSamplerExists,
              state.samplerNormExists
            )
          }

          // Draw the object
          const offset = 0 // Number of elements to skip before starting

          // if its a mesh then we don't use an index buffer and use drawArrays instead of drawElements
          if (object.type === 'mesh' || object.type === 'meshCustom') {
            gl.drawArrays(gl.TRIANGLES, offset, object.buffers.numVertices / 3)
          } else {
            gl.drawElements(
              gl.TRIANGLES,
              object.buffers.numVertices,
              gl.UNSIGNED_SHORT,
              offset
            )
          }
        }
      }
    }

    return null
  })
}
