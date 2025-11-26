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
   * @param sendAdditionalPayMetadata - whether to include additional metadata in the request
   * @returns object with the property `reference` webhook if the response returns with a reference number. If the call fails, the reference will be 'UNKNOWN'.
   */
  async postRequest(
    url: string,
    data: object,
    method: "POST" | "PUT" = "POST",
    sendAdditionalPayMetadata: boolean = false,
    authHeaders?: Record<string, string>
  ) {
    // Commented out due to potential for logging PII
    // this.logger.info(
    //   ["WebhookService", "postRequest body"],
    //   JSON.stringify(data)
    // );

    let request = method === "POST" ? post : put;
    try {
      if (!sendAdditionalPayMetadata) {
        delete data?.metadata?.pay;
      }
      const { payload, res } = await request(url, {
        ...DEFAULT_OPTIONS,
        headers: {
          ...DEFAULT_OPTIONS.headers,
          ...(authHeaders || {}),
        },
        payload: JSON.stringify(data),
      });

      if (typeof payload === "object" && !Buffer.isBuffer(payload)) {
        return payload.reference;
      }

      const Name = JSON.parse(payload)[0]?.Name;

      if (Name) {
        return Name;
      }

      this.logger.info(`Request status code: ${res.statusCode}`);

      const { reference } = JSON.parse(payload);

      this.logger.info(
        ["WebhookService", "postRequest"],
        `Webhook request to ${url} submitted OK`
      );
      // Commented out due to potential for logging PII
      // this.logger.debug(
      //   ["WebhookService", "postRequest", `REF: ${reference}`],
      //   JSON.stringify(payload)
      // );
      return reference;
    } catch (error) {
      this.logger.error(["WebhookService", "postRequest"], error);
      return "UNKNOWN";
    }
  }
}
