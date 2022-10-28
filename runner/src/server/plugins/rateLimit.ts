import rateLimit from "hapi-rate-limit";

import Boom from "boom";
type CacheOptions = {
  segment: string;
  expiresIn: number;
  cache: string;
};

/**
 * {@link https://www.npmjs.com/package/hapi-rate-limit}
 */
type Options = {
  enabled: boolean;
  userLimit: false | number;
  userCache: CacheOptions;
  userAttribute: string;
  userWhitelist: string[];
  addressOnly: boolean;
  pathLimit: false | number;
  ignorePathParams: boolean;
  pathCache: CacheOptions;
  userPathLimit: false | boolean;
  userPathCache: CacheOptions;
  headers: boolean;
  ipWhitelist: string[];
  trustProxy: boolean;
  getIpFromProxyHeader?: (any) => string;
  limitExceededResponse: () => typeof Boom.tooManyRequests;
  authLimit: number;
  authToken: string;
};
const defaults: Partial<Options> = {
  trustProxy: true,
  pathLimit: false,
  userLimit: false,
  getIpFromProxyHeader: (header) => {
    // use the last in the list as this will be the 'real' ELB header
    const ips = header.split(",");
    return ips[ips.length - 1];
  },
};

export const rateLimitPlugin = {
  plugin: rateLimit,
  options: defaults,
};
