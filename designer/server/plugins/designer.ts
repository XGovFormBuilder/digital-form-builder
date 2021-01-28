import pkg from "../../package.json";
import config from "../config";
import { newConfig, api, app } from "./routes";

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
      server.route(app.redirectNewToApp);

      server.route(app.getApp);

      server.route(app.getAppChildRoutes);

      // This is old url , redirecting it to new
      server.route(app.redirectOldUrlToDesigner);

      server.route({
        method: "GET",
        path: "/feature-toggles",
        options: {
          handler: async (request, h) => {
            let environmentVariables = process.env;

            Object.keys(process.env).forEach(function (key) {
              if (key.substring(0, 2) != "ff") {
                delete environmentVariables[key];
              }
            });

            return h.response(JSON.stringify(environmentVariables)).code(200);
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
