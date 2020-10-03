const proj4 = require('proj4')
const sprintf = require('sprintf-js').sprintf

let h

const commandLineArguments = [
  ['x', 'x-val-lower=ARG', 'lower limit for x value'],
  ['X', 'x-val-upper=ARG', 'upper limit for x value'],
  ['y', 'y-val-lower=ARG', 'lower limit for y value'],
  ['Y', 'y-val-upper=ARG', 'upper limit for y value'],
  ['z', 'z-val-lower=ARG', 'lower limit for z value (zoom level)'],
  ['Z', 'z-val-upper=ARG', 'upper limit for z value (zoom level)'],
  ['p', 'projection=ARG', 'projection in which the coordinates are provided'],
  ['h', 'help', 'display this help']
]

function toRad (w) {
  return w * Math.PI / 180.0
}

function getTileCoordinates (lat, lon, zoom) {
  let xTile = Math.floor((lon + 180) / 360 * Math.pow(2, zoom))
  let yTile = Math.floor(
    (1.0 - Math.log(Math.tan(toRad(lat)) + 1.0 / Math.cos(toRad(lat))) / Math.PI) * Math.pow(2.0, zoom - 1.0)
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
    X: xTile,
    Y: yTile
  }
}

const opt = require('node-getopt').create(commandLineArguments).bindHelp().parseSystem()

const args = {}

for (const id of ['x', 'y', 'z']) {
  for (const limit of ['lower', 'upper']) {
    if (!Object.hasOwnProperty.call(opt.options, `${id}-val-${limit}`)) {
      console.error(`no ${limit} for ${id} value provided.`)
      process.exit(1)
    } else {
      args[`${id}-val-${limit}`] = Number.parseFloat(opt.options[`${id}-val-${limit}`])
      if (Number.isNaN(args[id])) {
        console.error(`lower limit for ${id} value cannot be parsed as a number.`)
        process.exit(1)
      }
    }
  }
  if (args[`${id}-val-lower`] > args[`${id}-val-upper`]) {
    console.log(`lower limit for ${id} value higher than uppz-val-lowerer limit, swapping`)
    h = args[`${id}-val-lower`]
    args[`${id}-val-lower`] = args[`${id}-val-upper`]
    args[`${id}-val-upper`] = h
  }
}

if (!Object.hasOwnProperty.call(opt.options, 'projection')) {
  args.projection = 'EPSG:4326'
} else {
  args.projection = opt.options.projection
}

if (args.projection !== 'EPSG:4326') {
  for (const limit of ['lower', 'upper']) {
    var convertedCoordinates = proj4(args.projection, 'EPSG:4326', [args[`x-val-${limit}`], args[`y-val-${limit}`]])
    args[`x-val-${limit}`] = convertedCoordinates[0]
    args[`y-val-${limit}`] = convertedCoordinates[1]
  }
}
console.log(args)
for (let z = args['z-val-lower']; z <= args['z-val-upper']; z++) {
  let coords = getTileCoordinates(args['y-val-lower'], args['x-val-lower'], z)
  const x0 = coords.X
  const y0 = coords.Y
  coords = getTileCoordinates(args['y-val-upper'], args['x-val-upper'], z)
  const x1 = coords.X
  const y1 = coords.Y
  console.log(sprintf('zoom %7d: -x %7d -X %7d -y %7d -Y %7d', zoom, x0, x1, y1, y0))
}
