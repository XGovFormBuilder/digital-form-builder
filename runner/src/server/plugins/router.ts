import Joi from "joi";
import Url from "url-parse";
import { redirectTo } from "./engine";
import { healthCheckRoute, publicRoutes } from "../routes";
import { HapiRequest, HapiResponseToolkit } from "../types";

const routes = [...publicRoutes, healthCheckRoute];

enum CookieValue {
  Accept = "accept",
  Reject = "reject",
}

// TODO: Replace with `type Cookies = `${CookieValue}`;` when Prettier is updated to a version later than 2.2
type Cookies = "accept" | "reject";

interface CookiePayload {
  cookies: Cookies;
  referrer: string;
}

export default {
  plugin: {
    name: "router",
    register: (server) => {
      server.route(routes);

      server.route([
        {
          method: "get",
          path: "/help/cookies",
          handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.view("help/cookies");
          },
        },
        {
          method: "post",
          options: {
            validate: {
              payload: Joi.object({
                cookies: Joi.string()
                  .valid(CookieValue.Accept, CookieValue.Reject)
                  .required(),
                referrer: Joi.string().required(),
              }).required(),
            },
          },
          path: "/help/cookies",
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { cookies, referrer } = request.payload as CookiePayload;
            const { href, origin } = new Url(referrer);
            const redirect = href.replace(origin, ""); // Ensure you only redirect to a local path
            const accept = cookies === "accept";

            return h.redirect(redirect).state(
              "cookies_policy",
              {
                isHttpOnly: false, // Set this to false so that Google tag manager can read cookie preferences
                isSet: true,
                essential: true,
                analytics: accept ? "on" : "off",
                usage: accept,
              },
              {
                isHttpOnly: true,
                path: "/",
              }
            );
          },
        },
      ]);

      server.route({
        method: "get",
        path: "/help/terms-and-conditions",
        handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
          return h.view("help/terms-and-conditions");
        },
      });

      server.route({
        method: "get",
        path: "/help/accessibility-statement",
        handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
          return h.view("help/accessibility-statement");
        },
      });

      server.route({
        method: "get",
        path: "/clear-session",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          if (request.yar) {
            request.yar.reset();
          }
          const { redirect } = request.query;
          return redirectTo(request, h, (redirect as string) || "/");
        },
      });

      server.route({
        method: "get",
        path: "/timeout",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          if (request.yar) {
            request.yar.reset();
          }

          let startPage = "/";

          const { referer } = request.headers;

          if (referer) {
            const match = referer.match(/https?:\/\/[^/]+\/([^/]+).*/);
            if (match && match.length > 1) {
              startPage = `/${match[1]}`;
            }
          }

          return h.view("timeout", {
            startPage,
          });
        },
      });
    },
  },
};
