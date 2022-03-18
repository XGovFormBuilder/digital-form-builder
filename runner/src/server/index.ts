import fs from "fs";
import hapi, { ServerOptions } from "@hapi/hapi";

import Scooter from "@hapi/scooter";
import inert from "@hapi/inert";
import Schmervice from "schmervice";
import blipp from "blipp";
import config from "./config";

import { configureEnginePlugin } from "./plugins/engine";
import { configureRateLimitPlugin } from "./plugins/rateLimit";
import { configureBlankiePlugin } from "./plugins/blankie";
import { configureCrumbPlugin } from "./plugins/crumb";
import { configureInitialiseSessionPlugin } from "server/plugins/initialiseSession/configurePlugin";

import pluginLocale from "./plugins/locale";
import pluginSession from "./plugins/session";
import pluginAuth from "./plugins/auth";
import pluginViews from "./plugins/views";
import pluginApplicationStatus from "./plugins/applicationStatus";
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
import { HapiRequest, HapiResponseToolkit, RouteConfig } from "./types";
import getRequestInfo from "./utils/getRequestInfo";

const serverOptions = (): ServerOptions => {
  const hasCertificate = config.sslKey && config.sslCert;

  const serverOptions: ServerOptions = {
    debug: { request: [`${config.isDev}`] },
    port: config.port,
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
  };

  const httpsOptions = hasCertificate
    ? {
        tls: {
          key: fs.readFileSync(config.sslKey),
          cert: fs.readFileSync(config.sslCert),
        },
      }
    : {};

  return {
    ...serverOptions,
    ...httpsOptions,
  };
};

async function createServer(routeConfig: RouteConfig) {
  const server = hapi.server(serverOptions());
  const { formFileName, formFilePath, options } = routeConfig;

  if (config.rateLimit) {
    await server.register(configureRateLimitPlugin(routeConfig));
  }
  await server.register(pluginSession);
  await server.register(pluginPulse);
  await server.register(inert);
  await server.register(Scooter);
  await server.register(configureBlankiePlugin(config));
  await server.register(configureCrumbPlugin(config, routeConfig));
  await server.register(pluginLogging);
  await server.register(Schmervice);
  await server.register(pluginAuth);
  await server.register(
    configureInitialiseSessionPlugin({
      safelist: config.safelist,
    })
  );

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

  server.ext(
    "onPreResponse",
    (request: HapiRequest, h: HapiResponseToolkit) => {
      const { response } = request;

      if ("isBoom" in response && response.isBoom) {
        return h.continue;
      }

      if ("header" in response && response.header) {
        response.header("X-Robots-Tag", "noindex, nofollow");

        const WEBFONT_EXTENSIONS = /\.(?:eot|ttf|woff|svg|woff2)$/i;
        if (!WEBFONT_EXTENSIONS.test(request.url.toString())) {
          response.header(
            "cache-control",
            "private, no-cache, no-store, must-revalidate, max-age=0"
          );
          response.header("pragma", "no-cache");
          response.header("expires", "0");
        } else {
          response.header("cache-control", "public, max-age=604800, immutable");
        }
      }
      return h.continue;
    }
  );

  server.ext("onRequest", (request: HapiRequest, h: HapiResponseToolkit) => {
    const { pathname } = getRequestInfo(request);

    request.app.location = pathname;

    return h.continue;
  });

  await server.register(pluginLocale);
  await server.register(pluginViews);
  await server.register(
    configureEnginePlugin(formFileName, formFilePath, options)
  );
  await server.register(pluginApplicationStatus);
  await server.register(pluginRouter);
  await server.register(pluginErrorPages);

  if (!config.isTest) {
    await server.register(blipp);
  }

  server.state("cookies_policy", {
    encoding: "base64json",
  });

  return server;
}

export default createServer;
