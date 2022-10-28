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
import { plugin } from "./plugins/engine/plugin";
const hasCertificate = config.sslKey && config.sslCert;

const serverOptions = {
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
  cache: [{ provider: catboxProvider() }],
  ...(hasCertificate
    ? {
        tls: {
          key: fs.readFileSync(config.sslKey),
          cert: fs.readFileSync(config.sslCert),
        },
      }
    : {}),
};

async function createServer(routeConfig: RouteConfig) {
  const server = hapi.server(serverOptions);

  if (config.rateLimit) {
    await server.register(rateLimitPlugin);
  }

  await server.register(logging);
  await server.register(session);

  await server.register(inert);

  /**
   * user agent information, required for blankie
   */
  await server.register(Scooter);

  /**
   * content security policy
   */
  await server.register(configureBlankiePlugin(config));

  /**
   * CSRF
   */
  await server.register(configureCrumbPlugin(config, routeConfig));

  /**
   * Authentication strategy
   */
  await server.register(auth);

  await server.register(plugin);

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

  /**
   * serves /{id}/status
   */
  await server.register(applicationStatus);

  /**
   * misc routes
   * TODO: maybe needs renaming?
   */
  await server.register(router);

  /**
   * catches and renders errors
   */
  await server.register(errorPages);

  /**
   * On startup prints out the registered routes
   */
  await server.register(blipp);

  server.state("cookies_policy", {
    encoding: "base64json",
  });

  return server;
}

export default createServer;
