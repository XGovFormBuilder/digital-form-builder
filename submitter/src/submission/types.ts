import { Server } from "@hapi/hapi";
import { Logger } from "pino";
import { WebhookService, QueueService } from "./services";

type Services = (
  services: string[]
) => {
  webhookService: WebhookService;
  queueService: QueueService;
};

declare module "@hapi/hapi" {
  // Here we are decorating Hapi interface types with
  // props from plugins which doesn't export @types

  interface Server {
    logger: Logger;
    services: Services; // plugin schmervice
    registerService: (services: any[]) => void; // plugin schmervice
  }
}

export type HapiServer = Server;
