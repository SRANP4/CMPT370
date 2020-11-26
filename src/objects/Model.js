// @ts-check
'use strict'

import { mat4, vec3 } from '../../lib/gl-matrix/index.js'
import {
  getTextures,
  asyncCalcCentroid,
  initPositionAttribute,
  initShaderProgram,
  initTextureCoords,
  initIndexBuffer,
  initNormalAttribute,
  calculateCentroid
} from '../commonFunctions.js'
import { shaderValuesErrorCheck } from '../uiSetup.js'

export class Model {
  /**
   *
   * @param {WebGL2RenderingContext} glContext
   * @param {import('../types.js').StateFileObject} object
   * @param {import('../types.js').OBJMesh} meshDetails
   */
  constructor (glContext, object, meshDetails) {
    this.gl = glContext
    /** @type {import('../types.js').Rigidbody} */
    this.rigidbody = null
    this.vertShader = ''
    this.fragShader = ''
    this.name = object.name
    this.parent = object.parent
    this.type = 'mesh'
    this.loaded = false
    this.initialTransform = {
      position: object.position,
      scale: object.scale,
      rotation: object.rotation
    }
    this.material = { ...object.material }
    this.buffers = null
    this.programInfo = null
    this.centroid =
      object.preCalcCentroid != null
        ? vec3.fromValues(
            object.preCalcCentroid[0],
            object.preCalcCentroid[1],
            object.preCalcCentroid[2]
          )
        : null
    this.model = {
      vertices: meshDetails.vertices,
      triangles: [], // no support for triangles atm
      normals: meshDetails.normals,
      uvs: meshDetails.uvs,
      bitangents: [], // models don't support bitangents atm, but we need model object data unified
      position: vec3.fromValues(0.0, 0.0, 0.0),
      rotation: mat4.create(),
      scale: vec3.fromValues(1.0, 1.0, 1.0),
      modelMatrix: mat4.create(),
      diffuseTexture: object.diffuseTexture
        ? object.diffuseTexture
        : 'default.png',
      normalTexture: object.normalTexture
        ? object.normalTexture
        : 'defaultNorm.png',
      texture: object.diffuseTexture
        ? getTextures(glContext, object.diffuseTexture)
        : null,
      textureNorm: object.normalTexture
        ? getTextures(glContext, object.normalTexture)
        : null
    }
  }

  rotate (axis, angle) {
    if (axis === 'x') {
      mat4.rotateX(this.model.rotation, this.model.rotation, angle)
    } else if (axis === 'y') {
      mat4.rotateY(this.model.rotation, this.model.rotation, angle)
    } else if (axis === 'z') {
      mat4.rotateZ(this.model.rotation, this.model.rotation, angle)
    }
  }

  scale (scaleVec) {
    // model scale
    let xVal = this.model.scale[0]
    let yVal = this.model.scale[1]
    let zVal = this.model.scale[2]

    xVal *= scaleVec[0]
    yVal *= scaleVec[1]
    zVal *= scaleVec[2]

    // need to scale bounding box
    this.model.scale = vec3.fromValues(xVal, yVal, zVal)
  }

  translate (translateVec) {
    vec3.add(
      this.model.position,
      this.model.position,
      vec3.fromValues(translateVec[0], translateVec[1], translateVec[2])
    )
  }

  lightingShader () {
    // console.log(this.model.vertices)

    const shaderProgram = initShaderProgram(
      this.gl,
      this.vertShader,
      this.fragShader
    )
    // Collect all the info needed to use the shader program.
    /** @type {import('../types').ProgramInfo} */
    const programInfo = {
      // The actual shader program
      program: shaderProgram,
      // The attribute locations. WebGL will use there to hook up the buffers to the shader program.
      // NOTE: it may be wise to check if these calls fail by seeing that the returned location is not -1.
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aPosition'),
        vertexNormal: this.gl.getAttribLocation(shaderProgram, 'aNormal'),
        vertexUV: this.gl.getAttribLocation(shaderProgram, 'aUV')
        // vertexBitangent: this.gl.getAttribLocation(shaderProgram, 'aVertBitang')
      },
      uniformLocations: {
        projection: this.gl.getUniformLocation(
          shaderProgram,
          'uProjectionMatrix'
        ),
        view: this.gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
        model: this.gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
        normalMatrix: this.gl.getUniformLocation(shaderProgram, 'normalMatrix'),
        diffuseVal: this.gl.getUniformLocation(shaderProgram, 'diffuseVal'),
        ambientVal: this.gl.getUniformLocation(shaderProgram, 'ambientVal'),
        specularVal: this.gl.getUniformLocation(shaderProgram, 'specularVal'),
        nVal: this.gl.getUniformLocation(shaderProgram, 'nVal'),
        cameraPosition: this.gl.getUniformLocation(
          shaderProgram,
          'uCameraPosition'
        ),
        // numLights: this.gl.getUniformLocation(shaderProgram, 'numLights'),
        lightPositions: this.gl.getUniformLocation(
          shaderProgram,
          'uLightPositions'
        ),
        lightColours: this.gl.getUniformLocation(
          shaderProgram,
          'uLightColours'
        ),
        lightStrengths: this.gl.getUniformLocation(
          shaderProgram,
          'uLightStrengths'
        ),
        sampler: this.gl.getUniformLocation(shaderProgram, 'uTexture'),
        samplerExists: this.gl.getUniformLocation(
          shaderProgram,
          'samplerExists'
        )
        // normalSamplerExists: this.gl.getUniformLocation(
        //   shaderProgram,
        //   'uTextureNormExists'
        // ),
        // normalSampler: this.gl.getUniformLocation(shaderProgram, 'uTextureNorm')
      }
    }
    shaderValuesErrorCheck(programInfo)
    this.programInfo = programInfo
  }

  initBuffers () {
    // create vertices, normal and indices arrays
    const positions = new Float32Array(this.model.vertices.flat())
    const normals = new Float32Array(this.model.normals.flat())
    const indices = new Uint16Array(this.model.triangles.flat())
    const textureCoords = new Float32Array(this.model.uvs.flat())
    // const bitangents = new Float32Array(this.model.bitangents.flat())

    const vertexArrayObject = this.gl.createVertexArray()
    this.gl.bindVertexArray(vertexArrayObject)

    /** @type {import('../types.js').GlBuffers} */
    this.buffers = {
      vao: vertexArrayObject,
      attributes: {
        position: initPositionAttribute(this.gl, this.programInfo, positions),
        normal: initNormalAttribute(this.gl, this.programInfo, normals),
        uv: initTextureCoords(this.gl, this.programInfo, textureCoords)
        // bitangents: initBitangentBuffer(this.gl, this.programInfo, bitangents)
      },
      indices: initIndexBuffer(this.gl, indices),
      numVertices: positions.length
    }

    this.loaded = true
    console.log(this.name + ' loaded successfully!')
  }

  // async setup () {
  //   if (this.centroid == null) {
  //     this.centroid = await asyncCalcCentroid(this.model.vertices)
  //   }
  //   this.lightingShader()
  //   this.scale(this.initialTransform.scale)
  //   this.translate(this.initialTransform.position)
  //   this.model.rotation = new Float32Array(this.initialTransform.rotation)
  //   this.initBuffers()
  // }

  setup () {
    if (this.centroid == null) {
      this.centroid = calculateCentroid(this.model.vertices)
    }
    this.lightingShader()
    this.scale(this.initialTransform.scale)
    this.translate(this.initialTransform.position)
    this.model.rotation = new Float32Array(this.initialTransform.rotation)
    this.initBuffers()
  }
}
