const fs = require('fs')
const request = require('request')

exports.processQueue = (queue, maxParallel, quiet, noWrite) => {
  const totalNumber = queue.length
  if (!quiet) {
    console.info('files to download: ' + totalNumber)
  }
  let currentId = 0
  for (let i = 0; i < Math.min(maxParallel, totalNumber); i++) {
    getNextTile()
  }
  function getNextTile () {
    const idToFetch = currentId++
    if (idToFetch < totalNumber) {
      if (!quiet) {
        console.info('fetching "' + queue[idToFetch].uri + '"')
      }
      if (noWrite) {
        request(queue[idToFetch].uri)
          .on('response', (response) => getNextTile())
      } else {
        request(queue[idToFetch].uri)
          .on('response', (response) => getNextTile())
          .pipe(fs.createWriteStream(queue[idToFetch].file))
      }
    }
  }
}
