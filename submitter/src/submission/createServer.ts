import hapi, { ServerOptions } from "@hapi/hapi";
import { pluginLogging } from "./plugins/logging";
import { pluginQueue } from "./plugins/queue";
import config from "../config";
import { QueueService, WebhookService } from "./services";
import Schmervice from "schmervice";
import { pluginPoll } from "./plugins/poll";
import { pluginRetention } from "./plugins/retention";
import { pluginRetentionCron } from "./plugins/retentionCron";

const serverOptions: ServerOptions = {
  debug: { request: [`${config.isDev}`] },
  port: config.port,
  router: {
    stripTrailingSlash: true,
  },
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

export async function createServer(): Promise<hapi.Server> {
  const server = hapi.server(serverOptions);

  await server.register(pluginLogging);
  await server.register(pluginQueue);
  await server.register(Schmervice);

  server.registerService([WebhookService, QueueService]);

  await server.register(pluginPoll);
  await server.register(pluginRetention);
  await server.register(pluginRetentionCron);

  return server;
}
