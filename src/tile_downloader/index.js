const { exit } = require('process')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const { makeQueue } = require('../lib/makeQueue')
const { processQueue } = require('../lib/processQueue')
const { uriTemplateToObject } = require('../lib/uriTemplateToObject')
const { args } = require('./cliArgs')

const opt = require('node-getopt').create(args)
  .bindHelp()
  .parseSystem()

let xMin, xMax, yMin, yMax, zMin, zMax
let uriTemplate, outputPath, maximumNumberOfParallelDownloads
let quiet, noWrite

const uriObject = uriTemplateToObject(uriTemplate)

try {
  if (!noWrite) {
    mkdirp.sync(outputPath)
  }
} catch (e) {
  if (e.code !== 'EEXIST') {
    throw e
  }
}

for (let zoom = zMin; zoom <= zMax; zoom++) {
  const subdirectory = path.join(outputPath, '' + zoom)
  try {
    if (!noWrite) {
      fs.mkdirSync(subdirectory)
    }
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }
  processQueue(makeQueue(xMin, yMin, xMax, yMax, zoom, uriObject, noWrite), maximumNumberOfParallelDownloads, quiet, noWrite)
}

exit(0)
