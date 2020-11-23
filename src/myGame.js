// @ts-check
'use strict'

// If you want to use globals here you can. Initialize them in startGame then update/change them in gameLoop

/**
 *
 * @param { AppState } state Game state
 * @usage Use this function for initializing any in game values in our state or adding event listeners
 */
export function startGame (state) {
  // this just prevents right click from opening up the context menu :)
  document.addEventListener(
    'contextmenu',
    e => {
      e.preventDefault()
    },
    false
  )

  // add mouse listeners here
}

/**
 *
 * @param { AppState } state Game state
 * @param { number } deltaTime time difference between the previous frame that was drawn and the current frame
 */
export function gameLoop (state, deltaTime) {
  // TODO - Here we can add game logic, like getting player objects, and moving them, detecting collisions, you name it. Examples of functions can be found in sceneFunctions
}
