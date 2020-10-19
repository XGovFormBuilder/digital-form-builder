import hoek from "hoek";
import CatboxRedis from "@hapi/catbox-redis";
import CatboxMemory from "@hapi/catbox-memory";
import Redis from "ioredis";

import {
  redisHost,
  redisPort,
  redisPassword,
  redisTls,
  isSandbox,
  sessionTimeout,
} from "../config";

const partition = "cache";

export class CacheService {
  constructor(server) {
    this.cache = server.cache({ segment: "cache" });
  }

  async getState(request) {
    const cached = await this.cache.get(
      this.Key(request.yar.id, request.query.visit)
    );
    return cached || {};
  }

  async mergeState(request, value, nullOverride = true, arrayMerge = false) {
    const key = this.Key(request.yar.id, request.query.visit);
    const state = await this.getState(request);
    hoek.merge(state, value, nullOverride, arrayMerge);
    await this.cache.set(key, state, sessionTimeout);
    return this.cache.get(key);
  }

  async clearState(request) {
    if (request.yar && request.yar.id) {
      this.cache.drop(this.Key(request.yar.id, request.query.visit));
    }
  }

  Key(sessionId, visitId) {
    return {
      segment: partition,
      id: `${sessionId}:${visitId}`,
    };
  }
}

export const catboxProvider = () => {
  const provider = {
    constructor: redisHost ? CatboxRedis : CatboxMemory,
    options: {},
  };

  if (redisHost) {
    const redisOptions = {};
    if (redisPassword) {
      redisOptions.password = redisPassword;
    }
    if (redisTls) {
      redisOptions.tls = {};
    }

    const client = isSandbox
      ? new Redis({ host: redisHost, port: redisPort, password: redisPassword })
      : new Redis.Cluster(
          [
            {
              host: redisHost,
              port: redisPort,
            },
          ],
          {
            dnsLookup: (address, callback) => callback(null, address),
            redisOptions,
          }
        );
    provider.options = { client, partition };
  } else {
    provider.options = { partition };
  }

  return provider;
};
