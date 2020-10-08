const { buildArgs } = require('../common/buildArgs')
const { exit } = require('process')

exports.buildArgs = opt => {
  const arg = buildArgs(opt)
  arg.quiet = !!opt.quiet
  arg.noWrite = !!opt.noWrite

  // Handle URI template
  if (!Object.hasOwnProperty.call(opt, 'uri-template')) {
    console.error('no URI template provided.')
    exit(1)
  } else {
    const pattern = new RegExp('https?:.*//[^[]*(\\{([a-z](-[a-z])?)+\\})?.*/\\{z\\}/\\{x\\}/\\{y\\}.*')
    if (!pattern.test(opt['uri-template'])) {
      console.error('unsupported URI template')
      exit(0)
    }
    arg.uriTemplate = opt['uri-template']
  }

  // Handle output path
  if (!Object.hasOwnProperty.call(opt, 'output-path')) {
    console.error('no output path provided.')
    exit(1)
  }
  arg.outputPath = opt.options['output-path']

  if (Object.hasOwnProperty.call(opt, 'parallel-max')) {
    arg.maxParallelDownloads = Number.parseInt(opt.options.parallelMaximum)
  } else {
    arg.maxParallelDownloads = 4
  }

  return arg
}
