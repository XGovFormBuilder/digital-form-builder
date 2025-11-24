import Joi from "joi";
import { redirectTo } from "./engine";
import { healthCheckRoute, publicRoutes } from "../routes";
import { HapiRequest, HapiResponseToolkit } from "../types";
import config from "../config";
import getRequestInfo from "server/utils/getRequestInfo";

const routes = [...publicRoutes, healthCheckRoute];

enum CookieValue {
  Accept = "accept",
  Reject = "reject",
}

// TODO: Replace with `type Cookies = `${CookieValue}`;` when Prettier is updated to a version later than 2.2
type Cookies = "accept" | "reject";

interface CookiePayload {
  cookies: Cookies;
  crumb: string;
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
          path: "/help/privacy",
          handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
            if (config.privacyPolicyUrl) {
              return h.redirect(config.privacyPolicyUrl);
            }
            return h.view("help/privacy");
          },
        },
        {
          method: "get",
          path: "/help/cookies",
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const cookiesPolicy = request.state.cookies_policy;
            let analytics =
              cookiesPolicy?.analytics === "on" ? "accept" : "reject";
            return h.view("help/cookies", {
              analytics,
            });
          },
        },
        {
          method: "post",
          options: {
            payload: {
              parse: true,
              multipart: true,
              failAction: async (
                request: HapiRequest,
                h: HapiResponseToolkit
              ) => {
                request.server.plugins.crumb.generate?.(request, h);
                return h.continue;
              },
            },
            validate: {
              payload: Joi.object({
                cookies: Joi.string()
                  .valid(CookieValue.Accept, CookieValue.Reject)
                  .required(),
                crumb: Joi.string(),
              }).required(),
            },
          },
          path: "/help/cookies",
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { cookies } = request.payload as CookiePayload;
            const accept = cookies === "accept";

            const { referrer } = getRequestInfo(request);
            let redirectPath = "/help/cookies";

            if (referrer) {
              redirectPath = new URL(referrer).pathname;
            }

            return h.redirect(redirectPath).state(
              "cookies_policy",
              {
                isHttpOnly: false, // Set this to false so that Google tag manager can read cookie preferences
                isSet: true,
                essential: true,
                analytics: accept ? "on" : "off",
                usage: accept,
              },
              {
                isHttpOnly: false,
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
        ]qwfpqwoelkfnjhqwpofihjqspioifjbeqpr;gv'po2 heo'fuvhqposdvbcjqs'dpovhcasdnvpoasj'd\v[aks
          dovsd
          va[SVGDefsElementasv[as
            vpasdv
            asvasdv
            as[dv
            ]a[snd'vlxz;vibvxc]s
            ]
          ]]
        ]
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
