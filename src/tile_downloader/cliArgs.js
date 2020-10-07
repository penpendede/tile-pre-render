const commonCliArgs = require('./commonCliArgs')
exports.args = commonCliArgs.coord.concat([
  ['o', 'output-path=ARG', 'path where to write the downloaded tiles'],
  ['u', 'uri-template=ARG', 'URI template to use'],
  ['m', 'parallel-maximum=ARG', 'maximum number of parallel downloads, default 4'],
  ['w', 'nowrite', 'do not write files']
]).concat(commonCliArgs.help)

exports.boolean = commonCliArgs.boolean.concat(['nowrite'])

exports.defaults = commonCliArgs.defaults.concat([
  {
    name: 'parallel-maximum',
    default: 4
  }
])

exports.optional = commonCliArgs.optional.concat([])
