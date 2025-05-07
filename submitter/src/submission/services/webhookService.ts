import { post, put } from "./httpService";
import { HapiServer } from "../types";

const DEFAULT_OPTIONS = {
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
  timeout: 60000,
};

export class WebhookService {
  logger: any;

  constructor(server: HapiServer) {
    this.logger = server.logger;
  }

  async postRequest(
    url: string,
    data: string,
    method: "POST" | "PUT" = "POST"
  ) {
    const request = method === "POST" ? post : put;

    let parsed;

    try {
      parsed = JSON.parse(data);
    } catch (e) {
      // Commented out due to potential for logging PII
      // this.logger.error(`Not submitting ${data}, ${e}`);
      return { payload: { error: e.message } };
    }

    // Commented out due to potential for logging PII
    // this.logger.info({ data: parsed }, `${method} to ${url}`);

    try {
      const { payload } = await request(url, {
        ...DEFAULT_OPTIONS,
        payload: parsed,
      });

      const { reference } = JSON.parse(payload);

      return { payload: { reference: reference ?? "UNKNOWN" } };
    } catch (e) {
      if (e.isBoom) {
        return e.output;
      }
      // Commented out due to potential for logging PII
      // this.logger.error({ data }, e);
      return { payload: { error: e.message } };
    }
  }
}
