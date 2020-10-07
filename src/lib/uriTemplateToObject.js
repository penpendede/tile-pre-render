exports.uriTemplateToObject = uriTemplate => {
  let regex = new RegExp(/^([^{]*)(\{[^}]+\})?(.*)\{z\}\/\{x\}\/\{y\}(.*)/)
  let result = regex.exec(uriTemplate)
  const retval = {
    prefix: result[1],
    hostDomainPart: result[3],
    suffix: result[4]
  }
  if (result[2]) {
    const hostRangePattern = new RegExp('[' + result[2].replace(/[{}]/g, '') + ']')
    const allChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
    let charsPresent = ''
    for (let i = 0; i < allChars.length; i++) {
      if (hostRangePattern.test(allChars[i])) {
        charsPresent += allChars[i]
      }
    }
    retval.hostRange = charsPresent
  } else {
    retval.hostRange = ''
  }

  regex = new RegExp(/^.*(\.gif|\.jpg|\.jpeg|\.png)/)
  result = regex.exec(uriTemplate)
  if (result && result[1] !== '') {
    retval.extension = result[1]
  } else {
    retval.extension = ''
  }
  return retval
}
