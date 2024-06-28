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
  NotifyService,
  PayService,
  StatusService,
  UploadService,
  MockUploadService,
  WebhookService,
} from "./services";
import { HapiRequest, HapiResponseToolkit, RouteConfig } from "./types";
import getRequestInfo from "./utils/getRequestInfo";
import { pluginQueue } from "server/plugins/queue";
import { QueueStatusService } from "server/services/queueStatusService";
import { MySqlQueueService } from "server/services/mySqlQueueService";
import { PgBossQueueService } from "server/services/pgBossQueueService";

const serverOptions = (): ServerOptions => {
  const hasCertificate = config.sslKey && config.sslCert;

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
        xss: "enabled",
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
  await server.register(pluginLogging);
  await server.register(pluginSession);
  await server.register(pluginPulse);
  await server.register(inert);
  await server.register(Scooter);
  await server.register(
    configureInitialiseSessionPlugin({
      safelist: config.safelist,
    })
  );
  await server.register(configureBlankiePlugin(config));
  await server.register(configureCrumbPlugin(config, routeConfig));
  await server.register(Schmervice);
  await server.register(pluginAuth);

  server.registerService([
    CacheService,
    NotifyService,
    PayService,
    WebhookService,
    AddressService,
  ]);
  if (!config.documentUploadApiUrl) {
    server.registerService([
      Schmervice.withName("uploadService", MockUploadService),
    ]);
  } else {
    server.registerService([UploadService]);
  }

  if (config.enableQueueService) {
    const queueType = config.queueType;
    const queueService =
      queueType === "PGBOSS" ? PgBossQueueService : MySqlQueueService;
    server.registerService([
      Schmervice.withName("queueService", queueService),
      Schmervice.withName("statusService", QueueStatusService),
    ]);
  } else {
    server.registerService(StatusService);
  }

  server.ext(
    "onPreResponse",
    (request: HapiRequest, h: HapiResponseToolkit) => {
      const { response } = request;

      if ("isBoom" in response && response.isBoom) {
        return h.continue;
      }

      if ("header" in response && response.header) {
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
  await server.register(blipp);

  server.state("cookies_policy", {
    encoding: "base64json",
  });

  await server.register(pluginQueue);

  return server;
}

export default createServer;
