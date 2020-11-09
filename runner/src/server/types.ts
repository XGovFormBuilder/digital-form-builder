import { Request, ResponseToolkit } from "hapi";
import {} from "@types/yar";

export type HapiRequest = Request & {
  services: (
    services: string[]
  ) => {
    // TODO: add service types once converted to TS
    cacheService: any;
    notifyService: any;
    payService: any;
    uploadService: any;
    emailService: any;
    webhookService: any;
    sheetsService: any;
  };
};
export type HapiResponseToolkit = ResponseToolkit & {
  view: (viewName: string, data: { [prop: string]: any }) => any;
};
