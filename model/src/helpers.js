const serialiseAndDeserialise = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

const clone = (obj) => {
  if (obj) {
    if (typeof obj.clone === 'function') {
      return obj.clone()
    }
    return serialiseAndDeserialise(obj)
  }
  return obj
}

module.exports.serialiseAndDeserialise = serialiseAndDeserialise
module.exports.clone = clone
