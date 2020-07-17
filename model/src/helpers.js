module.exports.serialiseAndDeserialise = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

module.exports.clone = (obj) => {
  if (obj) {
    if (typeof obj.clone === 'function') {
      return obj.clone()
    }
    return serialiseAndDeserialise(obj)
  }
  return obj
}
