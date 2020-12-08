import config from "../config";
import { get, postJson } from "./httpService";

export type FeeDetails = {
  description: string;
  amount: number;
  condition: string;
  multiplier: string; // this points to sectionName.fieldName
  multiplyBy?: number; // the value retrieved from multiplier field above (see summary page retrieveFees method)
};

export type Fees = {
  details: FeeDetails[];
  total: number;
  paymentReference?: string;
};

export class PayService {
  options(apiKey: string) {
    return {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
    };
  }

  payRequestData(
    amount: number,
    reference: string,
    description: string,
    returnUrl: string
  ) {
    return {
      amount,
      reference,
      description,
      return_url: returnUrl,
    };
  }

  async payRequest(
    amount: number,
    reference: string,
    description: string,
    apiKey: string,
    returnUrl: string
  ) {
    const data = {
      ...this.options(apiKey),
      payload: this.payRequestData(amount, reference, description, returnUrl),
    };
    const { payload } = await postJson(`${config.payApiUrl}/payments`, data);
    return payload;
  }

  async payStatus(url: string, apiKey: string) {
    const { payload } = await get(url, this.options(apiKey));
    return payload;
  }

  descriptionFromFees(fees: Fees): string {
    return fees.details
      .map((detail) => {
        const { multiplier, multiplyBy, description, amount } = detail;

        if (multiplier && multiplyBy) {
          return `${multiplyBy} x ${description}: £${
            (multiplyBy * amount) / 100
          }`;
        }

        return `${detail.description}: £${detail.amount / 100}`;
      })
      .join(", ");
  }
}
