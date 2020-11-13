import { redirectTo } from "./engine";
import publicRoutes from "../routes/public";
import { HapiRequest, HapiResponseToolkit } from "../types";

const routes = [...publicRoutes];

export default {
  plugin: {
    name: "router",
    register: (server) => {
      server.route(routes);

      server.route({
        method: "get",
        path: "/help/cookies",
        handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
          return h.view("help/cookies");
        },
      });

      server.route({
        method: "get",
        path: "/help/terms-and-conditions",
        handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
          return h.view("help/terms-and-conditions");
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
