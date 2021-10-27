import { Request, ResponseObject, ResponseToolkit, Server } from "@hapi/hapi";
import { PersistenceService } from "./lib/persistence/persistenceService";
import { Logger } from "pino";

type Services = (
  services: string[]
) => {
  persistenceService: PersistenceService;
};

declare module "@hapi/hapi" {
  // Here we are decorating Hapi interface types with
  // props from plugins which doesn't export @types
  interface Request {
    services: Services; // plugin schmervice
    logger: Logger;
  }

  interface Response {}

  interface Server {
    logger: Logger;
    services: Services; // plugin schmervice
    registerService: (services: any[]) => void; // plugin schmervice
    // log: (tags: string | string[], data?: any) => void;
  }

  interface ResponseToolkit {
    // view: (viewName: string, data?: { [prop: string]: any }) => any; // plugin view
  }
}

export type HapiRequest = Request;
export type HapiResponseToolkit = ResponseToolkit;
export type HapiServer = Server;
export type HapiResponseObject = ResponseObject;
