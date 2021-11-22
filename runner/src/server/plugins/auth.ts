import AuthCookie from "hapi-auth-cookie";
import Bell from "bell";

import config from "server/config";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { redirectTo } from "server/plugins/engine";
import generateCookiePassword from "server/utils/generateCookiePassword";

export default {
  plugin: {
    name: "auth",
    register: async (server) => {
      if (!config.ssoEnabled) {
        return;
      }

      await server.register(AuthCookie);
      await server.register(Bell);

      server.auth.strategy("session", "cookie", {
        cookie: {
          name: "auth",
          password: config.sessionCookiePassword || generateCookiePassword(),
          isSecure: false,
        },
      });

      server.auth.strategy("oauth", "bell", {
        provider: {
          name: "oauth",
          protocol: "oauth2",
          auth: config.ssoClientAuthUrl,
          token: config.ssoClientTokenUrl,
          scope: ["read write"],
          profile: async (credentials, _params, get) => {
            const { email, first_name, last_name, user_id } = await get(
              config.ssoClientProfileUrl
            );
            credentials.profile = { email, first_name, last_name, user_id };
          },
        },
        password: config.sessionCookiePassword || generateCookiePassword(),
        clientId: config.ssoClientId,
        clientSecret: config.ssoClientSecret,
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
              return redirectTo(request, h, "/account");
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

          return redirectTo(request, h, "/account");
        },
      });

      // TODO: login and logout should redirect to previous page, this is only useful for testing.
      server.route({
        method: "get",
        path: "/account",
        config: {
          handler: (request: HapiRequest, h: HapiResponseToolkit) => {
            const profile =
              request.auth.isAuthenticated && request.auth.credentials;

            return h.view("account", {
              loggedIn: request.auth.isAuthenticated,
              profile: profile,
            });
          },
        },
      });
    },
  },
};
