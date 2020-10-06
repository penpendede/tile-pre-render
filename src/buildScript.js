const { longArgumentName } = require('./generate_render_script_CliArgs')
const { optional } = require('./generate_render_script_CliArgs')
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
    if (arg['long-opt-names']) {
      allArgs = allArgs.map(x => Object.hasOwnProperty.call(longArgumentName, x) ? longArgumentName[x] : x)
    }
    scriptRows.push(allArgs.join(''))
  }

  return scriptRows.join('\n') + '\n'
}
