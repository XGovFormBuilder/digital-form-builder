import hoek from "hoek";
import CatboxRedis from "@hapi/catbox-redis";
import CatboxMemory from "@hapi/catbox-memory";
import Jwt from "@hapi/jwt";
import Redis from "ioredis";

import config from "../config";
import { HapiRequest, HapiServer } from "../types";
import { ExitState, FormSubmissionState } from "../plugins/engine/types";
import {
  DecodedSessionToken,
  InitialiseSessionOptions,
} from "server/plugins/initialiseSession/types";
import { WebhookSchema } from "../schemas/types";
import { ExitResponse } from "server/services/ExitService";

const {
  redisHost,
  redisPort,
  redisPassword,
  redisTls,
  isSandbox,
  sessionTimeout,
  confirmationSessionTimeout,
  paymentSessionTimeout,
} = config;
const partition = "cache";

enum ADDITIONAL_IDENTIFIER {
  Confirmation = ":confirmation",
}

export class CacheService {
  /**
   * This service is responsible for getting, storing or deleting a user's session data in the cache. This service has been registered by {@link createServer}
   */
  cache: any;
  logger: HapiServer["logger"];

  constructor(server: HapiServer) {
    this.cache = server.cache({ segment: "cache" });
    this.logger = server.logger;
  }

  async getState(request: HapiRequest): Promise<FormSubmissionState> {
    const cached = await this.cache.get(this.Key(request));
    return cached || {};
  }

  async mergeState(
    request: HapiRequest,
    value: object,
    nullOverride = true,
    arrayMerge = false
  ) {
    const key = this.Key(request);
    const state = await this.getState(request);
    let ttl = sessionTimeout;
    hoek.merge(state, value, nullOverride, arrayMerge);
    if (!!state.pay) {
      this.logger.info(
        ["cacheService", request.yar.id],
        `Pay state detected setting session TTL to ${paymentSessionTimeout}.`
      );
      ttl = paymentSessionTimeout;
    }
    await this.cache.set(key, state, ttl);
    return this.cache.get(key);
  }

  async getConfirmationState(request: HapiRequest) {
    const key = this.Key(request, ADDITIONAL_IDENTIFIER.Confirmation);
    return await this.cache.get(key);
  }

  async setConfirmationState(request: HapiRequest, viewModel, ttl?: number) {
    const key = this.Key(request, ADDITIONAL_IDENTIFIER.Confirmation);
    const timeout = ttl ?? confirmationSessionTimeout;
    return this.cache.set(key, viewModel, timeout);
  }

  async createSession(
    jwt: string,
    data: {
      callback: InitialiseSessionOptions;
    } & Partial<WebhookSchema>
  ) {
    return this.cache.set(
      this.JWTKey(jwt),
      data,
      config.initialisedSessionTimeout
    );
  }

  async activateSession(jwt, request) {
    const { decoded } = Jwt.token.decode(jwt);
    const { payload }: { payload: DecodedSessionToken } = decoded;

    const userSessionKey = {
      segment: partition,
      id: `${request.yar.id}:${payload.group}`,
    };

    const initialisedSession = await this.cache.get(this.JWTKey(jwt));

    const currentSession = await this.cache.get(userSessionKey);
    const mergedSession = {
      ...currentSession,
      ...initialisedSession,
    };
    this.cache.set(userSessionKey, mergedSession, sessionTimeout);
    await this.cache.drop(this.JWTKey(jwt));
    return {
      redirectPath: initialisedSession?.callback?.redirectPath ?? "",
    };
  }

  /**
   * Sets the exitState (via merge) to the user's state.
   */
  async setExitState(request: HapiRequest, exitState: Partial<ExitState>) {
    return this.mergeState(request, { exitState });
  }

  async clearState(request: HapiRequest) {
    if (request.yar?.id) {
      this.cache.drop(this.Key(request));
    }
  }

  async createMagicLinkRecord(
    email: string,
    hmac: string,
    currentTimestamp: string
  ) {
    const key = email;
    const value = {
      hmac: hmac,
      active: currentTimestamp,
    };
    return this.cache.set(key, value, config.sessionTimeout);
  }

  async updateMagicLinkRecord(
    email: string,
    hmac: string,
    currentTimestamp: string
  ) {
    const key = email;

    const value = {
      hmac: hmac,
      active: currentTimestamp,
    };
    return this.cache.set(key, value, config.sessionTimeout);
  }

  async searchForMagicLinkRecord(email: string) {
    const key = email;
    const emailCached = await this.cache.get(key);
    return emailCached ?? null;
  }

  async deleteMagicLinkRecord(email: string) {
    const key = email;
    return await this.cache.drop(key);
  }

  /**
   * The key used to store user session data against.
   * If there are multiple forms on the same runner instance, for example `form-a` and `form-a-feedback` this will prevent CacheService from clearing data from `form-a` if a user gave feedback before they finished `form-a`
   *
   * @param request - hapi request object
   * @param additionalIdentifier - appended to the id
   */
  Key(request: HapiRequest, additionalIdentifier?: ADDITIONAL_IDENTIFIER) {
    if (!request?.yar?.id) {
      throw Error("No session ID found");
    }
    return {
      segment: partition,
      id: `${request.yar.id}:${request.params.id}${additionalIdentifier ?? ""}`,
    };
  }

  JWTKey(jwt) {
    return {
      segment: partition,
      id: jwt,
    };
  }
}

export const catboxProvider = () => {
  /**
   * If redisHost doesn't exist, CatboxMemory will be used instead.
   * More information at {@link https://hapi.dev/module/catbox/api}
   */
  const provider = {
    constructor: redisHost ? CatboxRedis.Engine : CatboxMemory.Engine,
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
