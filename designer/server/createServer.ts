import hapi from "@hapi/hapi";
import inert from "@hapi/inert";
import logging from "./plugins/logging";
import router from "./plugins/router";
import { viewPlugin } from "./plugins/view";
import { designerPlugin } from "./plugins/designer";
import Schmervice from "schmervice";
import config from "./config";
import { determinePersistenceService } from "./lib/persistence";

const serverOptions = () => {
  return {
    port: process.env.PORT || 3000,
    routes: {
      validate: {
        options: {
          abortEarly: false,
        },
      },
    },
  };
};

export async function createServer() {
  const server = hapi.server(serverOptions());
  await server.register(inert);
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
