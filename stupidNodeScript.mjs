// @ts-check
'use strict'

import fs from 'fs'
import ParseWavefrontObj from 'wavefront-obj-parser'
import expandVertexData from 'expand-vertex-data'

const objModelToParse = './models/bunny.obj'
const outputFile = './models/bunny.json'

const wavefrontString = fs.readFileSync(objModelToParse).toString('utf8')
const parsedJSON = ParseWavefrontObj(wavefrontString)

// Pass this data into your ELEMENT_ARRAY_BUFFER and ARRAY_BUFFERS
const expandedWavefront = expandVertexData(parsedJSON, {
  facesToTriangles: true
})

const outputString = JSON.stringify(expandedWavefront)
fs.writeFileSync(outputFile, outputString)
