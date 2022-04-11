import hapi from "@hapi/hapi";
import inert from "@hapi/inert";
import Scooter from "@hapi/scooter";
import logging from "./plugins/logging";
import router from "./plugins/router";
import { viewPlugin } from "./plugins/view";
import { designerPlugin } from "./plugins/designer";
import Schmervice from "schmervice";
import config from "./config";
import { determinePersistenceService } from "./lib/persistence";
import { configureBlankiePlugin } from "./plugins/blankie";
import { configureYarPlugin } from "./plugins/session";

const serverOptions = () => {
  return {
    port: process.env.PORT || 3000,
    routes: {
      validate: {
        options: {
          abortEarly: false,
        },
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false,
        },
        xss: true,
        noSniff: true,
        xframe: true,
      },
    },
  };
};

export async function createServer() {
  const server = hapi.server(serverOptions());
  await server.register(inert);
  await server.register(Scooter);
  await server.register(configureBlankiePlugin());
  await server.register(configureYarPlugin());
  await server.register(viewPlugin);
  await server.register(Schmervice);
  (server as any).registerService([
    Schmervice.withName(
      "persistenceService",
      determinePersistenceService(config.persistentBackend, server)
    ),
  ]);
  await server.register(designerPlugin);
  await server.register(router);
  await server.register(logging);

  return server;
}
