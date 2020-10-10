# tile-pre-render

This project currently addresses two issues with pre-rendering OSM style tiles.

The tools I wrote to address these issues are all implemented using **node**. Once this tool is in place all you need
to do is fetching the required node packages and you are ready to go. For fetching the packages I recommend using
`yarn install` (which needs to be installed if it did not come with your node isntallation). There is no reason why
`npm install` should not work as well but I phased out using that tool due to yarn's superior performance when it
comes to installing large numbers of packages.

**Pre-rendering meta-tiles** is a nice tradeoff between the amount of data stored on disk and performance.
Unfortunately `render_list`'s inconvenient command line arguments - rather than accepting a bounding box of
coordinates, it requires an actual tile ranges (which depend on both bounding box and zoom factor).

**Pre-rendering actual tiles** can generate vast numbers of files but can be convenient nonetheless. A rendering
setup for requires quite an amount of software to be installed and I am not even sure if rendering on a Windows
machine is even possible without using WSL. Pre-rendered tiles on the other hand can be delivered by any web server
without further installation.

## Pre-rendering meta-tiles

`render_list` needs tile ranges rather than lat/lon or the like.

* `src/generate_render_script/index.js` is a tool to generate a script that uses render_list for a given coordinate
  range.

* `scripts/bonn-range.sh` illustrates how to use it

  * `populate_bonn_long_names.sh` illustrates how to call `src/generate_render_script/index.js` to obtain long
    argument names.

  * `populate_bonn_short_names.sh` illustrates how to call `src/generate_render_script/index.js` to obtain short
    argument names.

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

Some additional remarks on the actors in the order of their occurrance in the example

* `--xMin` is the westernmost coordinate (e.g. longitude)
* `--xMax` is the easternmost coordinate (e.g. longitude)
* `--yMin` is the southernmost coordinate (e.g. latitude)
* `--yMax` is the northernmost coordinate (e.g. latitude)
* `--zMin` the minimal zoom; in zoom 0, 1, 2, ..., n there are 1, 4, 16, ..., 4^n that cover the whole world. With
  each zoom level the horizontal and vertical extent of the tiles is halved, hence a factor of 2*2 = 4
* `--zMax` is the maximal zoom, hence the one with the greatest detail
* `--proj` is the projection in which xMin, xMax, yMin, yMax are provided, as long as you are using latitude
  longitude you do not need it (it is interpreted by the proj4 library)
* `--shell` is the shell the script should use; any Bourne-based shell should do, that includes (t)csh (default is
  `sh`, the plain old Bourne shell)
* `--file` is the file you want the script to be written to, if you do not provide this argument, the output is
  written to stdout
* `--overwrite` overwrites an existing file, by default this is **not** done
* `--command` set the command to something else than `render_list` be it a different name or an explicit path
* `--map` is handed through to `render_list`
* `--socket` is handed through to `render_list`
* `--threads` is handed through to `render_list`
* `--force` is handed through to `render_list`
* `--load=16` is handed through to `render_list`
* `--tileDir` is handed through to `render_list`
* `--longOptNames` with this argument, the generated script uses long, more speaking option names; otherwise short
  ones are used.

## pre-rendering actual tiles

Allow me to start with a serious reminder:
**DO NOT USE THIS SCRIPT TO PUT STRAIN ON OPENSTREETMAP.ORG AND OTHER COMMUNITY-DRIVEN PROJECTS!**

src/tile_downloader/index.js

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
  -o, --outputDir=ARG   path where to write the downloaded tiles
  -u, --uriTemplate=ARG URI template to use
  -m, --parallelMax=ARG maximum number of parallel downloads, default 4
  -w, --nowrite         do not write files
  -q, --quiet           don't be chatty
  -h, --help            display this help
```

Here is an example of how to use `src/tile_downloader/index.js`. The region covers Arnis, the smallest city in
Germany with a population of just around 300 and a total area of approximately 0.45 km².

```bash
node src/tile_downloader/index.js \
  --xMin=9.923899 \
  --xMax=9.939108 \
  --yMin=54.625513 \
  --yMax=54.634635 \
  --zMin=0 \
  --zMax=10 \
  --proj=EPSG:4326 \
  --outputDir=./osm \
  --uriTemplate='https://{a-c}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
  --parallelMax=1
```

All coordinate-related arguments are identical to those used `src/generate_render_script/index.js`. On the remaining
arguments:

* `--outputDir` sets the directory in which the tile_downloader puts the downloaded tiles (it generates the required
  directory tree)
* `--uriTemplate` describes the URIs downloading in a manner similar to leaflet, for details see below.
* `--parallelMax` controls how many downloads may occur in parallel. The default is 2 which means that at any given
  moment not more than 2 tile is requested. Now-replaced RFC 2616 stated that you should not use more connections.
  Nowadays most browsers have a limit of 6 parallel downloads but given the load on the server caused by fetching
  tiles it seems reasonable to honour the old limit.
* `--nowrite` stops the script from actually storing the downloaded tiles on disk (useful if you want to trigger
  on-server rendering).

On `--uriTemplates`: The templates are such that you essentially can take a template meant for
[leaflet](https://leafletjs.com/) and simply use it. An example of a leaflet template that does not require any
modification is `http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png` as the placeholders `{x}`, `{y}`, and `{z}` have
identical meanings for both leaflet and `tile_downloader`.

You may however need to modify other templates. Here is a TomTom example taken from the
[Leaflet Provider Demo](https://leaflet-extras.github.io/leaflet-providers/preview/) (slightly reformatted to avoid
overly lengthy lines):

```javascript
var TomTom_Basic = L.tileLayer(
  'https://{s}.api.tomtom.com/map/1/tile/basic/{style}/{z}/{x}/{y}.{ext}?key={apikey}',
  {
    maxZoom: 22,
    attribution: '<a href="https://tomtom.com" target="_blank">&copy;  1992 - 2020 TomTom.</a> ',
    subdomains: 'abcd',
    style: 'main',
    ext: 'png',
    apikey: '<insert your API key here>'
  }
);
```

In order to turn this template into something you can use with `tile_downloader` you first need to identify the
user-defined placeholders which in this case are `{style}`, `{ext}`, and `{apikey}` and replace them with the values
present in the configuration object (let us assume that apikey is `deadbeef`), hence

```javascript
var TomTom_Basic = L.tileLayer(
  'https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=deadbeef',
  {
    maxZoom: 22,
    attribution: '<a href="https://tomtom.com" target="_blank">&copy;  1992 - 2020 TomTom.</a> ',
    subdomains: 'abcd'
  }
);
```

after these changes, the template still works the same in leaflet. Now we come to a breaking change.

The placeholder `{s}` stands for the subdomains present. Per default these are `a`, `b`, and `c` that in this case is
overwritten by the configuration object's `subdomain` property.

`tile_downloader` follows a slightly different approach: You provide a range that is enclosed in curly braces. In the
default case you replace `{s}` by `{a-c}`, here you use `{a-d}`. So finally we would end up with

```text
https://{a-d}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=deadbeef
```

**WOULD** because copying large amounts of tiles from TomTom will likely run you into legal issues, the above was for
illustration purposes only.