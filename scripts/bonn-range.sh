#!/usr/bin/env sh
node src/generate_render_script/index.js \
  --x-min=7.0225 --y-min=50.6326 \
  --x-max=7.2107 --y-max=50.7745 \
  --z-min=1 --z-max=18 \
  --proj=EPSG:4326 \
  --shell=bash \
  --file=scripts/populate_bonn_short_names.sh --overwrite \
  --command=render_list \
  --map=osm \
  --socket=/run/renderd/renderd.sock \
  --threads=4 \
  --force \
  --load=16 \
  --tile-dir=/var/lib/mod_tile

node src/generate_render_script/index.js \
  --x-min=7.0225 --y-min=50.6326 \
  --x-max=7.2107 --y-max=50.7745 \
  --z-min=1 --z-max=18 \
  --proj=EPSG:4326 \
  --shell=bash \
  --file=scripts/populate_bonn_long_names.sh --overwrite \
  --command=render_list \
  --map=osm \
  --socket=/run/renderd/renderd.sock \
  --threads=4 \
  --force \
  --load=16 \
  --tile-dir=/var/lib/mod_tile \
  --long-opt-names