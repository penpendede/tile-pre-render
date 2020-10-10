const { longArgumentName, optional } = require('../generate_render_script/cliArgs')
const { getTileCoordinates } = require('./getTileCoordinates')

exports.buildScript = arg => {
  const scriptRows = [`#!/usr/bin/env ${arg.shell}`]
  const commonArgs = [arg.command, ' ', '-a ', ' ', '-s ', arg.socket]
  for (const item of optional) {
    if (arg[item.name] !== item.skipVal) {
      commonArgs.push(' ')
      commonArgs.push(item.option + ' ')
      if (!item.noValue) {
        commonArgs.push(' ')
        commonArgs.push(arg[item.name])
      }
    }
  }
  for (let z = arg.zMin; z <= arg.zMax; z++) {
    let coords = getTileCoordinates(arg.yMin, arg.xMin, z)
    const x0 = coords.X
    const y0 = coords.Y
    coords = getTileCoordinates(arg.yMax, arg.xMax, z)
    const x1 = coords.X
    const y1 = coords.Y
    let allArgs = commonArgs.concat([
      ' ', '-z ', z, ' ', '-Z ', z,
      ' ', '-x ', x0, ' ', '-X ', x1,
      ' ', '-y ', y1, ' ', '-Y ', y0]
    )
    if (arg.longOptNames) {
      allArgs = allArgs.map(x => Object.hasOwnProperty.call(longArgumentName, x) ? longArgumentName[x] : x)
    }
    scriptRows.push(allArgs.join(''))
  }

  return scriptRows.join('\n') + '\n'
}
