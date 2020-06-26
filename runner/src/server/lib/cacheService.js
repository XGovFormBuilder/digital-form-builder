const hoek = require('hoek')
const CatboxRedis = require('@hapi/catbox-redis')
const CatboxMemory = require('@hapi/catbox-memory')
const { redisHost, redisPort, redisPassword, redisTls, isSandbox, sessionTimeout } = require('../config')
const Redis = require('ioredis')

const partition = 'cache'

const Key = (id) => {
  return {
    segment: partition,
    id
  }
}

class CacheService {
  constructor (server, options) {
    this.cache = server.cache({ segment: 'cache' })
  }

  async getState (request) {
    const cached = await this.cache.get(Key(request.yar.id))
    return cached || {}
  }

  async mergeState (request, value, nullOverride = true, arrayMerge = false) {
    const key = Key(request.yar.id)
    const state = await this.getState(request)
    hoek.merge(state, value, nullOverride, arrayMerge)
    await this.cache.set(key, state, sessionTimeout)
    return this.cache.get(key)
  }

  async clearState (request) {
    if (request.yar && request.yar.id) {
      this.cache.drop(Key(request.yar.id))
    }
  }
}

const catboxProvider = () => {
  const provider = {
    constructor: redisHost ? CatboxRedis : CatboxMemory,
    options: {}
  }

  if (redisHost) {
    const redisOptions = {}
    if (redisPassword) {
      redisOptions.password = redisPassword
    }
    if (redisTls) {
      redisOptions.tls = {}
    }

    const client = isSandbox ? new Redis({ host: redisHost, port: redisPort, password: redisPassword }) : new Redis.Cluster([{
      host: redisHost,
      port: redisPort
    }], {
      dnsLookup: (address, callback) => callback(null, address),
      redisOptions
    })
    provider.options = { client, partition }
  } else {
    provider.options = { partition }
  }

  return provider
}

module.exports = { CacheService, catboxProvider }
