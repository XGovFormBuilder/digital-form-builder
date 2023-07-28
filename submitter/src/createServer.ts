import hapi, { ServerOptions } from "@hapi/hapi";
import { pluginLogging } from "./plugins/logging";

const serverOptions: ServerOptions = {
  debug: { request: [`true`] },
  port: 9000,
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
  return server;
}
