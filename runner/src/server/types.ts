import yar from "@hapi/yar";
import {
  Request,
  ResponseToolkit,
  Server,
  ResponseObject,
  Lifecycle,
} from "hapi";
import { Logger } from "pino";

import { RateOptions } from "./plugins/rateLimit";
import {
  CacheService,
  EmailService,
  NotifyService,
  PayService,
  StatusService,
  UploadService,
  WebhookService,
} from "./services";
import { FormModel } from "server/plugins/engine/models";
import { Page } from "@xgovformbuilder/model/dist/module/data-model/types";
import { PageController } from "./plugins/engine/pageControllers";

type Services = (
  services: string[]
) => {
  cacheService: CacheService;
  emailService: EmailService;
  notifyService: NotifyService;
  payService: PayService;
  uploadService: UploadService;
  webhookService: WebhookService;
  statusService: StatusService;
};

export type RouteConfig = {
  rateOptions?: RateOptions;
  formFileName?: string;
  formFilePath?: string;
  enforceCsrf?: boolean;
};

declare module "hapi" {
  // Here we are decorating Hapi interface types with
  // props from plugins which doesn't export @types
  interface Request {
    services: Services; // plugin schmervice
    i18n: {
      // plugin locale
      setLocale(lang: string): void;
      getLocale(request: Request): void;
      getDefaultLocale(): string;
      getLocales(): string[];
    };
    logger: Logger;
    yar: yar.Yar;
    server: Server;
    form?: FormModel;
    page?: PageController;
  }

  interface Response {}

  interface Server {
    logger: Logger;
    services: Services; // plugin schmervice
    registerService: (services: any[]) => void; // plugin schmervice
    yar: yar.ServerYar;
    app: ApplicationState;
  }
  interface ApplicationState {
    forms: {
      [key: string]: FormModel;
    };
  }

  interface ResponseToolkit {
    view: (viewName: string, data?: { [prop: string]: any }) => any; // plugin view
    localPluginRedirect: ResponseToolkit["redirect"]; // prepends the plugin's prefix to h.direct.
  }

  interface RequestApplicationState {
    location: string;
    forms: {
      [key: string]: FormModel;
    };
  }
}

export type HapiRequest = Request;
export type HapiResponseToolkit = ResponseToolkit;
export type HapiLifecycleMethod = Lifecycle.Method;
export type HapiServer = Server;
export type HapiResponseObject = ResponseObject;
