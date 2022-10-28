import fs from "fs";
import hapi from "@hapi/hapi";

import Scooter from "@hapi/scooter";
import inert from "@hapi/inert";
import Schmervice from "schmervice";
import blipp from "blipp";
import config from "./config";

import { rateLimitPlugin } from "./plugins/rateLimit";
import { configureBlankiePlugin } from "./plugins/blankie";
import { configureCrumbPlugin } from "./plugins/crumb";

import pluginLocale from "./plugins/locale";
import session from "./plugins/session";
import auth from "./plugins/auth";
import views from "./plugins/views";
import router from "./plugins/router";
import errorPages from "./plugins/errorPages";
import logging from "./plugins/logging";

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

  await server.register(logging);
  await server.register(session);

  await server.register(inert);
  await server.register(Scooter);
  await server.register(configureBlankiePlugin(config));
  await server.register(configureCrumbPlugin(config, routeConfig));
  await server.register(auth);

  /**
   * allows you to register services that will be accessible via `request.services`
   */
  await server.register(Schmervice);
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

  /**
   * Allows a user's session to be rehydrated
   */
  await server.register(initialiseSession);

  await server.register(pluginLocale);

  await server.register(views);

  await server.register(applicationStatus);
  await server.register(router);
  await server.register(errorPages);
  await server.register(blipp);

  server.state("cookies_policy", {
    encoding: "base64json",
  });

  return server;
}

export default createServer;
