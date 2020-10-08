const { exit } = require('process')
const fs = require('fs')
const { boolean, defaults } = require('./cliArgs')
const { buildArgs } = require('../common/buildArgs')

exports.buildArgs = opt => {
  const arg = buildArgs(opt)

  for (const item of defaults) {
    arg[item.name] = Object.hasOwnProperty.call(opt, item.name) ? opt[item.name] : opt.default
  }

  arg.file = opt.file
  for (const item of boolean) {
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
  return arg
}
