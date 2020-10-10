`render_list` needs tile ranges rather than lat/lon or the like.

* `src/generate_render_script/index.js` is a tool to generate a script that uses render_list for a given coordinate range.

  * `scripts/bonn-range.sh` illustrates how to use

  * `populate_bonn_long_names.sh` illustrates how to appropriately call `src/generate_render_script/index.js` to obtain long argument names.

  * `populate_bonn_short_names.sh` illustrates how to appropriately call `src/generate_render_script/index.js` to obtain short argument names.

```yaml
Usage:
  node index.js [OPTION]

Options:
  -x, --xMin=ARG        min x value
  -X, --xMax=ARG        max x value
  -y, --yMin=ARG        min y value
  -Y, --yMax=ARG        max y value
  -z, --zMin=ARG        min z value (zoom level)
  -Z, --zMax=ARG        max z value (zoom level)
  -p, --proj=PROJECTION projection in which the coordinates are provided
  -L, --longOptNames    print long option names
  -o, --file=FILE       file to write (without this the script is printed)
  -O, --overwrite       overwrite file if exists
  -c, --command=COMMAND render command, defaults to "render_list"
  -S, --shell=SHELL     shell for script, default "sh"
  -n, --threads=ARG     the number of parallel request threads, default 1
  -f, --force           render tiles even if they seem current
  -m, --map=MAP         map to render, default "default"
  -l, --load=LOAD       sleep if load is this high, default 16
  -s, --socket=SOCKET   socket to use, default "/run/renderd/renderd.sock"
  -t, --tileDir=DIR     tile cache directory, default "/var/lib/mod_tile"
  -q, --quiet           don't be chatty
  -h, --help            display this help

```
