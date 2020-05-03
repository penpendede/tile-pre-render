let proj4 = require('proj4')
let sprintf = require('sprintf-js').sprintf

function toRadians (w) {
  return w * Math.PI / 180.0
}

function getTileCoordinates (lat, lon, zoom) {
  let xTile = Math.floor((lon + 180) / 360 * Math.pow(2, zoom))
  let yTile = Math.floor(
    (1.0 - Math.log(Math.tan(toRadians(lat)) + 1.0 / Math.cos(toRadians(lat))) / Math.PI) * Math.pow(2.0, zoom - 1.0)
  )
  if (xTile < 0.0) {
    xTile = 0.0
  }
  if (xTile >= Math.pow(2.0, zoom)) {
    xTile = Math.pow(2.0, zoom)
  }
  if (yTile < 0.0) {
    yTile = 0.0
  }
  if (yTile >= Math.pow(2.0, zoom)) {
    yTile = Math.pow(2.0, zoom) - 1.0
  }
  return {
    'X': xTile,
    'Y': yTile
  }
}

let opt = require('node-getopt').create([
  [
    'x',
    'longitude-minimum=ARG',
    'lower limit for longitude'
  ],
  [
    'X',
    'longitude-maximum=ARG',
    'upper limit for longitude'
  ],
  [
    'y',
    'latitude-minimum=ARG',
    'lower limit for latitude'
  ],
  [
    'Y',
    'latitude-maximum=ARG',
    'upper limit for latitude'
  ],
  [
    'z',
    'zoom-minimum=ARG',
    'lowest zoom level value'
  ],
  [
    'Z',
    'zoom-maximum=ARG',
    'highest zoom level value'
  ],
  [
    'p',
    'projection=ARG',
    'projection in which the coordinates are provided'
  ],
  [
    'h',
    'help',
    'display this help'
  ]
])
  .bindHelp()
  .parseSystem()

let xMin, xMax, yMin, yMax, zMin, zMax, projection

// Handle latitude-minimum
if (!opt.options.hasOwnProperty('latitude-minimum')) {
  console.error('no lower limit for latitude provided.')
  return 1
} else {
  yMin = Number.parseFloat(opt.options['latitude-minimum'])
  if (Number.isNaN(yMin)) {
    console.error('lower limit for latitude cannot be parsed as a number.')
    return 1
  }
}

// Handle latitude-maximum
if (!opt.options.hasOwnProperty('latitude-maximum')) {
  console.error('no upper limit for latitude provided.')
  return 1
} else {
  yMax = Number.parseFloat(opt.options['latitude-maximum'])
  if (Number.isNaN(yMax)) {
    console.error('upper limit for latitude cannot be parsed as a number.')
    return 1
  }
}

// Ensure latitude-minimum <= latitude-maximum
if (yMin > yMax) {
  console.error('lower limit for latitude higher than upper limit')
  return 1
}

// Handle longitude-minimum
if (!opt.options.hasOwnProperty('longitude-minimum')) {
  console.error('no lower limit for longitude provided.')
  return 1
} else {
  xMin = Number.parseFloat(opt.options['longitude-minimum'])
  if (Number.isNaN(xMin)) {
    console.error('lower limit for longitude cannot be parsed as a number.')
    return 1
  }
}

// Handle longitude maximum
if (!opt.options.hasOwnProperty('longitude-maximum')) {
  console.error('no upper limit for longitude provided.')
  return 1
} else {
  xMax = Number.parseFloat(opt.options['longitude-maximum'])
  if (Number.isNaN(xMax)) {
    console.error('upper limit for longitude cannot be parsed as a number.')
    return 1
  }
}

// Ensure longitude-minimum <= longitude-maximum
if (xMin > xMax) {
  console.error('lower limit for longitude higher than upper limit')
  return 1
}

if (!opt.options.hasOwnProperty('projection')) {
  projection = "EPSG:4326"
} else {
  projection = opt.options.projection
}


var convertedCoordinates = proj4(projection, "EPSG:4326", [xMin, yMin])
xMin = convertedCoordinates[0]
yMin = convertedCoordinates[1]
convertedCoordinates = proj4(projection, "EPSG:4326", [xMax, yMax])
xMax = convertedCoordinates[0]
yMax = convertedCoordinates[1]

// Handle zoom-minimum
if (!opt.options.hasOwnProperty('zoom-minimum')) {
  console.error('no lower limit for zoom provided.')
  return 1
} else {
  zMin = Number.parseInt(opt.options['zoom-minimum'])
  if (Number.isNaN(zMin)) {
    console.error('lower limit for zoom cannot be parsed as a number.')
    return 1
  }
}

// Handle zoom maximum
if (!opt.options.hasOwnProperty('zoom-maximum')) {
  console.error('no upper limit for zoom provided.')
  return 1
} else {
  zMax = Number.parseInt(opt.options['zoom-maximum'])
  if (Number.isNaN(zMax)) {
    console.error('upper limit for zoom cannot be parsed as a number.')
    return 1
  }
}

// Ensure longitude-minimum <= longitude-maximum
if (zMin > zMax) {
  console.error('lower limit for zoom higher than upper limit')
  return 1
}

for (let zoom = zMin; zoom <= zMax; zoom++) {
  coords =  getTileCoordinates (yMin, xMin, zoom)
  x0 = coords.X
  y0 = coords.Y
  coords =  getTileCoordinates (yMax, xMax, zoom)
  x1 = coords.X
  y1 = coords.Y
  console.log(sprintf('zoom %7d: -x %7d -X %7d -y %7d -Y %7d', zoom, x0, x1, y1, y0))
}

return 0
