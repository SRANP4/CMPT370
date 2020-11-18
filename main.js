// @ts-check
'use strict'

// useful references:
// collision: https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection

/*
three tiers of objects
  actor: move, physics, complex scripting, visual, audio
  pawn: physics, visual, audio, simple scripting
  prop: visual, audio
*/

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

  // Set clear colour
  // This is a Red-Green-Blue-Alpha colour
  // See https://en.wikipedia.org/wiki/RGB_color_model
  // Here we use floating point values. In other places you may see byte representation (0-255).
  webGLContext.clearColor(0.0, 0.0, 0.0, 1.0)

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
