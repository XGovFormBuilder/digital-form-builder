import hoek from "hoek";
import CatboxRedis from "@hapi/catbox-redis";
import CatboxMemory from "@hapi/catbox-memory";
import Jwt from "@hapi/jwt";
import Redis from "ioredis";

import config from "../config";
import { HapiRequest, HapiServer } from "../types";
import { FormSubmissionState } from "../plugins/engine/types";
import {
  DecodedSessionToken,
  InitialiseSessionOptions,
} from "server/plugins/initialiseSession/types";
import { WebhookSchema } from "../schemas/types";

const {
  redisHost,
  redisPort,
  redisPassword,
  redisTls,
  vcapServices,
  isSingleRedis,
  sessionTimeout,
} = config;
let redisUri;
const partition = "cache";

enum ADDITIONAL_IDENTIFIER {
  Confirmation = ":confirmation",
}

if (vcapServices) {
  const vcapJson = JSON.parse(vcapServices);
  if ("redis" in vcapJson) {
    redisUri = vcapJson.redis[0].credentials.uri;
  }
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
    hoek.merge(state, value, nullOverride, arrayMerge);
    await this.cache.set(key, state, sessionTimeout);
    return this.cache.get(key);
  }

  async getConfirmationState(request: HapiRequest) {
    const key = this.Key(request, ADDITIONAL_IDENTIFIER.Confirmation);
    return await this.cache.get(key);
  }

  async setConfirmationState(request: HapiRequest, viewModel) {
    const key = this.Key(request, ADDITIONAL_IDENTIFIER.Confirmation);
    return this.cache.set(key, viewModel, sessionTimeout);
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

    const form_session_identifier =
      initialisedSession.metadata?.form_session_identifier;
    let redirectPath = initialisedSession?.callback?.redirectPath ?? "";

    if (form_session_identifier) {
      userSessionKey.id = `${userSessionKey.id}:${form_session_identifier}`;
      redirectPath = `${redirectPath}?form_session_identifier=${form_session_identifier}`;
    }

    if (config.overwriteInitialisedSession) {
      request.logger.info("Replacing user session with initialisedSession");
      this.cache.set(userSessionKey, initialisedSession, sessionTimeout);
    } else {
      const currentSession = await this.cache.get(userSessionKey);
      const mergedSession = {
        ...currentSession,
        ...initialisedSession,
      };
      request.logger.info("Merging user session with initialisedSession");
      this.cache.set(userSessionKey, mergedSession, sessionTimeout);
    }

    await this.cache.drop(this.JWTKey(jwt));
    return {
      redirectPath: redirectPath,
    };
  }

  async clearState(request: HapiRequest) {
    if (request.yar?.id) {
      this.cache.drop(this.Key(request));
    }
  }

  /**
   * The key used to store user session data against.
   * If there are multiple forms on the same runner instance, for example `form-a` and `form-a-feedback` this will prevent CacheService from clearing data from `form-a` if a user gave feedback before they finished `form-a`
   *
   * @param request - hapi request object
   * @param additionalIdentifier - appended to the id
   */
  Key(request: HapiRequest, additionalIdentifier?: ADDITIONAL_IDENTIFIER) {
    let id = `${request.yar.id}:${request.params.id}`;

    if (request.query.form_session_identifier) {
      id = `${id}:${request.query.form_session_identifier}`;
    }

    return {
      segment: partition,
      id: `${id}${additionalIdentifier ?? ""}`,
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
    constructor: redisHost || redisUri ? CatboxRedis : CatboxMemory,
    options: {},
  };

  if (redisHost || redisUri) {
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

    const client = isSingleRedis
      ? new Redis(
          redisUri ?? {
            host: redisHost,
            port: redisPort,
            password: redisPassword,
          }
        )
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
