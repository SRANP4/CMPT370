// @ts-check
'use strict'

import { printError } from './uiSetup.js'
import { vec3 } from '../lib/gl-matrix/index.js'
import { OBJLoader } from '../lib/three-object-loader.js'
import { initCameraFromStatefile } from './cameraFunctions.js'

/**
 * @param  {WebGL2RenderingContext} gl WebGL2 Context
 * @param  {string} vsSource Vertex shader GLSL source code
 * @param  {string} fsSource Fragment shader GLSL source code
 * @returns {WebGLProgram} A shader program object. This is `null` on failure
 */
export function initShaderProgram (gl, vsSource, fsSource) {
  // Use our custom function to load and compile the shader objects
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  // Create the shader program by attaching and linking the shader objects
  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    window.alert(
      'Unable to link the shader program' + gl.getProgramInfoLog(shaderProgram)
    )
    return null
  }

  return shaderProgram
}

/**
 * Loads a shader from source into a shader object. This should later be linked into a program.
 * @param  {WebGL2RenderingContext} gl WebGL2 context
 * @param  {number} type Type of shader. Typically either VERTEX_SHADER or FRAGMENT_SHADER
 * @param  {string} source GLSL source code
 */
export function loadShader (gl, type, source) {
  // Create a new shader object
  const shader = gl.createShader(type)

  // Send the source to the shader object
  gl.shaderSource(shader, source)

  // Compile the shader program
  gl.compileShader(shader)

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Fail with an error message
    let typeStr = ''
    if (type === gl.VERTEX_SHADER) {
      typeStr = 'VERTEX'
    } else if (type === gl.FRAGMENT_SHADER) {
      typeStr = 'FRAGMENT'
    }
    printError(
      'An error occurred compiling the shader: ' + typeStr,
      gl.getShaderInfoLog(shader)
    )
    gl.deleteShader(shader)
    return null
  }

  return shader
}

/**
 *
 * @param {Array<number>} vertices array of x,y,z vertices (flattened)
 * @param {=} cb callback function (not passed any params)
 */
export function calculateCentroid (vertices, cb) {
  const center = vec3.fromValues(0.0, 0.0, 0.0)
  for (let t = 0; t < vertices.length; t += 3) {
    vec3.add(
      center,
      center,
      vec3.fromValues(vertices[t], vertices[t + 1], vertices[t + 2])
    )
  }
  vec3.scale(center, center, 1 / (vertices.length / 3))

  if (cb) {
    cb()
    return center
  } else {
    return center
  }
}

/**
 *
 * @param {number} angle angle in degrees
 * @returns {number} angle in radians
 */
export function toRadians (angle) {
  return angle * (Math.PI / 180)
}
/**
 *
 * @param {vec3} center
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function doAsyncCalc (center, x, y, z) {
  return new Promise((resolve, reject) => {
    vec3.add(center, center, vec3.fromValues(x, y, z))
    resolve(center)
  })
}

/**
 *
 * @param {number[]} vertices
 * @return {Promise<vec3>}
 */
export function asyncCalcCentroid (vertices) {
  return new Promise((resolve, reject) => {
    const center = vec3.fromValues(0.0, 0.0, 0.0)
    for (let t = 0; t < vertices.length; t += 3) {
      vec3.add(
        center,
        center,
        vec3.fromValues(vertices[t], vertices[t + 1], vertices[t + 2])
      )
    }
    vec3.scale(center, center, 1 / (vertices.length / 3))
    // const center = vec3.fromValues(0.0, 0.0, 0.0)
    // const promises = []
    // for (let t = 0; t < vertices.length; t += 3) {
    //   promises.push(
    //     doAsyncCalc(center, vertices[t], vertices[t + 1], vertices[t + 2])
    //   )
    // }
    // Promise.all(promises)
    //   .then(() => {
    //     vec3.scale(center, center, 1 / (vertices.length / 3))
    //     resolve(center)
    //   })
    //   .catch(err => {
    //     reject(err)
    //   })
    resolve(center)
  })
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {import('./types.js').ProgramInfo} programInfo
 * @param {Float32Array} positionArray
 */
export function initPositionAttribute (gl, programInfo, positionArray) {
  // Create a buffer for the positions.
  const positionBuffer = gl.createBuffer()

  // Select the buffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(
    gl.ARRAY_BUFFER, // The kind of buffer this is
    positionArray, // The data in an Array object
    gl.STATIC_DRAW // We are not going to change this data, so it is static
  )

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 3 // pull out 3 values per iteration, ie vec3
    const type = gl.FLOAT // the data in the buffer is 32bit floats
    const normalize = false // don't normalize between 0 and 1
    const stride = 0 // how many bytes to get from one set of values to the next
    // Set stride to 0 to use type and numComponents above
    const offset = 0 // how many bytes inside the buffer to start from

    // Set the information WebGL needs to read the buffer properly
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    )
    // Tell WebGL to use this attribute
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
  }

  return positionBuffer
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {import('./types.js').ProgramInfo} programInfo
 * @param {Float32Array} normalArray
 */
