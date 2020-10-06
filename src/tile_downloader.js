const { exit } = require('process')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const proj4 = require('proj4')
const { makeQueue } = require('./makeQueue')
const { processQueue } = require('./processQueue')
const { uriTemplateToObject } = require('./uriTemplateToObject')
const { args } = require('./tile_downloader_cliArgs')

const opt = require('node-getopt').create(args)
  .bindHelp()
  .parseSystem()

let verbose, xMin, xMax, yMin, yMax, zMin, zMax
let uriTemplate, outputPath, projection, maximumNumberOfParallelDownloads
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

// Handle y-min
if (!Object.hasOwnProperty.call(opt.options, 'y-min')) {
  console.error('no lower limit for latitude provided.')
  exit(1)
} else {
  yMin = Number.parseFloat(opt.options['y-min'])
  if (Number.isNaN(yMin)) {
    console.error('lower limit for latitude cannot be parsed as a number.')
    exit(1)
  }
  if (verbose) {
    console.info('lower limit for latitude: ' + yMin)
  }
}

// Handle y-max
if (!Object.hasOwnProperty.call(opt.options, 'y-max')) {
  console.error('no upper limit for latitude provided.')
  exit(1)
} else {
  yMax = Number.parseFloat(opt.options['y-max'])
  if (Number.isNaN(yMax)) {
    console.error('upper limit for latitude cannot be parsed as a number.')
    exit(1)
  }
  if (verbose) {
    console.info('upper limit for latitude: ' + yMax)
  }
}

// Ensure y-min <= y-max
if (yMin > yMax) {
  console.error('lower limit for latitude higher than upper limit')
  exit(1)
} else {
  if (verbose) {
    console.info('lower limit for latitude not higher than upper limit')
  }
}

// Handle x-min
if (!Object.hasOwnProperty.call(opt.options, 'x-min')) {
  console.error('no lower limit for longitude provided.')
  exit(1)
} else {
  xMin = Number.parseFloat(opt.options['x-min'])
  if (Number.isNaN(xMin)) {
    console.error('lower limit for longitude cannot be parsed as a number.')
    exit(1)
  }
  if (verbose) {
    console.info('lower limit for longitude: ' + xMin)
  }
}

// Handle longitude maximum
if (!Object.hasOwnProperty.call(opt.options, 'x-max')) {
  console.error('no upper limit for longitude provided.')
  exit(1)
} else {
  xMax = Number.parseFloat(opt.options['x-max'])
  if (Number.isNaN(xMax)) {
    console.error('upper limit for longitude cannot be parsed as a number.')
    exit(1)
  }
  if (verbose) {
    console.info('upper limit for longitude: ' + xMax)
  }
}

// Ensure x-min <= x-max
if (xMin > xMax) {
  console.error('lower limit for longitude higher than upper limit')
  exit(1)
} else {
  if (verbose) {
    console.info('lower limit for longitude not higher than upper limit')
  }
}

if (!Object.hasOwnProperty.call(opt.options, 'projection')) {
  projection = 'EPSG:4326'
} else {
  projection = opt.options.projection
}

if (verbose) {
  console.info('using projection "' + projection + '"')
}

var convertedCoordinates = proj4(projection, 'EPSG:4326', [xMin, yMin])
xMin = convertedCoordinates[0]
yMin = convertedCoordinates[1]
convertedCoordinates = proj4(projection, 'EPSG:4326', [xMax, yMax])
xMax = convertedCoordinates[0]
yMax = convertedCoordinates[1]

if (verbose) {
  console.info('lower limit for latitude after transform: ' + yMin)
  console.info('upper limit for latitude after transform: ' + yMax)
  console.info('lower limit for longitude after transform: ' + xMin)
  console.info('upper limit for longitude after transform: ' + xMax)
}

// Handle z-min
if (!Object.hasOwnProperty.call(opt.options, 'z-min')) {
  console.error('no lower limit for zoom provided.')
  exit(1)
} else {
  zMin = Number.parseInt(opt.options['z-min'])
  if (Number.isNaN(zMin)) {
    console.error('lower limit for zoom cannot be parsed as a number.')
    exit(1)
  }
  if (verbose) {
    console.info('lower limit for zoom: ' + zMin)
  }
}

// Handle zoom maximum
if (!Object.hasOwnProperty.call(opt.options, 'z-max')) {
  console.error('no upper limit for zoom provided.')
  exit(1)
} else {
  zMax = Number.parseInt(opt.options['z-max'])
  if (Number.isNaN(zMax)) {
    console.error('upper limit for zoom cannot be parsed as a number.')
    exit(1)
  }
  if (verbose) {
    console.info('upper limit for zoom: ' + zMax)
  }
}

// Ensure x-min <= x-max
if (zMin > zMax) {
  console.error('lower limit for zoom higher than upper limit')
  exit(1)
} else {
  if (verbose) {
    console.info('lower limit for zoom not higher than upper limit')
  }
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
