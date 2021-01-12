import { payApiUrl } from "../config";
import Wreck from "@hapi/wreck";

export class PayService {
  options(apiKey) {
    return {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
    };
  }

  payRequestData(amount, reference, description, returnUrl) {
    return {
      amount,
      reference,
      description,
      return_url: returnUrl,
    };
  }

  async payRequest(amount, reference, description, apiKey, returnUrl) {
    const data = {
      ...this.options(apiKey),
      payload: this.payRequestData(amount, reference, description, returnUrl),
    };
    const { payload } = await Wreck.post(`${payApiUrl}/payments`, data);
    return JSON.parse(payload.toString());
  }

  async payStatus(url, apiKey) {
    const { payload } = await Wreck.get(url, this.options(apiKey));
    return JSON.parse(payload.toString());
  }

  descriptionFromFees(fees) {
    return fees.details
      .map((detail) => {
        if (detail.multiplier) {
          return `${detail.multiplyBy} x ${detail.description}: £${
            (detail.multiplyBy * detail.amount) / 100
          }`;
        }
        return `${detail.description}: £${detail.amount / 100}`;
      })
      .join(", ");
  }
}
