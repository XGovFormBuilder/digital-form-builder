import { post } from "./httpService";

const DEFAULT_OPTIONS = {
  headers: {
    "content-type": "application/json",
  },
  timeout: 60000,
};

export class WebhookService {
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

    if (typeof payload === "object") {
      return payload.reference;
    }

    try {
      const { reference } = JSON.parse(payload);
      console.log("Webhook request submitted OK");
      console.log(
        "Received response payload " +
          JSON.stringify(payload) +
          "  with reference " +
          reference
      );
      return reference;
    } catch (error) {
      console.error(error);
      return "UNKNOWN";
    }
  }
}
