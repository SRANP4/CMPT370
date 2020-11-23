declare type AppState = {
    // lights: Array<LightComponent>,
    // cameras: Array<CameraComponent>,
    // rigidbodies: Array<RigidbodyComponent>

    tickTimeTextElement?: HTMLElement;
    renderTimeTextElement?: HTMLElement;
    tickDeltaTimeTextElement?: HTMLElement;

    loadObjects: Array<StateFileObject>;
    pointLights: Array<StateFileLight>;
    settings: SceneSettings;
    camera: StateFileCamera;
    numberOfObjectsToLoad: number;


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
    parent: ?string;
    model: ?string;
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

declare type OBJMesh = {
    vertices: Array<number>;
    uvs: Array<number>;
    normals: Array<number>;
}

declare type DrawingObject = {
    name: string;
    material: StateFileMaterial;
    type: string;
    position: Array<number>; //vec3
    scale: Array<number>; //vec3
    diffuseTexture: string;
    normalTexture: string;
    rotation: Array<number>; //4x4 matrix flattened as number array
    parent: ?string;
    model: ?string;
}

declare type Material = {
    diffuse: vec3;
    ambient: vec3;
    specular: vec3;
    n: number;
    alpha: number;
    shaderType: number;
}

declare type BoundingBox = {
    xMin: number,
    yMin: number,
    zMin: number,
    xMax: number,
    yMax: number,
    zMax: number
}

declare type ProgramInfo = {

}

declare type ComponentSet<T> = {
    components: Array<T>,
    entityMap: Map<number, number>,
    bitfield: number
}

// declare type LightComponent = {
//     colour: vec3,
//     strength: number
// }

declare type AABBCollider = {
    width: number,
    height: number
}

declare type SphereCollider = {
    radius: number
}

declare type RigidbodyComponent = {
    velocity: vec3,
    gravityDirection: vec3,
    gravityStrength: number,
    aabbColliders: Array<AABBCollider>,
    sphereColliders: Array<SphereCollider>
}

declare type MeshDataComponent = {
    mesh: number,
    textureId: number
}

declare type HealthComponent = {
    currentHealth: number,
    maxHealth: number
}