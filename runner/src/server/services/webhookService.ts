import { post } from "./httpService";
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
   * @params { string } url must be webhook with a POST endpoint which returns a webhookResponse object.
   * @returns { object } webhookResponse
   * @returns { string } webhookResponse.reference webhook should return with a reference number. If the call fails, the reference will be 'UNKNOWN'.
   */
  async postRequest(url: string, data: object) {
    const { payload } = await post(url, {
      ...DEFAULT_OPTIONS,
      payload: JSON.stringify(data),
    });

    if (typeof payload === "object" && !Buffer.isBuffer(payload)) {
      return payload.reference;
    }

    try {
      const { reference } = JSON.parse(payload);
      this.logger.info(
        ["WebhookService", "postRequest"],
        `Webhook request to ${url} submitted OK`
      );
      this.logger.debug(
        ["WebhookService", "postRequest", `REF: ${reference}`],
        JSON.stringify(payload)
      );
      return reference;
    } catch (error) {
      this.logger.error(["WebhookService", "postRequest"], error);
      return "UNKNOWN";
    }
  }
}
