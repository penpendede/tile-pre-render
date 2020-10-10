exports.boolean = ['quiet']

exports.coord = [
  ['x', 'xMin=ARG', 'min x value'],
  ['X', 'xMax=ARG', 'max x value'],
  ['y', 'yMin=ARG', 'min y value'],
  ['Y', 'yMax=ARG', 'max y value'],
  ['z', 'zMin=ARG', 'min z value (zoom level)'],
  ['Z', 'zMax=ARG', 'max z value (zoom level)'],
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
