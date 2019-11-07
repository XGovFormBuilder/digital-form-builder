const hoek = require('hoek')
const Catbox = require('@hapi/catbox')
const CatboxRedis = require('@hapi/catbox-redis')
const CatboxMemory = require('@hapi/catbox-memory')
const { redisHost, redisPort, redisPassword, redisTls } = require('./config')

let partition = 'cache'
let cache

if (redisHost) {
  const options = {
    host: redisHost,
    port: redisPort,
    partition
  }

  if (redisPassword) {
    options.password = redisPassword
  }

  if (redisTls) {
    options.tls = {}
  }

  cache = new Catbox.Client(CatboxRedis, options)
} else {
  cache = new Catbox.Client(CatboxMemory, { partition })
}

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
  let cached = await cache.get(Key(request.yar.id))
  return await cached !== null ? cached.item : {}
}

async function mergeState (request, value) {
  const key = Key(request.yar.id)
  const state = await getState(request)
  hoek.merge(state, value, true, false)
  await cache.set(key, state, 30 * 60 * 1000)
  let newState = await cache.get(key)
  return newState.item
}

module.exports = { getState, mergeState }
