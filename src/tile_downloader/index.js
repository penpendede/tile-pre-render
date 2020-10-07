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

let verbose, xMin, xMax, yMin, yMax, zMin, zMax
let uriTemplate, outputPath, maximumNumberOfParallelDownloads
let quiet, noWrite

// Handle verbose
if (Object.hasOwnProperty.call(opt.options, 'quiet') && opt.options.quiet) {
  quiet = true
} else {
  quiet = false
}
if (Object.hasOwnProperty.call(opt.options, 'verbose') && opt.options.verbose) {
  console.info('verbose output enabled')
  verbose = true
}

if (Object.hasOwnProperty.call(opt.options, 'nowrite') && opt.options.nowrite) {
  noWrite = true
  if (verbose) {
    console.info('not actually writing files')
  }
} else {
  noWrite = false
}

// Handle URI template
if (!Object.hasOwnProperty.call(opt.options, 'uri-template')) {
  console.error('no URI template provided.')
  exit(1)
} else {
  uriTemplate = opt.options['uri-template']
  const pattern = new RegExp('https?:.*//[^[]*(\\{([a-z](-[a-z])?)+\\})?.*/\\{z\\}/\\{x\\}/\\{y\\}.*')
  if (!pattern.test(uriTemplate)) {
    console.error('unsupported URI template')
    exit(0)
  } else {
    if (verbose) {
      console.info('URI template follows accepted pattern')
    }
  }
}

// Handle output path
if (!Object.hasOwnProperty.call(opt.options, 'output-path')) {
  console.error('no output path provided.')
  exit(1)
} else {
  outputPath = opt.options['output-path']
  if (verbose) {
    console.info('output path has been provided')
  }
}

if (Object.hasOwnProperty.call(opt.options, 'parallelMaximum')) {
  maximumNumberOfParallelDownloads = Number.parseInt(opt.options.parallelMaximum)
} else {
  maximumNumberOfParallelDownloads = 4
}

const uriObject = uriTemplateToObject(uriTemplate)
if (verbose) {
  console.info('URI object:')
  console.info(uriObject)
}

try {
  if (!noWrite) {
    mkdirp.sync(outputPath)
  }
  if (verbose) {
    console.info('Creating directory "' + outputPath + '"')
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
    if (verbose) {
      console.info('Creating directory "' + subdirectory + '"')
    }
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }
  processQueue(makeQueue(xMin, yMin, xMax, yMax, zoom, uriObject, noWrite), maximumNumberOfParallelDownloads, quiet, noWrite)
}

exit(0)