export function initNormalAttribute (gl, programInfo, normalArray) {
  // Create a buffer for the positions.
  const normalBuffer = gl.createBuffer()

  // Select the buffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(
    gl.ARRAY_BUFFER, // The kind of buffer this is
    normalArray, // The data in an Array object
    gl.STATIC_DRAW // We are not going to change this data, so it is static
  )

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 3 // pull out 4 values per iteration, ie vec3
    const type = gl.FLOAT // the data in the buffer is 32bit floats
    const normalize = false // don't normalize between 0 and 1
    const stride = 0 // how many bytes to get from one set of values to the next
    // Set stride to 0 to use type and numComponents above
    const offset = 0 // how many bytes inside the buffer to start from

    // Set the information WebGL needs to read the buffer properly
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
      numComponents,
      type,
      normalize,
      stride,
      offset
    )
    // Tell WebGL to use this attribute
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal)
  }

  return normalBuffer
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {import('./types.js').ProgramInfo} programInfo
 * @param {Float32Array} textureCoords
 */
export function initTextureCoords (gl, programInfo, textureCoords) {
  if (textureCoords != null && textureCoords.length > 0) {
    // Create a buffer for the positions.
    const textureCoordBuffer = gl.createBuffer()

    // Select the buffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(
      gl.ARRAY_BUFFER, // The kind of buffer this is
      textureCoords, // The data in an Array object
      gl.STATIC_DRAW // We are not going to change this data, so it is static
    )

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 2
      const type = gl.FLOAT // the data in the buffer is 32bit floats
      const normalize = false // don't normalize between 0 and 1
      const stride = 0 // how many bytes to get from one set of values to the next
      // Set stride to 0 to use type and numComponents above
      const offset = 0 // how many bytes inside the buffer to start from

      // Set the information WebGL needs to read the buffer properly
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexUV,
        numComponents,
        type,
        normalize,
        stride,
        offset
      )
      // Tell WebGL to use this attribute
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexUV)
    }

    // TODO: Create and populate a buffer for the UV coordinates

    return textureCoordBuffer
  }
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {import('./types.js').ProgramInfo} programInfo
 * @param {Float32Array} bitangents
 */
export function initBitangentBuffer (gl, programInfo, bitangents) {
  if (bitangents != null && bitangents.length > 0) {
    // Create a buffer for the positions.
    const bitangentBuffer = gl.createBuffer()

    // Select the buffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer)

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(
      gl.ARRAY_BUFFER, // The kind of buffer this is
      bitangents, // The data in an Array object
      gl.STATIC_DRAW // We are not going to change this data, so it is static
    )

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 3
      const type = gl.FLOAT // the data in the buffer is 32bit floats
      const normalize = false // don't normalize between 0 and 1
      const stride = 0 // how many bytes to get from one set of values to the next
      // Set stride to 0 to use type and numComponents above
      const offset = 0 // how many bytes inside the buffer to start from

      // Set the information WebGL needs to read the buffer properly
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexBitangent,
        numComponents,
        type,
        normalize,
        stride,
        offset
      )
      // Tell WebGL to use this attribute
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexBitangent)
    }

    // TODO: Create and populate a buffer for the UV coordinates

    return bitangentBuffer
  }
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {Uint16Array} elementArray
 */
export function initIndexBuffer (gl, elementArray) {
  // Create a buffer for the positions.
  const indexBuffer = gl.createBuffer()

  // Select the buffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER, // The kind of buffer this is
    elementArray, // The data in an Array object
    gl.STATIC_DRAW // We are not going to change this data, so it is static
  )

  return indexBuffer
}

/**
 *
 * @param {CallableFunction} cb callback, is passed the json data
 * @param {string} filePath
 */
export function loadJSONFile (cb, filePath) {
  window
    .fetch(filePath)
    .then(data => {
      return data.json()
    })
    .then(jData => {
      cb(jData)
    })
    .catch(err => {
      console.error(err)
    })
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {string} imgPath
 */
export function getTextures (gl, imgPath) {
  const fullpath = '/materials/' + imgPath
  if (imgPath) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 0, 0, 255])
    ) // red

    const image = new window.Image()

    image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    }

    image.src = fullpath
    return texture
  }
}

/**
 *
 * @param {string} objFileURL
 * @param {CallableFunction} cb
 * @param {import('./types').StateFileObject} loadObject
 */
export function parseOBJFileToJSON (objFileURL, cb, loadObject) {
  window
    .fetch('/models/' + objFileURL)
    .then(data => {
      return data.text()
    })
    .then(text => {
      /** @type {import('./types.js').OBJMesh} */
      const mesh = OBJLoader.prototype.parse(text)
      cb(mesh, loadObject)
    })
    .catch(err => {
      console.error(err)
    })
}

/**
 *
 * @param {string} hex hex value of color (string of 6 characters, valid numbers)
 * @return {Array<Number>} array of 3 floats representing the colour value
 */
export function hexToRGB (hex) {
  const r = hex.substring(1, 3)
  const g = hex.substring(3, 5)
  const b = hex.substring(5, 7)
  const rNum = parseInt(r, 16)
  const gNum = parseInt(g, 16)
  const bNum = parseInt(b, 16)
  return [rNum / 255, gNum / 255, bNum / 255]
}

/**
 *
 * @param {string} file
 * @param {import('./types').AppState} state
 */
export function parseSceneFile (file, state) {
  return new Promise((resolve, reject) => {
    window
      .fetch(file)
      .then(data => {
        return /** @type {Promise<import('./types.js').StateFile>} */ (data.json())
      })
      .then((jData) /** @type {StateFile} */ => {
        state.loadObjects = jData[0].objects
        state.pointLights = jData[0].pointLights
        state.settings = jData[0].settings
        state.camera = initCameraFromStatefile(state.settings.camera)
        state.numberOfObjectsToLoad = jData[0].objects.length
        resolve()
      })
      .catch(err => {
        reject(err)
      })
  })
}
