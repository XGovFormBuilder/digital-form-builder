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
            return h.redirect("/new");
          },
        },
      });

      server.route(newConfig.get);
      server.route(newConfig.registerNewFormWithRunner);

      // DESIGNER
      server.route({
        method: "get",
        path: "/{id}",
        options: {
          handler: (request, h) => {
            const { id } = request.params;
            return h.view("designer", {
              id,
              previewUrl: config.previewUrl,
              phase: config.phase,
              footerText: config.footerText,
            });
          },
        },
      });

      server.route(api.getFormWithId);
      server.route(api.putFormWithId);

      server.route(configurations.getAllPersistedConfigurations);
    },
  },
};
