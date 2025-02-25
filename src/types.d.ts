/* eslint-disable */
// adding references to outside classes makes it so that we have to add
// import('./types') to everything and I hate it
import { GameObject } from './gameObject.js'
import { Cube } from './objects/Cube.js'
import { Model } from './objects/Model.js'
import { Plane } from './objects/Plane.js'

declare type AppState = {
  startTime: number
  simulationStatusTextElement: HTMLElement
  tickTimeTextElement: HTMLElement
  renderTimeTextElement: HTMLElement
  tickDeltaTimeTextElement: HTMLElement
  camPosTextElement: HTMLElement
  objInfoTextElement: HTMLElement

  selectedObjIndex: number

  loadObjects: StateFileObject[]
  pointLights: StateFileLight[]
  settings: SceneSettings
  camera: Camera
  numberOfObjectsToLoad: number

  gl: WebGL2RenderingContext
  vertShaderSample: string
  fragShaderSample: string
  canvas: HTMLCanvasElement
  objectCount: number
  lightIndices: any[] // appears to not be used
  keyboard?: any
  mouse?: any
  gameStarted: boolean
  samplerExists: number
  samplerNormExists: number
  constVal: number
  lights: any[] // appears to not be used
  objects: Array<Model | Cube | Plane>

  numLights: number

  deltaTime: number

  projectionMatrix: mat4
  viewMatrix: mat4
  // samplerExists: number
  // samplerNormExists: number
  statsEnabled: boolean
}

declare type StateFile = StateFileScene[]

declare type StateFileScene = {
  objects: StateFileObject[]
  pointLights: StateFileLight[]
  settings: SceneSettings
}

declare type StateFileObject = {
  name: string
  material: StateFileMaterial
  type: string
  position: number[] // vec3
  scale: number[] // vec3
  diffuseTexture: string
  normalTexture: string
  rotation: number[] // 4x4 matrix flattened as number array
  parent?: string
  model?: string
  meshType?: string
  preCalcCentroid?: number[] // vec3
}

declare type SceneSettings = {
  backgroundColor: number[] // vec3
  camera: StateFileCamera
  sensitivity: number
}

declare type StateFileCamera = {
  name: string
  position: number[] // vec3
  front: number[] // vec3
  up: number[] // vec3
  pitch: number
  yaw: number
  roll: number
  moveSpeed: number
  move: boolean
  canvasFocused: boolean
  rateX: number
  rateY: number
  keyboard: any // only seen an empty object for this
  viewMatrix: Map<string, number> // 4x4 matrix, but as a map, weird
}

declare type StateFileLight = {
  name: string
  colour: number[] // vec3
  position: number[] // vec3
  strength: number
  quadratic: number
  linear: number
  constant: number
  nearPlane: number
  farPlane: number
  shadow: number // possibly bool value
}

declare type StateFileMaterial = {
  diffuse: number[] // vec3
  ambient: number[] // vec3
  specular: number[] // vec3
  n: number
  alpha: number
  shaderType: number
}

declare type Camera = {
  name: String
  position: vec3
  center: vec3
  up: vec3
  right: vec3
  at: vec3
  pitch: number // radians
  yaw: number // radians
  nearClip: number
  farClip: number
}

declare type TimeStats = {
  totalElements: number
  previousTime: Float32Array
  previousElementIndex: number
  averageTime: number
}

declare type OBJMesh = {
  vertices: number[]
  uvs: number[]
  normals: number[]
}

declare type Mesh = {
  vertices: Float32Array
  uvs: Float32Array
  normals: Float32Array
  centroid: vec3
}

declare type Material = {
  diffuse: vec3
  ambient: vec3
  specular: vec3
  n: number
  alpha: number
  shaderType: number
}

declare type ProgramInfo = {
  program: WebGLProgram
  attribLocations: {
    vertexPosition: number
    vertexNormal: number
    vertexUV: number
    vertexBitangent?: number
  }
  uniformLocations: {
    projection: WebGLUniformLocation
    view: WebGLUniformLocation
    model: WebGLUniformLocation
    normalMatrix: WebGLUniformLocation
    diffuseVal: WebGLUniformLocation
    ambientVal: WebGLUniformLocation
    specularVal: WebGLUniformLocation
    nVal: WebGLUniformLocation
    alphaVal: WebGLUniformLocation
    cameraPosition: WebGLUniformLocation
    // numLights: WebGLUniformLocation
    lightPositions: WebGLUniformLocation
    lightColours: WebGLUniformLocation
    lightStrengths: WebGLUniformLocation
    samplerExists: WebGLUniformLocation
    sampler: WebGLUniformLocation
    normalSamplerExists?: WebGLUniformLocation
    normalSampler?: WebGLUniformLocation
  }
}

declare type GlBuffers = {
  vao: WebGLVertexArrayObject
  indices: WebGLBuffer
  numVertices: number
  attributes: {
    position: WebGLBuffer
    normal: WebGLBuffer
    uv: WebGLBuffer
  }
}

declare type Rigidbody = {
  pos: vec3
  drawingObj: Model | Cube | Plane
  gameObject: GameObject
  collisionCallback: CallableFunction
  velocity: vec3
  drag: vec3
  gravityDirection: vec3
  gravityStrength: number
  collider: Sphere | BoundingBox
}

declare type BoundingBox = {
  colliderType: number
  xMin: number
  yMin: number
  zMin: number
  xMax: number
  yMax: number
  zMax: number
}

declare type Sphere = {
  colliderType: number
  pos: vec3
  radius: number
}
/* eslint-enable */
