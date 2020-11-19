// @ts-check
'use strict'

import { vec3, vec4 } from './lib/gl-matrix/index.js'

// useful references:
// collision: https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection

/*
three tiers of objects
  actor: move, physics, complex scripting, visual, audio
  pawn: physics, visual, audio, simple scripting
  prop: visual, audio
*/

/*
  load things (models, textures, config data, shaders)

  init app state??
  init drawing objects?

  main loop

  update physics
    - update velocity and gravity
    - check for collisions
    - send events for collisions (queue for scripts to pick up)
      - includes collision info (entity id of other collider???)
  update system components
  poll inputs
  update 'scripts'

*/

// const appState = {
//   camera: {},
//   lights: [],
//   actors: [],
//   props: [],
//   bounce: true
// }

const TICK_RATE_MS = 16

const appState = {
  debugValue: 0,
  debugTextElement: undefined
}

// previousTicks is a circular array
// initial second of data will be bunk due to a lot of 0s in the array
const tickTimeStats = {
  totalTicks: 120, // this is configurable (120 is 2 seconds worth of ticks)
  previousTicks: undefined, // this is initialized in initializeTickTimeStats as Float32Array
  previousTicksIndex: 0,
  averageTickRate: 0
}

main()

function main () {
  console.log('hi')
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector('#canvas')

  const webGLContext = /** @type {WebGL2RenderingContext} */ (canvas.getContext(
    'webgl2'
  ))

  if (webGLContext === null) {
    console.log('Failed to acquire the webgl 2 context')
  }

  webGLContext.canvas.width = 1000
  webGLContext.canvas.height = 750

  appState.debugTextElement = /** @type {HTMLElement} */ (document.querySelector(
    '#debug_text'
  ))
  appState.debugTextElement.innerText = appState.debugValue.toString()

  // TODO: load meshes and textures, assign data to appropriate components

  loadStuff()

  initializeGlStuff(webGLContext)

  initializeTickTimeStats()
  runSimulationLoop(0)
  startRendering(webGLContext)
}

function loadStuff () {}

function initializeGlStuff (webGLContext) {}

function initializeTickTimeStats () {
  tickTimeStats.previousTicks = new Float32Array(tickTimeStats.totalTicks)
}

function runSimulationLoop (lastTickTime) {
  const start = window.performance.now()
  updateTickRateStats(lastTickTime)

  // don't hog cpu if the page isn't visible (effectively pauses the game when it
  // backgrounds)
  // NOTE: For debugging it might be useful to use hasFocus instead,
  // as the game will pause when you click into the F12 debug panel
  if (document.visibilityState === 'visible') {
    simulate(lastTickTime)
  }

  // always pass back to the browser, even if this means a janky tick rate,
  // its more important to let the browser function properly
  // ideally this will callback immediately if we're *redline* (taking up
  // 16 ms or more per tick)
  const elapsed = window.performance.now() - start
  window.setTimeout(
    runSimulationLoop,
    Math.max(0, TICK_RATE_MS - elapsed),
    elapsed
  )
}

function updateTickRateStats (lastTickTime) {
  tickTimeStats.previousTicks[tickTimeStats.previousTicksIndex] = lastTickTime
  tickTimeStats.previousTicksIndex =
    (tickTimeStats.previousTicksIndex + 1) % tickTimeStats.totalTicks

  let sum = 0
  tickTimeStats.previousTicks.forEach(element => {
    sum += element
  })

  tickTimeStats.averageTickRate = sum / tickTimeStats.totalTicks
}

function simulate (lastTickTime) {
  appState.debugValue += 1
  appState.debugTextElement.innerText =
    'Average tick time: ' +
    tickTimeStats.averageTickRate.toFixed(6).toString() +
    'ms'
}

function startRendering (webGLContext) {
  // A variable for keeping track of time between frames
  let then = 0.0

  // This function is called when we want to render a frame to the canvas
  function render (now) {
    now *= 0.001 // convert to seconds
    const deltaTime = now - then
    then = now

    // Draw our scene
    drawScene(webGLContext, deltaTime)

    // Request another frame when this one is done
    window.requestAnimationFrame(render)
  }

  // Draw the scene
  window.requestAnimationFrame(render)
}

function drawScene (webGLContext, deltaTime) {
  // Set clear colour
  // This is a Red-Green-Blue-Alpha colour
  // See https://en.wikipedia.org/wiki/RGB_color_model
  // Here we use floating point values. In other places you may see byte representation (0-255).
  webGLContext.clearColor(1.0, 0.0, 0.0, 1.0)

  // Depth testing allows WebGL to figure out what order to draw our objects such that the look natural.
  // We want to draw far objects first, and then draw nearer objects on top of those to obscure them.
  // To determine the order to draw, WebGL can test the Z value of the objects.
  // The z-axis goes out of the screen
  webGLContext.enable(webGLContext.DEPTH_TEST) // Enable depth testing
  webGLContext.depthFunc(webGLContext.LEQUAL) // Near things obscure far things
  webGLContext.clearDepth(1.0) // Clear everything

  // Clear the color and depth buffer with specified clear colour.
  // This will replace everything that was in the previous frame with the clear colour.
  webGLContext.clear(
    webGLContext.COLOR_BUFFER_BIT | webGLContext.DEPTH_BUFFER_BIT
  )

  // draw objects here
}
