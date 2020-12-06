// @ts-check

'use strict'

import { mat4, vec3 } from '../lib/gl-matrix/index.js'
import { loadMeshFromOBJUrl, parseSceneFile } from './commonFunctions.js'
import { fixedUpdate, startGame, update } from './myGame.js'
import { Cube } from './objects/Cube.js'
import { Model } from './objects/Model.js'
import { Plane } from './objects/Plane.js'
import { getObject } from './sceneFunctions.js'
import {
  initDebugStats,
  uiOnLoaded,
  printError,
  updateDebugStats
} from './uiSetup.js'

/*

  TODO correct rendering with rotation and position

  TODO enemy ship that moves back and forth, rotates in direction it is moving

  TODO add fire cannonball mechanic, log when collision detected with ship

  TODO transparent rendering as a layer on top of opaque rendering pass (basically just for water)

  TODO load shaders from glsl files, per object shaders

  TODO sound effects for cannon fire, cannon ball in air, cannon ball impact, ship sink
  TODO cannonball fire visual effect, cannonball impact visual effect

  TODO game mechanics lul
*/

/** @type { import('./types').AppState } */
// @ts-ignore
let state = {}

const TICK_RATE_MS = 16

// previousTicks is a circular array
// initial second of data will be bunk due to a lot of 0s in the array
/** @type { import('./types.js').TimeStats } */
const fixedUpdateTimeStats = {
  totalElements: 120, // this is configurable (120 is 2 seconds worth of ticks)
  previousTime: undefined, // this is initialized in initializeTickTimeStats as Float32Array
  previousElementIndex: 0,
  averageTime: 0
}

/** @type { import('./types.js').TimeStats } */
const updateTimeStats = {
  totalElements: 120, // this is configurable (120 is 2 seconds worth of ticks)
  previousTime: undefined, // this is initialized in initializeTickTimeStats as Float32Array
  previousElementIndex: 0,
  averageTime: 0
}

/** @type { import('./types.js').TimeStats } */
const frameTimeStats = {
  totalElements: 120, // this is configurable (120 is 2 seconds worth of ticks)
  previousTime: undefined, // this is initialized in initializeTickTimeStats as Float32Array
  previousElementIndex: 0,
  averageTime: 0
}

/** @type { import('./types.js').TimeStats } */
const deltaTimeStats = {
  totalElements: 120, // this is configurable (120 is 2 seconds worth of ticks)
  previousTime: undefined, // this is initialized in initializeTickTimeStats as Float32Array
  previousElementIndex: 0,
  averageTime: 0
}

// This function loads on window load, uses async functions to load the scene then try to render it
window.onload = async () => {
  try {
    await parseSceneFile('./statefiles/gm_scene.json', state)
    main()
  } catch (err) {
    console.error(err)
    window.alert(err)
  }
}

/**
 *
 * @param {import('./types').Mesh} mesh contains vertex, normal, uv information for the mesh to be made
 * @param {import('./types').StateFileObject} loadObject the game object that will use the mesh information
 * @purpose - Helper function called as a callback function when the mesh is done loading for the object
 */
