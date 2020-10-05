exports.commandLineArguments = [
  // script args
  ['L', 'long-opt-names', 'print long option names'],
  ['x', 'x-min=ARG', 'min x value'],
  ['X', 'x-max=ARG', 'max x value'],
  ['y', 'y-min=ARG', 'min y value'],
  ['Y', 'y-max=ARG', 'max y value'],
  ['z', 'z-min=ARG', 'min z value (zoom level)'],
  ['Z', 'z-max=ARG', 'max z value (zoom level)'],
  ['p', 'proj=PROJECTION', 'proj in which the coordinates are provided'],
  ['o', 'file=FILE', 'file to write (without this the script is printed)'],
  ['O', 'overwrite', 'overwrite file if exists'],
  ['c', 'command=COMMAND', 'render command, defaults to "render_list"'],
  ['S', 'shell=SHELL', 'shell for script, default "sh"'],
  // command args
  ['n', 'threads=ARG', 'the number of parallel request threads, default 1'],
  ['f', 'force', 'render tiles even if they seem current'],
  ['m', 'map=MAP', 'map to render, default "default"'],
  ['l', 'load=LOAD', 'sleep if load is this high, default 16'],
  ['s', 'socket=SOCKET', 'socket to use, default "/run/renderd/renderd.sock"'],
  ['t', 'tile-dir=DIR', 'tile cache directory, default "/var/lib/mod_tile"'],
  ['h', 'help', 'display this help']
]
