// @ts-check
'use strict'

/**
 *
 * @param {ProgramInfo} programInfo
 */
export function shaderValuesErrorCheck (programInfo) {
  const missing = []
  // do attrib check
  Object.keys(programInfo.attribLocations).map(attrib => {
    if (programInfo.attribLocations[attrib] === -1) {
      missing.push(attrib)
    }
    return null
  })
  // do uniform check
  Object.keys(programInfo.uniformLocations).map(attrib => {
    if (!programInfo.uniformLocations[attrib]) {
      missing.push(attrib)
    }

    return null
  })

  if (missing.length > 0) {
    printError(
      'Shader Location Error',
      'One or more of the uniform and attribute variables in the shaders could not be located or is not being used : ' +
        missing
    )
  }
}

/**
 * A custom error function. The tag with id `webglError` must be present
 * @param  {string} tag Main description
 * @param  {string} errorStr Detailed description
 */
export function printError (tag, errorStr) {
  // Create a HTML tag to display to the user
  const errorTag = document.createElement('div')
  errorTag.classList.add('alert', 'alert-danger')
  errorTag.innerHTML = '<strong>' + tag + '</strong><p>' + errorStr + '</p>'

  // Insert the tag into the HTML document
  document.getElementById('webglError').appendChild(errorTag)

  // Print to the console as well
  console.error(tag + ': ' + errorStr)
}
