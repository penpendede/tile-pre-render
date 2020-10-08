const fs = require('fs')
const path = require('path')
const { getTileCoordinates } = require('./getTileCoordinates')

exports.makeQueue = (leftDeg, bottomDeg, rightDeg, topDeg, zoom, uriObject, noWrite) => {
  const upperLeftCoordinates = getTileCoordinates(topDeg, leftDeg, zoom)
  const lowerRightCoordinates = getTileCoordinates(bottomDeg, rightDeg, zoom)

  const width = 1 + lowerRightCoordinates.X - upperLeftCoordinates.X
  const height = 1 + lowerRightCoordinates.Y - upperLeftCoordinates.Y

  let subdirectory, uri
  const queue = []

  for (let deltaX = 0; deltaX < width; deltaX++) {
    subdirectory = path.join(outputPath, '' + zoom, '' + (upperLeftCoordinates.X + deltaX))
    try {
      if (!noWrite) {
        fs.mkdirSync(subdirectory)
      }
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
    }

    for (let deltaY = 0; deltaY < height; deltaY++) {
      let hostRangeElement
      if (uriObject.hostRange.length) {
        hostRangeElement = uriObject.hostRange[Number.parseInt(Math.random() * uriObject.hostRange.length)]
      } else {
        hostRangeElement = ''
      }
      uri = uriObject.prefix + hostRangeElement +
        uriObject.hostDomainPart + zoom + '/' +
        (upperLeftCoordinates.X + deltaX) + '/' +
        (upperLeftCoordinates.Y + deltaY) + uriObject.suffix
      const file = path.join(subdirectory, '' + (upperLeftCoordinates.Y + deltaY + uriObject.extension))

      queue.push({
        file: file,
        uri: uri
      })
    }
  }
  return queue
}
