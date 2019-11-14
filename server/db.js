const hoek = require('hoek')
const Catbox = require('@hapi/catbox')
const CatboxRedis = require('@hapi/catbox-redis')
const CatboxMemory = require('@hapi/catbox-memory')
const { redisHost, redisPort, redisPassword, redisTls } = require('./config')

let partition = 'cache'
let cache

if (redisHost) {
  const redis = require('ioredis')

  const redisOptions = {}
  if (redisPassword) {
    redisOptions.password = redisPassword
  }
  if (redisTls) {
    redisOptions.tls = {}
  }

  const client = new redis.Cluster([{
    host: redisHost,
    port: redisPort
  }], {
    dnsLookup: (address, callback) => callback(null, address),
    redisOptions
  })

  const options = {
    client,
    partition
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

async function clearState (request) {
  cache.drop(Key(request.yar.id))
}

module.exports = { getState, mergeState, clearState }
