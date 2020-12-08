// @ts-check
'use strict'

/* eslint-disable */
import { printError } from './uiSetup.js'
import { mat4, quat, vec3 } from '../lib/gl-matrix/index.js'
import { OBJLoader } from '../lib/three-object-loader.js'
import { initCameraFromStatefile } from './cameraFunctions.js'
/* eslint-enable */

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
 * @param {Float32Array} vertices array of x,y,z vertices (flattened)
 * @param {CallableFunction=} cb callback function (not passed any params)
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

export function toDegrees (radians) {
  return radians * (180 / Math.PI)
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

// used in the parseOBJFileToJSON below, just caches loaded meshes to remove redundant mesh loading
const loadedMeshes = {}

/** @type {Map<string, Array<CallableFunction>> } */
const callbackQueue = new Map()

/**
 *
 * @param {string} objFileURL
 * @param {CallableFunction} cb returns Mesh object via the callback
 */
export function loadMeshFromOBJUrl (objFileURL, cb) {
  if (loadedMeshes[objFileURL] !== undefined) {
    cb(loadedMeshes[objFileURL])
    return
  }

  // make sure we're not already fetching the model
  if (callbackQueue.get(objFileURL) !== undefined) {
    callbackQueue.get(objFileURL).push(cb)
  } else {
    // create the queue, and add the callback to it
    callbackQueue.set(objFileURL, [cb])

    // start the fetch for this queue
    window
      .fetch('/models/' + objFileURL)
      .then(data => {
        return data.text()
      })
      .then(text => {
        /** @type {import('./types.js').OBJMesh} */
        const jsonMesh = OBJLoader.prototype.parse(text)
        /** @type {import('./types.js').Mesh} */
        const mesh = {
          vertices: new Float32Array(jsonMesh.vertices.flat()),
          normals: new Float32Array(jsonMesh.normals.flat()),
          uvs: new Float32Array(jsonMesh.uvs.flat()),
          centroid: undefined
        }
        mesh.centroid = calculateCentroid(mesh.vertices)

        loadedMeshes[objFileURL] = mesh

        // do all the callbacks that got queued for this fetch
        callbackQueue.get(objFileURL).forEach(callback => {
          callback(mesh)
        })

        // remove the queue so that we don't callback things that were already
        // called back
        callbackQueue.delete(objFileURL)
      })
      .catch(err => {
        console.error(err)
      })
  }
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
        state.camera = initCameraFromStatefile(state.settings.camera[1])
        state.numberOfObjectsToLoad = jData[0].objects.length
        resolve()
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * 
 * @param {number} yaw yaw rotation (y axis) in degrees
 * @param {number} pitch pitch rotation (x axis) in degrees
 * @param {number} roll pitch rotation (z axis) in degrees
 * @param {mat4} mat out matrix, the matrix to apply the rotation to
 */
export function setRotationMatrixFromEuler (yaw, pitch, roll, mat) {
  let q = quat.create()
  quat.fromEuler(q, pitch, yaw, roll)
  mat4.fromQuat(mat, q)
}

/**
 * @param {mat4} rot
 * @returns {vec3} euler angles (pitch, yaw, roll)
 */
export function rotationMatrixToEulerAngles (rot) {
  const out = vec3.create()
  const q = quat.create()
  mat4.getRotation(q, rot)

  getEuler(out, q)

  return out
}

/**
 * NOT MY CODE FROM https://github.com/toji/gl-matrix/issues/329
 * Returns an euler angle representation of a quaternion (it kinda works :/)
 * @param  {vec3} out Euler angles, pitch-yaw-roll
 * @param  {quat} quat Quaternion
 * @return {vec3} out
 */
export function getEuler (out, quat) {
  const x = quat[0]
  const y = quat[1]
  const z = quat[2]
  const w = quat[3]
  const x2 = x * x
  const y2 = y * y
  const z2 = z * z
  const w2 = w * w
  const unit = x2 + y2 + z2 + w2
  const test = x * w - y * z
  if (test > 0.499995 * unit) {
    // TODO: Use glmatrix.EPSILON
    // singularity at the north pole
    out[0] = Math.PI / 2
    out[1] = 2 * Math.atan2(y, x)
    out[2] = 0
  } else if (test < -0.499995 * unit) {
    // TODO: Use glmatrix.EPSILON
    // singularity at the south pole
    out[0] = -Math.PI / 2
    out[1] = 2 * Math.atan2(y, x)
    out[2] = 0
  } else {
    out[0] = Math.asin(2 * (x * z - w * y))
    out[1] = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2))
    out[2] = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2))
  }
  // TODO: Return them as degrees and not as radians
  return out
}

/**
 * Gets a random int between (inclusive) the min and max values given
 * @param {number} min integer value smaller than the max value
 * @param {number} max integer value larger than the min value
 * @returns {number}
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
}