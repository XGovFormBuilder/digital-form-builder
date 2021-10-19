import Joi from "joi";
import Url from "url-parse";
import config from "server/config";
import { redirectTo } from "./engine";
import { publicRoutes, healthCheckRoute } from "../routes";
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
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { location } = request.app;
            const { cookies_policy: cookiesPolicy } = request.state;
            const viewModel = {
              cookiesPolicy,
              location,
            };

            return h.view("help/cookies", viewModel);
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
                isSet: true,
                essential: true,
                analytics: accept ? "on" : "off",
                usage: accept,
              },
              {
                isHttpOnly: config.isProd,
                path: "/",
              }
            );
          },
        },
      ]);

      server.route({
        method: "get",
        path: "/help/terms-and-conditions",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          const { location } = request.app;
          const { cookies_policy: cookiesPolicy } = request.state;
          const viewModel = {
            cookiesPolicy,
            location,
          };

          return h.view("help/terms-and-conditions", viewModel);
        },
      });

      server.route({
        method: "get",
        path: "/help/accessibility-statement",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          const { location } = request.app;
          const { cookies_policy: cookiesPolicy } = request.state;
          const viewModel = {
            cookiesPolicy,
            location,
          };

          return h.view("help/accessibility-statement", viewModel);
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

          const { location } = request.app;
          const { cookies_policy: cookiesPolicy } = request.state;
          const viewModel = {
            cookiesPolicy,
            location,
            startPage: "/",
          };

          const { referer } = request.headers;

          if (referer) {
            const match = referer.match(/https?:\/\/[^/]+\/([^/]+).*/);
            if (match && match.length > 1) {
              viewModel.startPage = `/${match[1]}`;
            }
          }

          return h.view("timeout", viewModel);
        },
      });
    },
  },
};
