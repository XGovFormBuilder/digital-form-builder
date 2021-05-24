import hoek from "hoek";
import CatboxRedis from "@hapi/catbox-redis";
import CatboxMemory from "@hapi/catbox-memory";
import Redis from "ioredis";

import config from "../config";
import { HapiRequest, HapiServer } from "../types";
import { FormSubmissionState } from "../plugins/engine/types";

const {
  redisHost,
  redisPort,
  redisPassword,
  redisTls,
  isSandbox,
  sessionTimeout,
} = config;
const partition = "cache";

export class CacheService {
  /**
   * This service is responsible for getting, storing or deleting a user's session data in the cache. This service has been registered by {@link createServer}
   */
  cache: any;

  constructor(server: HapiServer) {
    this.cache = server.cache({ segment: "cache" });
  }

  async getState(request: HapiRequest): Promise<FormSubmissionState> {
    const cached = await this.cache.get(
      this.Key(request.yar.id, request.params.id)
    );
    return cached || {};
  }

  async mergeState(
    request: HapiRequest,
    value: object,
    nullOverride = true,
    arrayMerge = false
  ) {
    const key = this.Key(request.yar.id, request.params.id);
    const state = await this.getState(request);
    hoek.merge(state, value, nullOverride, arrayMerge);
    await this.cache.set(key, state, sessionTimeout);
    return this.cache.get(key);
  }

  async clearState(request: HapiRequest) {
    if (request.yar && request.yar.id) {
      this.cache.drop(this.Key(request.yar.id, request.params.id));
    }
  }

  /**
   * The key used to store user session data against.
   * If there are multiple forms on the same runner instance, for example `form-a` and `form-a-feedback` this will prevent CacheService from clearing data from `form-a` if a user gave feedback before they finished `form-a`
   *
   * @param sessionId - provided by @hapi/yar
   * @param formId - this is the id of the form the server was initiated with
   */
  Key(sessionId: string, formId: string) {
    return {
      segment: partition,
      id: `${sessionId}:${formId}`,
    };
  }
}

export const catboxProvider = () => {
  /**
   * If redisHost doesn't exist, CatboxMemory will be used instead.
   * More information at {@link https://hapi.dev/module/catbox/api}
   */
  const provider = {
    constructor: redisHost ? CatboxRedis : CatboxMemory,
    options: {},
  };

  if (redisHost) {
    const redisOptions: {
      password?: string;
      tls?: {};
    } = {};

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
            dnsLookup: (address, callback) => callback(null, address, 4),
            redisOptions,
          }
        );
    provider.options = { client, partition };
  } else {
    provider.options = { partition };
  }

  return provider;
};
