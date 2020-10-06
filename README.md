`render_list` needs tile ranges rather than lat/lon or the like.

`generate_render_script.js` is a tool to generate a script that uses render_list for a given coordinate range.

`bonn-range.sh` illustrates how to use `show_tile_range.js`.

`populate_bonn.sh` illustrates how to appropriately call `render_list`.

    Usage:
      node generate_render_script.js [OPTION]

    Options:
      -x, --x-min=ARG       min x value
      -X, --x-max=ARG       max x value
      -y, --y-min=ARG       min y value
      -Y, --y-max=ARG       max y value
      -z, --z-min=ARG       min z value (zoom level)
      -Z, --z-max=ARG       max z value (zoom level)
      -p, --proj=PROJECTION proj in which the coordinates are provided
      -L, --long-opt-names  print long option names
      -o, --file=FILE       file to write (without this the script is printed)
      -O, --overwrite       overwrite file if exists
      -c, --command=COMMAND render command, defaults to "render_list"
      -S, --shell=SHELL     shell for script, default "sh"
      -n, --threads=ARG     the number of parallel request threads, default 1
      -f, --force           render tiles even if they seem current
      -m, --map=MAP         map to render, default "default"
      -l, --load=LOAD       sleep if load is this high, default 16
      -s, --socket=SOCKET   socket to use, default "/run/renderd/renderd.sock"
      -t, --tile-dir=DIR    tile cache directory, default "/var/lib/mod_tile"
      -q, --quiet           don't be chatty
      -h, --help            display this help
