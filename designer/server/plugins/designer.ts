import pkg from "../../package.json";
import config from "../config";
import { newConfig, api, configurations } from "./routes";

export const designerPlugin: { plugin: Plugin<any> } = {
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
      server.route(newConfig.post);

      // DESIGNER
      server.route({
        method: "get",
        path: "/{id}",
        options: {
          handler: (request, h: ResponseToolkit) => {
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

      // GET DATA
      server.route(api.get);

      server.route(configurations.get);

      // SAVE DATA
      server.route(api.put);
    },
  },
};
