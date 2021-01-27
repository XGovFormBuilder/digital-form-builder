import pkg from "../../package.json";
import config from "../config";
import { newConfig, api, configurations } from "./routes";

export const designerPlugin = {
  plugin: {
    name: pkg.name,
    version: pkg.version,
    multiple: true,
    dependencies: "vision",
    register: async (server) => {
      server.route({
        method: "get",
        path: "/",
        options: {
          handler: async (_request, h) => {
            return h.redirect("/app");
          },
        },
      });

      // This is old url , redirecting it to new
      server.route({
        method: "get",
        path: "/new",
        options: {
          handler: async (_request, h) => {
            return h.redirect("/app").code(301);
          },
        },
      });

      server.route({
        method: "get",
        path: "/app",
        options: {
          handler: async (request, h) => {
            return h.view("designer", {
              phase: config.phase,
              previewUrl: config.previewUrl,
              footerText: config.footerText,
            });
          },
        },
      });

      // This is old url , redirecting it to new
      server.route({
        method: "get",
        path: "/{id}",
        options: {
          handler: async (_request, h) => {
            const { id } = _request.params;
            return h.redirect(`/app#/designer/${id}`).code(301);
          },
        },
      });

      server.route(newConfig.registerNewFormWithRunner);
      server.route(api.getFormWithId);
      server.route(api.putFormWithId);
      server.route(api.getAllPersistedConfigurations);
    },
  },
};
