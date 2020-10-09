const fs = require('fs')
const path = require('path')
const { getTileCoordinates } = require('./getTileCoordinates')

exports.makeQueue = (arg) => {
  const upperLeftCoordinates = getTileCoordinates(arg.yMax, arg.xMin, arg.zoom)
  const lowerRightCoordinates = getTileCoordinates(arg.yMin, arg.xMax, arg.zoom)

  const width = 1 + lowerRightCoordinates.X - upperLeftCoordinates.X
  const height = 1 + lowerRightCoordinates.Y - upperLeftCoordinates.Y

  let subdirectory, uri
  const queue = []

  for (let deltaX = 0; deltaX < width; deltaX++) {
    subdirectory = path.join(arg.outputDir, '' + arg.zoom, '' + (upperLeftCoordinates.X + deltaX))
    try {
      if (!arg.noWrite) {
        fs.mkdirSync(subdirectory)
      }
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
    }

    for (let deltaY = 0; deltaY < height; deltaY++) {
      let hostRangeElement
      if (arg.uriObject.hostRange.length) {
        hostRangeElement = arg.uriObject.hostRange[Number.parseInt(Math.random() * arg.uriObject.hostRange.length)]
      } else {
        hostRangeElement = ''
      }
      uri = arg.uriObject.prefix + hostRangeElement +
        arg.uriObject.hostDomainPart + arg.zoom + '/' +
        (upperLeftCoordinates.X + deltaX) + '/' +
        (upperLeftCoordinates.Y + deltaY) + arg.uriObject.suffix
      const file = path.join(subdirectory, '' + (upperLeftCoordinates.Y + deltaY + arg.uriObject.extension))

      queue.push({
        file: file,
        uri: uri
      })
    }
  }
  return queue
}
