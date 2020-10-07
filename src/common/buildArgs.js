const { exit } = require('process')
const proj4 = require('proj4')

exports.buildArgs = opt => {
  let h
  const arg = {}

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
  arg.proj = opt.proj

  if (arg.proj !== 'EPSG:4326') {
    for (const limit of ['min', 'max']) {
      const convertedCoordinates = proj4(arg.proj, 'EPSG:4326', [arg[`x-${limit}`], arg[`y-${limit}`]])
      arg[`x-${limit}`] = convertedCoordinates[0]
      arg[`y-${limit}`] = convertedCoordinates[1]
    }
  }
  return arg
}
