import { Request, ResponseToolkit, Server as HapiServer } from "hapi";
import type {} from "wreck";
import {
  CacheService,
  EmailService,
  NotifyService,
  PayService,
  SheetsService,
  UploadService,
  WebhookService,
} from "./services";

export type HapiRequest = Request & {
  isBoom: boolean;
  services: (
    services: string[]
  ) => {
    cacheService: CacheService;
    emailService: EmailService;
    notifyService: NotifyService;
    payService: PayService;
    sheetsService: SheetsService;
    uploadService: UploadService;
    webhookService: WebhookService;
  };
};
export type HapiResponseToolkit = ResponseToolkit & {
  view: (viewName: string, data?: { [prop: string]: any }) => any;
};

export type Server = HapiServer & {};
