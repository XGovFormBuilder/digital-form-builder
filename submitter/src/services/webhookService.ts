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
   * @param ref - the reference being used in the submission
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
    try {
      const { payload } = await request(url, {
        ...DEFAULT_OPTIONS,
        payload: JSON.stringify(data),
      });

      const { reference } = JSON.parse(payload);

      this.logger.info(
        ["WebhookService", "postRequest"],
        `Webhook request to ${url} submitted OK`
      );
      this.logger.info(
        ["WebhookService", "postRequest", `url: ${url}`],
        payload
      );
      return reference ?? "UNKNOWN";
    } catch (error) {
      this.logger.error(["WebhookService", "postRequest"], error);
      return error as Error;
    }
  }
}
