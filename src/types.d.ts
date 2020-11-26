// adding references to outside classes makes it so that we have to add
// import('./types') to everything and I hate it
import { Cube } from "./objects/Cube";
import { CustomObject } from "./objects/CustomObject";
import { Model } from "./objects/Model";
import { Plane } from "./objects/Plane";

declare type AppState = {
    tickTimeTextElement: HTMLElement;
    renderTimeTextElement: HTMLElement;
    tickDeltaTimeTextElement: HTMLElement;
    updateTimeTextElement: HTMLElement;
    camPosTextElement: HTMLElement;
    objInfoTextElement: HTMLElement;

    selectedObjIndex: number;

    loadObjects: Array<StateFileObject>;
    pointLights: Array<StateFileLight>;
    settings: SceneSettings;
    camera: Camera;
    numberOfObjectsToLoad: number;

    gl: WebGL2RenderingContext;
    vertShaderSample: string;
    fragShaderSample: string;
    canvas: HTMLCanvasElement;
    objectCount: number;
    lightIndices: Array<any>; //appears to not be used
    keyboard?: any;
    mouse?: any;
    gameStarted: boolean;
    samplerExists: number;
    samplerNormExists: number;
    constVal: number;
    lights: Array<any>; //appears to not be used
    objects: Array<Model | Cube | Plane>;

    numLights: number;

    deltaTime: number;

    projectionMatrix: mat4;
    viewMatrix: mat4;
    samplerExists: number;
    samplerNormExists: number;
}

declare type StateFile = Array<StateFileScene>;

declare type StateFileScene = {
    objects: Array<StateFileObject>;
    pointLights: Array<StateFileLight>;
    settings: SceneSettings;
}

declare type StateFileObject = {
    name: string;
    material: StateFileMaterial;
    type: string;
    position: Array<number>; //vec3
    scale: Array<number>; //vec3
    diffuseTexture: string;
    normalTexture: string;
    rotation: Array<number>; //4x4 matrix flattened as number array
    parent?: string;
    model?: string;
    meshType?: string
    preCalcCentroid?: Array<number> //vec3
}

declare type SceneSettings = {
    backgroundColor: Array<number>; //vec3
    camera: StateFileCamera;
    sensitivity: number;
}

declare type StateFileCamera = {
    name: string;
    position: Array<number>; //vec3
    front: Array<number>; //vec3
    up: Array<number>; //vec3
    pitch: number;
    yaw: number;
    roll: number;
    moveSpeed: number;
    move: boolean;
    canvasFocused: boolean;
    rateX: number;
    rateY: number;
    keyboard: any // only seen an empty object for this
    viewMatrix: Map<string, number>; //4x4 matrix, but as a map, weird
}

declare type StateFileLight = {
    name: string;
    colour: Array<number>; //vec3
    position: Array<number>; //vec3
    strength: number;
    quadratic: number;
    linear: number;
    constant: number;
    nearPlane: number;
    farPlane: number;
    shadow: number; // possibly bool value
}

declare type StateFileMaterial = {
    diffuse: Array<number>; //vec3
    ambient: Array<number>; //vec3
    specular: Array<number>; //vec3
    n: number;
    alpha: number;
    shaderType: number;
}

declare type Camera = {
    position: vec3;
    center: vec3;
    up: vec3;
    right: vec3;
    at: vec3;
    pitch: number; // radians
    yaw: number; // radians
    nearClip: number;
    farClip: number;
}

declare type TimeStats = {
    totalElements: number
    previousTime: Float32Array
    previousElementIndex: number
    averageTime: number
}

declare type OBJMesh = {
    vertices: Array<number>;
    uvs: Array<number>;
    normals: Array<number>;
}

declare type Material = {
    diffuse: vec3;
    ambient: vec3;
    specular: vec3;
    n: number;
    alpha: number;
    shaderType: number;
}

declare type ProgramInfo = {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number;
        vertexNormal: number;
        vertexUV: number;
        vertexBitangent?: number;
    }
    uniformLocations: {
        projection: WebGLUniformLocation;
        view: WebGLUniformLocation;
        model: WebGLUniformLocation;
        normalMatrix: WebGLUniformLocation;
        diffuseVal: WebGLUniformLocation;
        ambientVal: WebGLUniformLocation;
        specularVal: WebGLUniformLocation;
        nVal: WebGLUniformLocation;
        cameraPosition: WebGLUniformLocation;
        // numLights: WebGLUniformLocation;
        lightPositions: WebGLUniformLocation;
        lightColours: WebGLUniformLocation;
        lightStrengths: WebGLUniformLocation;
        samplerExists: WebGLUniformLocation;
        sampler: WebGLUniformLocation
        normalSamplerExists?: WebGLUniformLocation;
        normalSampler?: WebGLUniformLocation;
    }
}

declare type Rigidbody = {
    pos: vec3
    drawingObj: Model | Cube | Plane
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