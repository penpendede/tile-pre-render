const proj4 = require('proj4')
const fs = require('fs')
let h

const commandLineArguments = [
  ['c', 'command=ARG', 'render command, defaults to "render_list"'],
  ['m', 'map=ARG', 'map to render, default "osm"'],
  ['s', 'socket=ARG', 'socket to use, default "/run/renderd/renderd.sock"'],
  ['S', 'shell=ARG', 'shell for script, default "sh"'],
  ['o', 'file=ARG', 'file to write (without this the script is printed)'],
  ['O', 'overwrite', 'overwrite file if exists'],
  ['x', 'x-min=ARG', 'min x value'],
  ['X', 'x-max=ARG', 'max x value'],
  ['y', 'y-min=ARG', 'min y value'],
  ['Y', 'y-max=ARG', 'max y value'],
  ['z', 'z-min=ARG', 'min z value (zoom level)'],
  ['Z', 'z-max=ARG', 'max z value (zoom level)'],
  ['p', 'proj=ARG', 'proj in which the coordinates are provided'],
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

const opt = require('node-getopt').create(commandLineArguments).bindHelp().parseSystem().options

const arg = {}

if (Object.hasOwnProperty.call(opt, 'file')) {
  arg.file = opt.file
} else {
  arg.file = null
}

arg.overwrite = opt.overwrite

try {
  if (arg.file !== undefined && fs.existsSync(arg.file)) {
    if (!arg.overwrite) {
      console.warn(`File "${arg.file}" already exists, use -O/--overwrite to overwrite`)
      process.exit(1)
    }
  }
} catch (err) {
  console.error(err)
  process.exit(1)
}

if (Object.hasOwnProperty.call(opt, 'command')) {
  arg.command = opt.command
} else {
  arg.command = 'render_list'
}

if (Object.hasOwnProperty.call(opt, 'map')) {
  arg.map = opt.map
} else {
  arg.map = 'osm'
}

if (Object.hasOwnProperty.call(opt, 'socket')) {
  arg.socket = opt.socket
} else {
  arg.socket = '/run/renderd/renderd.sock'
}

if (Object.hasOwnProperty.call(opt, 'shell')) {
  arg.shell = opt.shell
} else {
  arg.shell = 'sh'
}

for (const id of ['x', 'y', 'z']) {
  for (const limit of ['min', 'max']) {
    if (!Object.hasOwnProperty.call(opt, `${id}-${limit}`)) {
      console.error(`no ${limit} for ${id} value provided.`)
      process.exit(1)
    } else {
      arg[`${id}-${limit}`] = Number.parseFloat(opt[`${id}-${limit}`])
      if (Number.isNaN(arg[id])) {
        console.error(`${limit} ${id} value cannot be parsed as a number.`)
        process.exit(1)
      }
    }
  }
  if (arg[`${id}-min`] > arg[`${id}-max`]) {
    console.log(`min ${id} value larger than max, swapping`)
    h = arg[`${id}-min`]
    arg[`${id}-min`] = arg[`${id}-max`]
    arg[`${id}-max`] = h
  }
}

if (!Object.hasOwnProperty.call(opt, 'proj')) {
  arg.proj = 'EPSG:4326'
} else {
  arg.proj = opt.proj
}

if (arg.proj !== 'EPSG:4326') {
  for (const limit of ['min', 'max']) {
    var convertedCoordinates = proj4(arg.proj, 'EPSG:4326', [arg[`x-${limit}`], arg[`y-${limit}`]])
    arg[`x-${limit}`] = convertedCoordinates[0]
    arg[`y-${limit}`] = convertedCoordinates[1]
  }
}
const scriptRows = [`#!/usr/bin/env ${arg.shell}`]
for (let z = arg['z-min']; z <= arg['z-max']; z++) {
  let coords = getTileCoordinates(arg['y-min'], arg['x-min'], z)
  const x0 = coords.X
  const y0 = coords.Y
  coords = getTileCoordinates(arg['y-max'], arg['x-max'], z)
  const x1 = coords.X
  const y1 = coords.Y
  scriptRows.push(`${arg.command} -m ${arg.map} -a -z ${z} -z ${z} -x ${x0} -X ${x1} -y ${y1} -Y ${y0} -f -h 4 -s ${arg.socket}`)
}
const script = scriptRows.join('\n') + '\n'

if (arg.file === null) {
  console.log(script)
} else {
  fs.writeFileSync(arg.file, script)
}
