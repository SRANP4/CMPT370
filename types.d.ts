declare type AppState = {
}

declare type ComponentSet<T> = {
    components: Array<T>,
    entityMap: Map<number, number>
}

declare type TransformComponent = {
    position: vec3,
    rotation: vec4
}

declare type HealthComponent = {
    currentHealth: number,
    maxHealth: number
}

declare type ComponentSets = {
    transforms: ComponentSet<TransformComponent>,
    healths: ComponentSet<HealthComponent>
}