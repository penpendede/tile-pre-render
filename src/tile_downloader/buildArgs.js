const { buildArgs } = require('../common/buildArgs')

exports.buildArgs = opt => {
  const arg = buildArgs(opt)
  return arg
}
