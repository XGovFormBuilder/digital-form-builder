const hoek = require('hoek')
const Catbox = require('@hapi/catbox')
const CatboxRedis = require('@hapi/catbox-redis')
const CatboxMemory = require('@hapi/catbox-memory')
const { redisUrl, redisPort, redisPassword } = require('./config')
let isDev = false

let partition = 'cache'

const adapter = isDev && redisUrl ? CatboxMemory : CatboxRedis

const cache = isDev ? { } : new Catbox.Client(adapter, {
  host: redisUrl,
  port: redisPort,
  password: redisPassword,
  partition
})

async function start () {
  return cache.start()
}

try {
  start()
} catch (e) {
  console.error(e)
}

const Key = (id) => {
  return {
    segment: partition,
    id
  }
}

async function getState (request) {
  return cache.get(Key(request.yar.id) || {})
}

async function mergeState (request, value) {
  const state = await getState(request)
  const item = state && state.item ? state.item : {}
  hoek.merge(item, value, true, false)
  return cache.set(Key(request.yar.id), item, 30 * 60 * 1000)
}

module.exports = { getState, mergeState }
