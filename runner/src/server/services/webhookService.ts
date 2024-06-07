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

  /**
   * Posts data to a webhook
   * @param url - url of the webhook
   * @param data - object to send to the webhook
   * @param method - POST or PUT request, defaults to POST
   * @returns object with the property `reference` webhook if the response returns with a reference number. If the call fails, the reference will be 'UNKNOWN'.
   */
  async postRequest(
    url: string,
    data: object,
    method: "POST" | "PUT" = "POST"
  ) {
    this.logger.info(
      ["WebhookService", "postRequest body"],
      JSON.stringify(data)
    );
    let request = method === "POST" ? post : put;

    const { payload } = await request(url, {
      ...DEFAULT_OPTIONS,
      payload: JSON.stringify(data),
    });

    if (typeof payload === "object" && !Buffer.isBuffer(payload)) {
      return payload.reference;
    }

    try {
      let { result } = JSON.parse(payload);
      if (typeof result === "undefined") {
        result = JSON.parse(payload.toString());
      }

      this.logger.info(
        ["WebhookService", "postRequest"],
        `Webhook request to ${url} submitted OK`
      );
      this.logger.debug(
        ["WebhookService", "postRequest", `REF: ${result}`],
        JSON.stringify(result)
      );
      return result;
    } catch (error) {
      this.logger.error(["WebhookService", "postRequest"], error);
      return "UNKNOWN";
    }
  }
}
