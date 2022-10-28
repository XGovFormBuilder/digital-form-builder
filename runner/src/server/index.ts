import fs from "fs";
import hapi, { ServerOptions } from "@hapi/hapi";

import Scooter from "@hapi/scooter";
import inert from "@hapi/inert";
import Schmervice from "schmervice";
import blipp from "blipp";
import config from "./config";

import { configureRateLimitPlugin, rateLimitPlugin } from "./plugins/rateLimit";
import { configureBlankiePlugin } from "./plugins/blankie";
import { configureCrumbPlugin } from "./plugins/crumb";

import pluginLocale from "./plugins/locale";
import pluginSession from "./plugins/session";
import pluginAuth from "./plugins/auth";
import pluginViews from "./plugins/views";
import pluginRouter from "./plugins/router";
import pluginErrorPages from "./plugins/errorPages";
import pluginLogging from "./plugins/logging";
import pluginPulse from "./plugins/pulse";
import {
  AddressService,
  CacheService,
  catboxProvider,
  EmailService,
  NotifyService,
  PayService,
  StatusService,
  UploadService,
  WebhookService,
} from "./services";
import { RouteConfig } from "./types";

import { initialiseSession } from "./plugins/engine/router/initialiseSession";
import { applicationStatus } from "./plugins/engine/router/applicationStatus";
import { handleFontCache } from "./ext/handleFontCache";
const hasCertificate = config.sslKey && config.sslCert;
const serverOptions = {
  debug: { request: "*" },
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
  cache: [{ provider: catboxProvider() }],
  tls: hasCertificate
    ? {
        key: fs.readFileSync(config.sslKey),
        cert: fs.readFileSync(config.sslCert),
      }
    : {},
};

async function createServer(routeConfig: RouteConfig) {
  const server = hapi.server(serverOptions);

  if (config.rateLimit) {
    await server.register(rateLimitPlugin);
  }

  await server.register(pluginLogging);
  await server.register(pluginSession);
  await server.register(pluginPulse);
  await server.register(inert);
  await server.register(Scooter);
  await server.register(initialiseSession);
  await server.register(configureBlankiePlugin(config));
  await server.register(configureCrumbPlugin(config, routeConfig));
  await server.register(Schmervice);
  await server.register(pluginAuth);

  server.registerService([
    CacheService,
    NotifyService,
    PayService,
    UploadService,
    EmailService,
    WebhookService,
    StatusService,
    AddressService,
  ]);

  server.ext("onPreResponse", handleFontCache);

  await server.register(pluginLocale);
  await server.register(pluginViews);
  await server.register(applicationStatus);
  await server.register(pluginRouter);
  await server.register(pluginErrorPages);
  await server.register(blipp);

  server.state("cookies_policy", {
    encoding: "base64json",
  });

  return server;
}

export default createServer;
