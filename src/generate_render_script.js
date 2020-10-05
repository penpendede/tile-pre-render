const proj4 = require('proj4')
const fs = require('fs')
const { exit } = require('process')
let h

const commandLineArguments = [
  // script args
  ['L', 'long-opt-names', 'print long option names'],
  ['x', 'x-min=ARG', 'min x value'],
  ['X', 'x-max=ARG', 'max x value'],
  ['y', 'y-min=ARG', 'min y value'],
  ['Y', 'y-max=ARG', 'max y value'],
  ['z', 'z-min=ARG', 'min z value (zoom level)'],
  ['Z', 'z-max=ARG', 'max z value (zoom level)'],
  ['p', 'proj=PROJECTION', 'proj in which the coordinates are provided'],
  ['o', 'file=FILE', 'file to write (without this the script is printed)'],
  ['O', 'overwrite', 'overwrite file if exists'],
  ['c', 'command=COMMAND', 'render command, defaults to "render_list"'],
  ['S', 'shell=SHELL', 'shell for script, default "sh"'],
  // command args
  ['n', 'threads=ARG', 'the number of parallel request threads, default 1'],
  ['f', 'force', 'render tiles even if they seem current'],
  ['m', 'map=MAP', 'map to render, default "default"'],
  ['l', 'load=LOAD', 'sleep if load is this high, default 16'],
  ['s', 'socket=SOCKET', 'socket to use, default "/run/renderd/renderd.sock"'],
  ['t', 'tile-dir=DIR', 'tile cache directory, default "/var/lib/mod_tile"'],
  ['h', 'help', 'display this help']
]

const defaultsList = [
  {
    name: 'command',
    default: 'render_list'
  },
  {
    name: 'load',
    value: '16'
  },
  {
    name: 'map',
    default: 'default'
  },
  {
    name: 'proj',
    default: 'EPSG:4326'
  },
  {
    name: 'shell',
    default: 'sh'
  },
  {
    name: 'socket',
    default: '/run/renderd/renderd.sock'
  },
  {
    name: 'threads',
    default: '1'
  },
  {
    name: 'tile-dir',
    default: '/var/lib/mod_tile'
  }
]
const optionalArgs = [
  {
    name: 'force',
    skipVal: false,
    option: '-f',
    noValue: true
  },
  {
    name: 'load',
    skipVal: '16',
    option: '-l'
  },
  {
    name: 'map',
    skipVal: 'default',
    option: '-m'
  },
  {
    name: 'threads',
    skipVal: '1',
    option: '-n'
  },
  {
    name: 'tile-dir',
    skipVal: '/var/lib/mod_tile',
    option: '-t'
  }
]
const booleanParameters = [
  'force',
  'overwrite',
  'long-opt-names'
]
const argNameLong = {
  '-a ': '--all',
  '-f ': '--force',
  '-l ': '--max-load=',
  '-m ': '--map=',
  '-n ': '--num-threads=',
  '-s ': '---socket=',
  '-t ': '--tile-dir=',
  '-x ': '--min-x=',
  '-X ': '--max-x=',
  '-y ': '--min-y=',
  '-Y ': '--max-y=',
  '-z ': '--min-zoom=',
  '-Z ': '--max-zoom='
}

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

for (const item of defaultsList) {
  arg[item.name] = Object.hasOwnProperty.call(opt, item.name) ? opt[item.name] : opt.default
}

arg.file = opt.file
for (const item of booleanParameters) {
  arg[item] = !!opt[item]
}

try {
  if (arg.file !== undefined && fs.existsSync(arg.file)) {
    if (!arg.overwrite) {
      console.warn(`File "${arg.file}" already exists, use -O/--overwrite to overwrite`)
      exit(1)
    }
  }
} catch (err) {
  console.error(err)
  exit(1)
}

for (const id of ['x', 'y', 'z']) {
  for (const limit of ['min', 'max']) {
    if (!Object.hasOwnProperty.call(opt, `${id}-${limit}`)) {
      console.error(`no ${limit} for ${id} value provided.`)
      exit(1)
    } else {
      arg[`${id}-${limit}`] = Number.parseFloat(opt[`${id}-${limit}`])
      if (Number.isNaN(arg[id])) {
        console.error(`${limit} ${id} value cannot be parsed as a number.`)
        exit(1)
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

if (arg.proj !== 'EPSG:4326') {
  for (const limit of ['min', 'max']) {
    const convertedCoordinates = proj4(arg.proj, 'EPSG:4326', [arg[`x-${limit}`], arg[`y-${limit}`]])
    arg[`x-${limit}`] = convertedCoordinates[0]
    arg[`y-${limit}`] = convertedCoordinates[1]
  }
}

const scriptRows = [`#!/usr/bin/env ${arg.shell}`]
const commonArgs = [arg.command, ' ', '-a ', ' ', '-s ', arg.socket]
for (const item of optionalArgs) {
  if (arg[item.name] !== item.skipVal) {
    commonArgs.push(' ')
    commonArgs.push(item.option + ' ')
    if (!item.noValue) {
      commonArgs.push(' ')
      commonArgs.push(arg[item.name])
    }
  }
}
for (let z = arg['z-min']; z <= arg['z-max']; z++) {
  let coords = getTileCoordinates(arg['y-min'], arg['x-min'], z)
  const x0 = coords.X
  const y0 = coords.Y
  coords = getTileCoordinates(arg['y-max'], arg['x-max'], z)
  const x1 = coords.X
  const y1 = coords.Y
  let allArgs = commonArgs.concat([
    ' ', '-z ', z, ' ', '-Z ', z,
    ' ', '-x ', x0, ' ', '-X ', x1,
    ' ', '-y ', y1, ' ', '-Y ', y0]
  )
  if (opt['long-opt-names']) {
    allArgs = allArgs.map(x => Object.hasOwnProperty.call(argNameLong, x) ? argNameLong[x] : x)
  }
  scriptRows.push(allArgs.join(''))
}

const script = scriptRows.join('\n') + '\n'

if (arg.file === undefined) {
  console.log(script)
} else {
  fs.writeFileSync(arg.file, script)
}
