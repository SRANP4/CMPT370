declare type AppState = {
    lights: Array<LightComponent>,
    cameras: Array<CameraComponent>,
    rigidbodies: Array<RigidbodyComponent>

}

declare type ComponentSet<T> = {
    components: Array<T>,
    entityMap: Map<number, number>,
    bitfield: number
}

declare type CameraComponent = {
}

declare type LightComponent = {
    colour: vec3,
    strength: number
}

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