function createMesh (mesh, loadObject) {
  const testModel = new Model(state.gl, loadObject, mesh)
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
        in vec2 aUV;
        
        uniform mat4 uProjectionMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 normalMatrix;
        uniform vec3 uCameraPosition;

        out vec3 oFragPosition;
        out vec3 oCameraPosition;
        out vec3 oNormal;
        out vec2 oUV;
        out vec3 normalInterp;

        void main() {
            // Position of the fragment in world space
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);

            oFragPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;

            oNormal = normalize((uModelMatrix * vec4(aNormal, 1.0)).xyz);
            normalInterp = vec3(normalMatrix * vec4(aNormal, 0.0));
            oCameraPosition = uCameraPosition;
            oUV = aUV;
        }
        `

  const fragShaderSample = `#version 300 es
        #define MAX_LIGHTS 20
        precision highp float;

        in vec3 oNormal;
        in vec3 oFragPosition;
        in vec3 oCameraPosition;
        in vec2 oUV;
        in vec3 normalInterp;

        uniform vec3 uLightColours;
        uniform vec3 uLightPositions;
        uniform float uLightStrengths;

        uniform vec3 diffuseVal;
        uniform vec3 ambientVal;
        uniform vec3 specularVal;
        uniform sampler2D uTexture;
        uniform float nVal;
        uniform int samplerExists;

        out vec4 fragColor;
        void main() {
          vec3 normal = normalize(normalInterp);

          // Get the direction of the light relative to the object
          //float attenuation = light.strength / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
          float scaledLightStrength = uLightStrengths / 2.0;
          vec3 lightDirection = normalize(uLightPositions - oFragPosition);
          vec3 cameraDirection = normalize(oCameraPosition - oFragPosition);

          vec4 textureColor = texture(uTexture, oUV); // NOTE: This is where the texture is accessed

          // calculate ambient term Ka * La * LightStrength
          vec3 Ka = ambientVal;
          if (samplerExists == 1) {
            //Ka = mix(ambientVal, textureColor.rgb, 0.1);
            Ka = ambientVal * textureColor.rgb;
            //Ka = ambientVal;
          }
          vec3 ambient = Ka * uLightColours * scaledLightStrength;
  
          // Diffuse term : Ld * (N dot L)
          // We don't multiply Kd for now as it changes with texture 
          // calculate diffuse term Kd*Ld*dot(N,L)
          float diff = max(dot(normal, lightDirection), 0.0);
          // calculate diffuse colour for texture and no-texture  
          vec3 Kd = diffuseVal;
          if (samplerExists == 1) {
              Kd = mix(diffuseVal, textureColor.rgb, 0.3);
              //Kd = diffuseVal * textureColor.rgb;
          }
          vec3 diffuse = Kd * uLightColours * diff;
          
          // Specular lighting
          // for better visualization leave the color white (don't mix with specular)
          // calculate specular term Ks*Ls*(H,N)^n
          vec3 halfVector = normalize(cameraDirection + lightDirection);
          float HN = abs(dot(halfVector, normal));
          float hnPow = pow(HN, nVal);
          vec3 Ks = specularVal;
          if (samplerExists == 1) {
            Ks = mix(specularVal, textureColor.rgb, 0.1);
            //Ks = specularVal * textureColor.rgb;
          }
          vec3 specular = Ks * uLightColours * hnPow;
  
          vec3 lightShading = (ambient + diffuse);
          
          fragColor = vec4(lightShading, 1.0);

          //fragColor = vec4(textureColor.rgb, 1.0);

          //fragColor = vec4(diffuseVal, 1.0);
          //fragColor = vec4(1.0, 1.0, 1.0, 1.0);
          //fragColor = vec4(normal, 1.0);
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
    constVal: 1,
    lights: [],
    objects: [],
    selectedObjIndex: 0
  }

  state.numLights = state.pointLights.length

  // iterate through the level's objects and add them
  state.loadObjects.forEach(loadObject => {
    if (loadObject.type === 'mesh') {
      loadMeshFromOBJUrl(loadObject.model, function (mesh) {
        createMesh(mesh, loadObject)
      })
    } else if (loadObject.type === 'cube') {
      const tempCube = new Cube(gl, loadObject)
      tempCube.vertShader = vertShaderSample
      tempCube.fragShader = fragShaderSample
      tempCube.setup()
      addObjectToScene(state, tempCube)
    } else if (loadObject.type === 'plane') {
      const tempPlane = new Plane(gl, loadObject)
      tempPlane.vertShader = vertShaderSample
      tempPlane.fragShader = fragShaderSample
      tempPlane.setup()
      addObjectToScene(state, tempPlane)
    }
  })

  // start rendering
  initDebugStats(state)
  initializeTimeStats()
  startRendering(state.gl, state) // now that scene is setup, start rendering it
}

/**
 *
 * @param {import('./types.js').AppState} state object containing scene values
 * @param {Model | Cube | Plane} object the object to be added to the scene
 * @purpose - Helper function for adding a new object to the scene and refreshing the GUI
 */
function addObjectToScene (state, object) {
  state.objectCount += 1
  state.objects.push(object)

  if (state.objectCount === state.loadObjects.length) {
    uiOnLoaded(state)
    startGameLogic()
  }
}

function startGameLogic () {
  console.log('Models loaded, starting game logic')
  startGame(state)
  // const now = window.performance.now()
  // runFixedUpdateLoop(now, now)
  // runUpdateLoop(now)
}

/**
 *
 */
function initializeTimeStats () {
  fixedUpdateTimeStats.previousTime = new Float32Array(
    fixedUpdateTimeStats.totalElements
  )
  updateTimeStats.previousTime = new Float32Array(updateTimeStats.totalElements)
  frameTimeStats.previousTime = new Float32Array(frameTimeStats.totalElements)
  deltaTimeStats.previousTime = new Float32Array(deltaTimeStats.totalElements)
}

/**
 *
 * @param {import('./types.js').TimeStats } statObj
 * @param {number} lastTickTime
 */
function calcTimeStats (statObj, lastTickTime) {
  statObj.previousTime[statObj.previousElementIndex] = lastTickTime
  statObj.previousElementIndex =
    (statObj.previousElementIndex + 1) % statObj.totalElements

  let sum = 0
  statObj.previousTime.forEach(element => {
    sum += element
  })

  statObj.averageTime = sum / statObj.totalElements
}

let deltaTimeSum = 0
let lastUpdateTime = 0
/**
 *
 * @param {number} now
 */
