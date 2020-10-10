const commonCliArgs = require('../common/cliArgs')
exports.args = commonCliArgs.coord.concat([
  ['o', 'outputDir=ARG', 'path where to write the downloaded tiles'],
  ['u', 'uriTemplate=ARG', 'URI template to use'],
  ['m', 'parallelMax=ARG', 'maximum number of parallel downloads, default 4'],
  ['w', 'nowrite', 'do not write files']
]).concat(commonCliArgs.help)

exports.boolean = commonCliArgs.boolean.concat(['nowrite'])

exports.defaults = commonCliArgs.defaults.concat([
  {
    name: 'parallelMax',
    default: 4
  }
])

exports.optional = commonCliArgs.optional.concat([])
