import AuthCookie from "@hapi/cookie";
import Bell from "@hapi/bell";

import config from "server/config";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { redirectTo } from "server/plugins/engine";
import generateCookiePassword from "server/utils/generateCookiePassword";

export const shouldLogin = (request: HapiRequest) =>
  config.authEnabled && !request.auth.isAuthenticated;

export default {
  plugin: {
    name: "auth",
    register: async (server) => {
      if (!config.authEnabled) {
        return;
      }

      await server.register(AuthCookie);
      await server.register(Bell);

      server.auth.strategy("session", "cookie", {
        cookie: {
          name: "auth",
          password: config.sessionCookiePassword || generateCookiePassword(),
          isSecure: true,
        },
      });

      server.auth.strategy("oauth", "bell", {
        provider: {
          name: "oauth",
          protocol: "oauth2",
          auth: config.authClientAuthUrl,
          token: config.authClientTokenUrl,
          scope: ["read write"],
          profile: async (credentials, _params, get) => {
            const { email, first_name, last_name, user_id } = await get(
              config.authClientProfileUrl
            );
            credentials.profile = { email, first_name, last_name, user_id };
          },
        },
        password: config.sessionCookiePassword || generateCookiePassword(),
        clientId: config.authClientId,
        clientSecret: config.authClientSecret,
        forceHttps: config.serviceUrl.startsWith("https"),
      });

      server.auth.default({ strategy: "session", mode: "try" });

      server.route({
        method: ["GET", "POST"],
        path: "/login",
        config: {
          auth: "oauth",
          handler: (request: HapiRequest, h: HapiResponseToolkit) => {
            if (request.auth.isAuthenticated) {
              request.cookieAuth.set(request.auth.credentials.profile);
              const returnUrl =
                request.auth.credentials.query?.returnUrl || "/";
              return redirectTo(request, h, returnUrl);
            }

            return h.response(JSON.stringify(request));
          },
        },
      });

      server.route({
        method: "get",
        path: "/logout",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          request.cookieAuth.clear();
          request.yar.reset();

          return redirectTo(request, h, "/");
        },
      });
    },
  },
};
