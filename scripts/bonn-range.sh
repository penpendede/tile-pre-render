#!/usr/bin/env sh
node src/generate_render_script/index.js \
  --xMin=7.0225 \
  --xMax=7.2107 \
  --yMin=50.6326 \
  --yMax=50.7745 \
  --zMin=0 \
  --zMax=18 \
  --proj=EPSG:4326 \
  --shell=bash \
  --file=scripts/populate_bonn_short_names.sh \
  --overwrite \
  --command=render_list \
  --map=osm \
  --socket=/run/renderd/renderd.sock \
  --threads=4 \
  --force \
  --load=16 \
  --tileDir=/var/lib/mod_tile

node src/generate_render_script/index.js \
  --xMin=7.0225 \
  --xMax=7.2107 \
  --yMin=50.6326 \
  --yMax=50.7745 \
  --zMin=0 \
  --zMax=18 \
  --proj=EPSG:4326 \
  --shell=bash \
  --file=scripts/populate_bonn_long_names.sh \
  --overwrite \
  --command=render_list \
  --map=osm \
  --socket=/run/renderd/renderd.sock \
  --threads=4 \
  --force \
  --load=16 \
  --tileDir=/var/lib/mod_tile \
  --longOptNames