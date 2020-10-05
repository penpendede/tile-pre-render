const { exit } = require('process')
const fs = require('fs')
const proj4 = require('proj4')
const { booleanParameters } = require('./booleanParameters')
const { defaultsList } = require('./defaultsList')

exports.buildArgs = opt => {
  let h
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
  return arg
}
