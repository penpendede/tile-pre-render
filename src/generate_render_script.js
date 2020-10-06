const fs = require('fs')
const { args } = require('./generate_render_script_CliArgs')
const { buildArgs } = require('./buildArgs')
const { buildScript } = require('./buildScript')

const opt = require('node-getopt').create(args).bindHelp().parseSystem().options
const arg = buildArgs(opt)
const script = buildScript(arg)
if (arg.file === undefined) {
  console.log(script)
} else {
  fs.writeFileSync(arg.file, script)
}
