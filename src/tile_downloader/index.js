const { args } = require('./cliArgs')
const { buildArgs } = require('./buildArgs')
const { makeQueue } = require('../lib/makeQueue')
const { processQueue } = require('../lib/processQueue')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const opt = require('node-getopt')
  .create(args)
  .bindHelp()
  .parseSystem()
  .options

const arg = buildArgs(opt)

try {
  if (!arg.noWrite) {
    mkdirp.sync(arg.outputDir)
  }
} catch (e) {
  if (e.code !== 'EEXIST') {
    throw e
  }
}

for (let zoom = arg.zMin; zoom <= arg.zMax; zoom++) {
  const subdirectory = path.join(arg.outputDir, '' + zoom)
  try {
    if (!arg.noWrite) {
      fs.mkdirSync(subdirectory)
    }
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }
  arg.zoom = zoom
  processQueue(makeQueue(arg), arg)
}
