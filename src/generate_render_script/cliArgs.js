const commonCliArgs = require('../common/cliArgs')
exports.args = commonCliArgs.coord.concat([
  ['L', 'long-opt-names', 'print long option names'],
  ['o', 'file=FILE', 'file to write (without this the script is printed)'],
  ['O', 'overwrite', 'overwrite file if exists'],
  ['c', 'command=COMMAND', 'render command, defaults to "render_list"'],
  ['S', 'shell=SHELL', 'shell for script, default "sh"'],
  ['n', 'threads=ARG', 'the number of parallel request threads, default 1'],
  ['f', 'force', 'render tiles even if they seem current'],
  ['m', 'map=MAP', 'map to render, default "default"'],
  ['l', 'load=LOAD', 'sleep if load is this high, default 16'],
  ['s', 'socket=SOCKET', 'socket to use, default "/run/renderd/renderd.sock"'],
  ['t', 'tile-dir=DIR', 'tile cache directory, default "/var/lib/mod_tile"']
]).concat(commonCliArgs.help)

exports.boolean = commonCliArgs.boolean.concat([
  'force',
  'long-opt-names',
  'overwrite'
])

exports.defaults = commonCliArgs.defaults.concat([
  {
    name: 'command',
    default: 'render_list'
  },
  {
    name: 'load',
    value: '16'
  },
  {
    name: 'map',
    default: 'default'
  },
  {
    name: 'shell',
    default: 'sh'
  },
  {
    name: 'socket',
    default: '/run/renderd/renderd.sock'
  },
  {
    name: 'threads',
    default: '1'
  },
  {
    name: 'tile-dir',
    default: '/var/lib/mod_tile'
  }
])

exports.optional = commonCliArgs.optional.concat([
  {
    name: 'force',
    skipVal: false,
    option: '-f',
    noValue: true
  },
  {
    name: 'load',
    skipVal: '16',
    option: '-l'
  },
  {
    name: 'map',
    skipVal: 'default',
    option: '-m'
  },
  {
    name: 'threads',
    skipVal: '1',
    option: '-n'
  },
  {
    name: 'tile-dir',
    skipVal: '/var/lib/mod_tile',
    option: '-t'
  }
])
exports.longArgumentName = {
  '-a ': '--all',
  '-f ': '--force',
  '-l ': '--max-load=',
  '-m ': '--map=',
  '-n ': '--num-threads=',
  '-s ': '---socket=',
  '-t ': '--tile-dir=',
  '-x ': '--min-x=',
  '-X ': '--max-x=',
  '-y ': '--min-y=',
  '-Y ': '--max-y=',
  '-z ': '--min-zoom=',
  '-Z ': '--max-zoom='
}
