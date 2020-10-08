exports.boolean = ['quiet', 'verbose']

exports.coord = [
  ['x', 'x-min=ARG', 'min x value'],
  ['X', 'x-max=ARG', 'max x value'],
  ['y', 'y-min=ARG', 'min y value'],
  ['Y', 'y-max=ARG', 'max y value'],
  ['z', 'z-min=ARG', 'min z value (zoom level)'],
  ['Z', 'z-max=ARG', 'max z value (zoom level)'],
  ['p', 'proj=PROJECTION', 'projection in which the coordinates are provided']
]

exports.defaults = [{
  name: 'proj',
  default: 'EPSG:4326'
}]

exports.help = [
  ['q', 'quiet', 'don\'t be chatty'],
  ['h', 'help', 'display this help']
]

exports.optional = []
