const fs = require('fs')
const fetch = require('node-fetch')

exports.processQueue = (queue, arg) => {
  const totalNumber = queue.length
  if (!arg.quiet) {
    console.info('files to download: ' + totalNumber)
  }
  let currentId = 0
  for (let i = 0; i < Math.min(arg.maxParallel, totalNumber); i++) {
    getNextTile()
  }
  function getNextTile () {
    const idToFetch = currentId++
    if (idToFetch < totalNumber) {
      if (!arg.quiet) {
        console.info('fetching "' + queue[idToFetch].uri + '"')
      }
      fetch(queue[idToFetch].uri)
        .then(response => response.buffer())
        .then(buffer => {
          if (!arg.noWrite) {
            fs.writeFileSync(queue[idToFetch].file, buffer)
          }
          getNextTile()
        })
    }
  }
}
