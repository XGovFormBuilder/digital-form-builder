const hoek = require('hoek')

/*
  Simple in-memory data store used for saving page state.
  Should be replaced with a real db in production.
*/
const cache = {}

async function getState (request) {
  return Promise.resolve(cache[request.yar.id] || {})
}

async function mergeState (request, value) {
  const state = cache[request.yar.id] || {}
  hoek.merge(state, value, true, false)
  cache[request.yar.id] = state

  return Promise.resolve(state)
}

module.exports = { getState, mergeState }