function runFixedUpdateLoop (now) {
  deltaTimeSum += now - lastUpdateTime

  if (deltaTimeSum >= TICK_RATE_MS) {
    const start = now

    state.deltaTime = deltaTimeSum
    calcTimeStats(deltaTimeStats, deltaTimeSum)
    state.tickDeltaTimeTextElement.innerText =
      'Average tick delta time: ' + deltaTimeStats.averageTime.toFixed(6) + 'ms'

    // don't hog cpu if the page isn't visible (effectively pauses the game when it
    // backgrounds)
    // NOTE: For debugging it might be useful to use hasFocus instead,
    // as the game will pause when you click into the F12 debug panel
    if (document.visibilityState === 'visible') {
      fixedUpdate(state, deltaTimeSum) // constantly call our game loop
    }

    // always pass back to the browser, even if this means a janky tick rate,
    // its more important to let the browser function properly
    // ideally this will callback immediately if we're *redline* (taking up
    // 16 ms or more per tick)
    const timeLength = window.performance.now() - start

    calcTimeStats(fixedUpdateTimeStats, timeLength)
    // update the overlay
    state.tickTimeTextElement.innerText =
      'Average fixed update time: ' +
      fixedUpdateTimeStats.averageTime.toFixed(6) +
      'ms'

    deltaTimeSum = 0
    lastUpdateTime = start
  }
}

/**
 *
 * @param {number} lastTickTime
 */
function runUpdateLoop (lastTickTime) {
  const start = window.performance.now()
  calcTimeStats(updateTimeStats, lastTickTime)
  // update the overlay
  state.updateTimeTextElement.innerText =
    'Average update time: ' + updateTimeStats.averageTime.toFixed(6) + 'ms'

  if (document.visibilityState === 'visible') {
    update(state) // constantly call our game loop
  }

  const elapsed = window.performance.now() - start
  window.setTimeout(runUpdateLoop, 0, elapsed)
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {import('./types.js').AppState} state object containing scene values
 * @purpose - Calls the drawscene per frame
 */
function startRendering (gl, state) {
  // A variable for keeping track of time between frames

  let lastFrameElapsed = 0

  // This function is called when we want to render a frame to the canvas
  function render (now) {
    // fixed update has its own stat tracking
    runFixedUpdateLoop(now)

    // Draw our scene
    const drawStart = window.performance.now()
    calcTimeStats(frameTimeStats, lastFrameElapsed)
    state.renderTimeTextElement.innerText =
      'Average frame time: ' + frameTimeStats.averageTime.toFixed(6) + 'ms'
    updateDebugStats(state)
    drawScene(gl, state)

    // Request another frame when this one is done
    window.requestAnimationFrame(render)
    lastFrameElapsed = window.performance.now() - drawStart
  }
  // Draw the scene
  window.requestAnimationFrame(render)
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {import('./types').AppState} state contains the state for the scene
 * @purpose Iterate through game objects and render the objects as well as update uniforms
 */
function drawScene (gl, state) {
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
  state.objects.forEach(object => {
    if (!object.loaded) {
      return // equivalent of a continue in this loop
    }

    gl.useProgram(object.programInfo.program)

    // Projection Matrix ....
    const projectionMatrix = mat4.create()
    const fovy = (60.0 * Math.PI) / 180.0 // Vertical field of view in radians
    const aspect = state.canvas.clientWidth / state.canvas.clientHeight // Aspect ratio of the canvas
    const near = state.camera.nearClip // Near clipping plane
    const far = state.camera.farClip // Far clipping plane

    mat4.perspective(projectionMatrix, fovy, aspect, near, far)
    gl.uniformMatrix4fv(
      object.programInfo.uniformLocations.projection,
      false,
      projectionMatrix
    )
    state.projectionMatrix = projectionMatrix

    // View Matrix & Camera ....
    const viewMatrix = mat4.create()
    mat4.lookAt(
      viewMatrix,
      state.camera.position,
      state.camera.center,
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
      if (parent != null && parent.model && parent.model.modelMatrix) {
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
    gl.uniform1f(object.programInfo.uniformLocations.nVal, object.material.n)

    // gl.uniform1i(object.programInfo.uniformLocations.numLights, state.numLights)

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
      state.samplerExists = 0
      gl.uniform1i(
        object.programInfo.uniformLocations.samplerExists,
        state.samplerExists
      )
    }

    // check for normal texture and apply it
    // if (object.model.textureNorm != null) {
    //   state.samplerNormExists = 1
    //   gl.activeTexture(gl.TEXTURE1)
    //   gl.uniform1i(
    //     object.programInfo.uniformLocations.normalSamplerExists,
    //     state.samplerNormExists
    //   )
    //   gl.uniform1i(object.programInfo.uniformLocations.normalSampler, 1)
    //   gl.bindTexture(gl.TEXTURE_2D, object.model.textureNorm)
    // } else {
    //   gl.activeTexture(gl.TEXTURE1)
    //   state.samplerNormExists = 0
    //   gl.uniform1i(
    //     object.programInfo.uniformLocations.normalSamplerExists,
    //     state.samplerNormExists
    //   )
    // }

    // Bind the buffer we want to draw
    gl.bindVertexArray(object.buffers.vao)

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
  })

  const glError = gl.getError()
  if (glError !== gl.NO_ERROR) {
    console.error('glError: ' + glError.toString())
  }
}
