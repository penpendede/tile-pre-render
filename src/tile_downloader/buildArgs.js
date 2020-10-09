const { buildArgs } = require('../common/buildArgs')
const { exit } = require('process')
const { uriTemplateToObject } = require('../lib/uriTemplateToObject')

exports.buildArgs = opt => {
  const arg = buildArgs(opt)
  arg.quiet = !!opt.quiet
  arg.noWrite = !!opt.noWrite

  // Handle URI template
  if (!Object.hasOwnProperty.call(opt, 'uriTemplate')) {
    console.error('no URI template provided.')
    exit(1)
  } else {
    const pattern = new RegExp('https?:.*//[^[]*(\\{([a-z](-[a-z])?)+\\})?.*/\\{z\\}/\\{x\\}/\\{y\\}.*')
    if (!pattern.test(opt.uriTemplate)) {
      console.error('unsupported URI template')
      exit(1)
    }
    arg.uriObject = uriTemplateToObject(opt.uriTemplate)
  }

  // Handle output path
  if (!Object.hasOwnProperty.call(opt, 'outputDir')) {
    console.error('no output path provided.')
    exit(1)
  }
  arg.outputDir = opt.outputDir

  if (Object.hasOwnProperty.call(opt, 'parallelMax')) {
    arg.maxParallel = Number.parseInt(opt.parallelMax)
  } else {
    arg.maxParallel = 4
  }

  return arg
}
