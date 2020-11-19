declare type AppState = {
    
}

declare type ComponentSet<T> = {
    components: Array<T>,
    entityMap: Map<number, number>,
    bitfield: number
}

declare type Component = {
    entityId: number
}

declare type TransformComponent  = Component & {
    position: vec3,
    rotation: vec4
}

declare type CameraComponent = Component & {
}

declare type LightComponent = Component & {
    colour: vec3,
    strength: number
}

declare type AABBColliderComponent = Component & {
    width: number,
    height: number
}

declare type SphereColliderComponent = Component & {
    radius: number
}

declare type RigidbodyComponent = Component & {
    velocity: vec3,
    gravityDirection: vec3,
    gravityStrength: number
}

declare type MeshDataComponent = Component & {
    mesh: number,
    textureId: number
}

declare type HealthComponent = Component & {
    currentHealth: number,
    maxHealth: number
}

declare type ComponentSets = {
    transforms: ComponentSet<TransformComponent>,
    cameras: ComponentSet<CameraComponent>,
    lights: ComponentSet<LightComponent>,
    meshDatas: ComponentSet<MeshDataComponent>,
    aabbColliders: ComponentSet<AABBColliderComponent>,
    sphereColliders: ComponentSet<SphereColliderComponent>,
    rigidbodies: ComponentSet<RigidbodyComponent>,
    healths: ComponentSet<HealthComponent>
}